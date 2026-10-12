import { CheckCircle, Warning } from "@phosphor-icons/react/ssr";
import { Card } from "@/components/ui/card";
import { cn } from "@/utils";
import { useJobDetail } from "@/hooks/use-job-detail";

const COLUMNS = [
  {
    key: "strengths",
    title: "Điểm mạnh",
    icon: CheckCircle,
    titleClassName: "text-emerald-700",
    iconClassName: "text-emerald-500",
  },
  {
    key: "gaps",
    title: "Cần lưu ý",
    icon: Warning,
    titleClassName: "text-amber-700",
    iconClassName: "text-amber-500",
  },
] as const;

/** Nhận xét của AI: điểm mạnh và điểm cần lưu ý đặt cạnh nhau để so một lượt. */
export function MatchInsights({ jobId }: { jobId: string }) {
  const match = useJobDetail(jobId).data?.match;
  if (!match || match.strengths.length + match.gaps.length === 0) return null;
  const items = { strengths: match.strengths, gaps: match.gaps };

  return (
    <Card className="p-5">
      <h3 className="mb-3 text-base font-semibold text-slate-900">
        Nhận xét của AI
      </h3>
      <div className="grid gap-5 md:grid-cols-2 md:gap-7">
        {COLUMNS.filter((column) => items[column.key].length > 0).map(
          (column) => {
            const Mark = column.icon;
            return (
              <div key={column.key}>
                <p
                  className={cn("text-sm font-semibold", column.titleClassName)}
                >
                  {column.title}
                  <span className="font-normal text-slate-400">
                    {" "}
                    · {items[column.key].length}
                  </span>
                </p>
                <ul className="divide-y divide-slate-100">
                  {items[column.key].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 py-2.5 text-sm leading-relaxed text-slate-700"
                    >
                      <Mark
                        className={cn(
                          "mt-0.5 size-5 shrink-0",
                          column.iconClassName,
                        )}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          },
        )}
      </div>
    </Card>
  );
}
