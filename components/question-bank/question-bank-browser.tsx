"use client";

import { useState } from "react";
import { Briefcase, CaretDown, ChatCircleDots, TrendUp } from "@phosphor-icons/react/ssr";
import type {
  QuestionFacets,
  QuestionPage,
  QuestionSummary,
} from "@/services/question-bank";
import {
  QUESTION_PAGE_SIZE,
  useQuestionBank,
  type QuestionFilterOption,
} from "@/hooks/use-question-bank";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FilterChip } from "@/components/ui/filter-chip";
import { SelectMenu } from "@/components/ui/select-menu";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { Skeleton } from "@/components/ui/skeleton";
import { StickyRailAd } from "@/components/ads/ad-slot";
import { cn } from "@/utils";
import { QuestionAnswer } from "./question-answer";

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

/** Một dòng câu hỏi, bấm để mở phần đáp án. */
function QuestionRow({ question }: { question: QuestionSummary }) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="p-4">
      <button
        type="button"
        onClick={() => setOpen((was) => !was)}
        className="flex w-full items-start gap-3 text-left"
        aria-expanded={open}
      >
        <div className="flex-1 space-y-2">
          <p className="font-medium leading-snug">{question.text}</p>
          <div className="flex flex-wrap items-center gap-1.5">
            {question.industryName && (
              <Badge variant="info">{question.industryName}</Badge>
            )}
            {question.typeName && <Badge variant="outline">{question.typeName}</Badge>}
            {question.difficulty && (
              <span className="text-xs text-slate-500">
                {question.difficulty}
              </span>
            )}
          </div>
        </div>
        <CaretDown
          className={[
            "mt-1 size-4 shrink-0 text-slate-500 transition-transform",
            open ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {open && (
        <div className="mt-4 border-t pt-4">
          <QuestionAnswer question={question} />
        </div>
      )}
    </Card>
  );
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
  const [railOpen, setRailOpen] = useState(true);

  return (
    <div className="space-y-5">
      <Card className="space-y-4 p-4">
        <SearchInput
          value={bank.term}
          onChange={bank.setTerm}
          placeholder="Tìm trong nội dung câu hỏi…"
        />
        <div className="flex flex-wrap items-center gap-2">
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

          {bank.pending ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }, (_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : bank.page.items.length === 0 ? (
            <EmptyState
              title="Không có câu hỏi nào khớp"
              description="Thử bỏ bớt một bộ lọc, hoặc tìm bằng từ khoá ngắn hơn."
            />
          ) : (
            <div className="space-y-3">
              {bank.page.items.map((question) => (
                <QuestionRow key={question.id} question={question} />
              ))}
            </div>
          )}

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
            <StickyRailAd onEmpty={() => setRailOpen(false)} />
          </aside>
        )}
      </div>
    </div>
  );
}
