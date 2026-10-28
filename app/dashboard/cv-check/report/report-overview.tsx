import { ArrowRight, Check } from "@phosphor-icons/react/ssr";
import { Card } from "@/components/ui/card";
import type { CvReview } from "@/types";

/** Điểm mạnh và điểm cần cải thiện của CV theo AI, hai cột. */
export function ReportOverview({ review }: { review: CvReview }) {
  const columns = [
    {
      title: "Điểm mạnh của CV",
      items: review.strengths,
      icon: <Check weight="bold" className="size-4 text-emerald-600" />,
    },
    {
      title: "Điểm cần cải thiện",
      items: review.improvements,
      icon: <ArrowRight weight="bold" className="size-4 text-amber-600" />,
    },
  ];
  return (
    <Card className="mt-3 grid md:grid-cols-2 md:divide-x md:divide-slate-200">
      {columns.map((column) => (
        <div
          key={column.title}
          className="border-b border-slate-200 px-5 py-4.5 last:border-b-0 md:border-b-0"
        >
          <p className="flex justify-between text-sm font-semibold text-slate-900">
            {column.title}
            <span className="font-normal text-slate-500">
              {column.items.length}
            </span>
          </p>
          <ul className="mt-2 space-y-2.5 text-sm text-slate-700">
            {column.items.map((item) => (
              <li
                key={item}
                className="grid grid-cols-[1.125rem_minmax(0,1fr)] gap-2"
              >
                <span className="mt-0.5">{column.icon}</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </Card>
  );
}
