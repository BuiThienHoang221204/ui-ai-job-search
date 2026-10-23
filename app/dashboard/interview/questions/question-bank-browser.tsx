"use client";

import { useState } from "react";
import { Briefcase, ChatCircleDots, TrendUp } from "@phosphor-icons/react/ssr";
import { QUESTION_PAGE_SIZE, useQuestionBank } from "@/hooks/use-question-bank";
import { Button } from "@/components/ui/button";
import { FilterChip } from "@/components/ui/filter-chip";
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
  const [railOpen, setRailOpen] = useState(() => pickOffer(AFFILIATE_OFFERS, "question-bank") !== null);

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
              {bank.page.items.map((question, index) => (
                <QuestionRow key={question.id} question={question} number={bank.offset + index + 1} />
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
            <SponsoredRailCard onClose={() => setRailOpen(false)} />
          </aside>
        )}
      </div>
    </div>
  );
}
