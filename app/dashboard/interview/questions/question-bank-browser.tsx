"use client";

import { useState, type ReactNode } from "react";
import {
  Briefcase,
  CaretDown,
  ChatCircleDots,
  Funnel,
  TrendUp,
} from "@phosphor-icons/react/ssr";
import { QUESTION_PAGE_SIZE, useQuestionBank } from "@/hooks/use-question-bank";
import { Button } from "@/components/ui/button";
import { FilterChip } from "@/components/ui/filter-chip";
import {
  BottomSheet,
  SheetChip,
  SheetSection,
} from "@/components/ui/bottom-sheet";
import { SelectMenu } from "@/components/ui/select-menu";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { Skeleton } from "@/components/ui/skeleton";
import { SponsoredRailCard } from "@/components/ads/affiliate-inline";
import { AFFILIATE_OFFERS, pickOffer } from "@/lib/affiliate";
import { QuestionRow } from "./question-row";
import { cn } from "@/lib/cn";
import type {
  QuestionFacets,
  QuestionPage,
  QuestionFilterOption,
} from "@/types";

/** Mục "tất cả" luôn đứng đầu, rồi tới từng lựa chọn kèm số câu. */
function menuOptions(options: QuestionFilterOption[], allLabel: string) {
  return [
    { value: "", label: allLabel },
    ...options.map((o) => ({
      value: o.code,
      label: o.name,
      hint: `${o.count.toLocaleString("vi-VN")} câu`,
    })),
  ];
}

/** Tìm tên hiển thị của một mã trong danh sách lựa chọn. */
function labelOf(options: QuestionFilterOption[], code: string | null): string {
  return options.find((o) => o.code === code)?.name ?? code ?? "";
}

/** Trình duyệt ngân hàng câu hỏi: bộ lọc full width, bên dưới là danh sách và cột quảng cáo bên phải. */
export function QuestionBankBrowser({
  facets: initialFacets,
  initial,
}: {
  facets: QuestionFacets;
  initial: QuestionPage;
}) {
  const bank = useQuestionBank(initialFacets, initial);
  const [railOpen, setRailOpen] = useState(
    () => pickOffer(AFFILIATE_OFFERS, "question-bank") !== null,
  );
  const [sheetOpen, setSheetOpen] = useState(false);

  let results: ReactNode;
  if (bank.pending) {
    results = (
      <div className="space-y-3">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  } else if (bank.page.items.length === 0) {
    results = (
      <EmptyState
        title="Không có câu hỏi nào khớp"
        description="Thử bỏ bớt một bộ lọc, hoặc tìm bằng từ khoá ngắn hơn."
      />
    );
  } else {
    results = (
      <div className="space-y-3">
        {bank.page.items.map((question, index) => (
          <QuestionRow
            key={question.id}
            question={question}
            number={bank.offset + index + 1}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Card className="space-y-4 p-4">
        <SearchInput
          value={bank.term}
          onChange={bank.setTerm}
          placeholder="Tìm trong nội dung câu hỏi…"
        />
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="flex h-10 w-full items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-700 shadow-sm sm:hidden"
        >
          <Funnel className="size-4.5 shrink-0 text-slate-400" />
          Bộ lọc
          {bank.activeCount > 0 && (
            <span className="bg-primary-100 text-primary-700 rounded-full px-1.5 text-xs font-semibold">
              {bank.activeCount}
            </span>
          )}
          <CaretDown className="ml-auto size-4.5 shrink-0 text-slate-400" />
        </button>

        <div className="hidden flex-wrap items-center gap-2 sm:flex">
          <SelectMenu
            label="Mọi ngành nghề"
            icon={Briefcase}
            value={bank.industry ?? ""}
            onChange={(next) => bank.setIndustry(next || null)}
            options={menuOptions(bank.industryOptions, "Mọi ngành nghề")}
            searchPlaceholder="Tìm ngành nghề…"
          />
          <SelectMenu
            label="Mọi loại câu hỏi"
            icon={ChatCircleDots}
            value={bank.type ?? ""}
            onChange={(next) => bank.setType(next || null)}
            options={menuOptions(bank.typeOptions, "Mọi loại câu hỏi")}
          />
          <SelectMenu
            label="Mọi độ khó"
            icon={TrendUp}
            value={bank.difficulty ?? ""}
            onChange={(next) => bank.setDifficulty(next || null)}
            options={menuOptions(bank.difficultyOptions, "Mọi độ khó")}
          />
        </div>

        {sheetOpen && (
          <BottomSheet
            title="Bộ lọc câu hỏi"
            onClose={() => setSheetOpen(false)}
            footer={
              <div className="flex gap-2.5">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={bank.clearFilters}
                >
                  Xoá lọc
                </Button>
                <Button
                  className="flex-[2]"
                  onClick={() => setSheetOpen(false)}
                >
                  Xong
                </Button>
              </div>
            }
          >
            <QGroup
              title="Ngành nghề"
              options={bank.industryOptions}
              value={bank.industry}
              onSelect={bank.setIndustry}
            />
            <QGroup
              title="Loại câu hỏi"
              options={bank.typeOptions}
              value={bank.type}
              onSelect={bank.setType}
            />
            <QGroup
              title="Độ khó"
              options={bank.difficultyOptions}
              value={bank.difficulty}
              onSelect={bank.setDifficulty}
            />
          </BottomSheet>
        )}

        {bank.activeCount > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {bank.industry && (
              <FilterChip
                label={`Ngành nghề: ${labelOf(bank.industryOptions, bank.industry)}`}
                onRemove={() => bank.setIndustry(null)}
              />
            )}
            {bank.type && (
              <FilterChip
                label={`Loại: ${labelOf(bank.typeOptions, bank.type)}`}
                onRemove={() => bank.setType(null)}
              />
            )}
            {bank.difficulty && (
              <FilterChip
                label={`Độ khó: ${bank.difficulty}`}
                onRemove={() => bank.setDifficulty(null)}
              />
            )}
            <Button variant="ghost" size="sm" onClick={bank.clearFilters}>
              Bỏ chọn tất cả
            </Button>
          </div>
        )}
      </Card>

      <div
        className={cn(
          "grid items-start gap-6",
          railOpen && "xl:grid-cols-[minmax(0,1fr)_300px]",
        )}
      >
        <div className="min-w-0 space-y-5">
          <p className="text-sm text-slate-500">
            {bank.page.total.toLocaleString("vi-VN")} câu hỏi khớp bộ lọc
          </p>

          {results}

          <Pagination
            total={bank.page.total}
            limit={QUESTION_PAGE_SIZE}
            offset={bank.offset}
            onOffsetChange={bank.setOffset}
            noun="câu hỏi"
            disabled={bank.pending}
          />
        </div>
        {railOpen && (
          <aside className="hidden self-stretch xl:block">
            <SponsoredRailCard onClose={() => setRailOpen(false)} />
          </aside>
        )}
      </div>
    </div>
  );
}

function QGroup({
  title,
  options,
  value,
  onSelect,
}: {
  title: string;
  options: QuestionFilterOption[];
  value: string | null;
  onSelect: (code: string | null) => void;
}) {
  return (
    <SheetSection title={title}>
      <SheetChip active={value === null} onClick={() => onSelect(null)}>
        Tất cả
      </SheetChip>
      {options.map((o) => (
        <SheetChip
          key={o.code}
          active={value === o.code}
          onClick={() => onSelect(o.code)}
        >
          {o.name}
        </SheetChip>
      ))}
    </SheetSection>
  );
}
