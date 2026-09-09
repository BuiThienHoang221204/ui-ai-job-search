"use client";

import { useEffect, useState, useTransition } from "react";
import { Briefcase, CaretDown, ChatCircleDots, TrendUp } from "@phosphor-icons/react/ssr";
import {
  questionBankService,
  type QuestionFacets,
  type QuestionPage,
  type QuestionSummary,
} from "@/services/question-bank";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FilterChip } from "@/components/ui/filter-chip";
import { SelectMenu } from "@/components/ui/select-menu";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { Skeleton } from "@/components/ui/skeleton";
import { QuestionAnswer } from "./question-answer";

const PAGE_SIZE = 20;

type Option = { code: string; name: string; count: number };

/** Mục "tất cả" luôn đứng đầu, rồi tới từng lựa chọn kèm số câu. */
function menuOptions(options: Option[], allLabel: string) {
  return [
    { value: "", label: allLabel },
    ...options.map((o) => ({
      value: o.code,
      label: o.name,
      hint: `${o.count.toLocaleString("vi-VN")} câu`,
    })),
  ];
}

function labelOf(options: Option[], code: string | null): string {
  return options.find((o) => o.code === code)?.name ?? code ?? "";
}

/**
 * Mục đang chọn PHẢI luôn hiện ra, kể cả khi số đếm của nó rơi về 0 sau khi bật
 * thêm một bộ lọc khác. Không có nó thì cái chip đang bật biến mất và người dùng
 * không còn đường bỏ chọn — kẹt luôn ở một bộ lọc rỗng.
 */
function withSelected(options: Option[], value: string | null, fallback: Option[]): Option[] {
  if (!value || options.some((o) => o.code === value)) return options;
  const known = fallback.find((o) => o.code === value);
  return [...options, { code: value, name: known?.name ?? value, count: 0 }];
}

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

export function QuestionBankBrowser({
  facets: initialFacets,
  initial,
}: {
  facets: QuestionFacets;
  initial: QuestionPage;
}) {
  const [term, setTerm] = useState("");
  const [industry, setIndustry] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [page, setPage] = useState<QuestionPage>(initial);
  const [facets, setFacets] = useState<QuestionFacets>(initialFacets);
  const [pending, startTransition] = useTransition();

  /**
   * Lọc và tìm kiếm chạy trên SERVER, không lọc trong bộ nhớ.
   *
   * Ngân hàng có hơn năm nghìn câu; tải hết về trình duyệt rồi lọc tại chỗ sẽ
   * ngốn vài MB mỗi lần mở trang, và số đếm trên thanh lọc vẫn phải hỏi server.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      startTransition(async () => {
        const filters = {
          industry: industry ?? undefined,
          type: type ?? undefined,
          difficulty: difficulty ?? undefined,
          q: term.trim() || undefined,
        };
        // Số đếm trên thanh lọc phải đi CÙNG danh sách, nếu không chúng đứng yên
        // ở con số của toàn kho và trông như bị tính sai.
        const [nextPage, nextFacets] = await Promise.all([
          questionBankService.browse({ ...filters, limit: PAGE_SIZE, offset }),
          questionBankService.browseFacets(filters),
        ]);
        setPage(nextPage);
        setFacets(nextFacets);
      });
    }, 250);
    return () => clearTimeout(timer);
  }, [term, industry, type, difficulty, offset]);

  function change<T>(setter: (next: T) => void) {
    return (next: T) => {
      setter(next);
      setOffset(0);
    };
  }

  function clearAll() {
    setIndustry(null);
    setType(null);
    setDifficulty(null);
    setOffset(0);
  }

  const industryOptions = withSelected(
    facets.industries,
    industry,
    initialFacets.industries,
  );
  const typeOptions = withSelected(facets.types, type, initialFacets.types);
  const difficultyOptions = withSelected(
    facets.difficulties.map((d) => ({ code: d.name, name: d.name, count: d.count })),
    difficulty,
    initialFacets.difficulties.map((d) => ({ code: d.name, name: d.name, count: d.count })),
  );

  const activeCount = [industry, type, difficulty].filter(Boolean).length;

  return (
    <div className="space-y-5">
      <Card className="space-y-4 p-4">
        <SearchInput
          value={term}
          onChange={change(setTerm)}
          placeholder="Tìm trong nội dung câu hỏi…"
        />
        <div className="flex flex-wrap items-center gap-2">
          <SelectMenu
            label="Mọi ngành nghề"
            icon={Briefcase}
            value={industry ?? ""}
            onChange={(next) => change(setIndustry)(next || null)}
            options={menuOptions(industryOptions, "Mọi ngành nghề")}
            searchPlaceholder="Tìm ngành nghề…"
          />
          <SelectMenu
            label="Mọi loại câu hỏi"
            icon={ChatCircleDots}
            value={type ?? ""}
            onChange={(next) => change(setType)(next || null)}
            options={menuOptions(typeOptions, "Mọi loại câu hỏi")}
          />
          <SelectMenu
            label="Mọi độ khó"
            icon={TrendUp}
            value={difficulty ?? ""}
            onChange={(next) => change(setDifficulty)(next || null)}
            options={menuOptions(difficultyOptions, "Mọi độ khó")}
          />
        </div>

        {activeCount > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {industry && (
              <FilterChip
                label={`Ngành nghề: ${labelOf(industryOptions, industry)}`}
                onRemove={() => change(setIndustry)(null)}
              />
            )}
            {type && (
              <FilterChip
                label={`Loại: ${labelOf(typeOptions, type)}`}
                onRemove={() => change(setType)(null)}
              />
            )}
            {difficulty && (
              <FilterChip
                label={`Độ khó: ${difficulty}`}
                onRemove={() => change(setDifficulty)(null)}
              />
            )}
            <Button variant="ghost" size="sm" onClick={clearAll}>
              Bỏ chọn tất cả
            </Button>
          </div>
        )}
      </Card>

      <p className="text-sm text-slate-500">
        {page.total.toLocaleString("vi-VN")} câu hỏi khớp bộ lọc
      </p>

      {pending ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : page.items.length === 0 ? (
        <EmptyState
          title="Không có câu hỏi nào khớp"
          description="Thử bỏ bớt một bộ lọc, hoặc tìm bằng từ khoá ngắn hơn."
        />
      ) : (
        <div className="space-y-3">
          {page.items.map((question) => (
            <QuestionRow key={question.id} question={question} />
          ))}
        </div>
      )}

      <Pagination
        total={page.total}
        limit={PAGE_SIZE}
        offset={offset}
        onOffsetChange={setOffset}
        noun="câu hỏi"
        disabled={pending}
      />
    </div>
  );
}
