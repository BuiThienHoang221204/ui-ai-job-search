"use client";

import { ArrowSquareOut, CalendarPlus, Check, X } from "@phosphor-icons/react/ssr";
import { useLearningActions } from "@/hooks/use-learning";
import { WEEK_DAYS, downloadIcs, googleCalendarUrl } from "@/lib/learning-calendar";
import { hostOf, resourcesFor } from "@/lib/learning-resources";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { LearningItem, WeekDay } from "@/types";
import { cn } from "@/lib/cn";

const milestones = (skill: string) => [
  `Học nền tảng ${skill} (~1 tuần)`,
  `Làm một dự án nhỏ có dùng ${skill}`,
  `Thêm ${skill} vào hồ sơ và CV`,
];

/** Một kỹ năng trong kế hoạch: ba mốc đánh dấu được, ngày học trong tuần, thêm vào lịch, tài liệu chính thức. */
export function LearningPlanItem({ item }: { item: LearningItem }) {
  const { busyKey, update, remove } = useLearningActions();
  const busy = busyKey === item.skillKey;
  const done = item.status === "DONE";
  const doneCount = item.steps.filter(Boolean).length;
  const { docs, searchUrl } = resourcesFor(item.skillName);

  const toggleStep = (index: number) =>
    void update(item, { steps: item.steps.map((step, i) => (i === index ? !step : step)) });

  const toggleDay = (day: WeekDay) =>
    void update(item, {
      days: item.days.includes(day) ? item.days.filter((d) => d !== day) : [...item.days, day],
    });

  return (
    <div
      id={`plan-${encodeURIComponent(item.skillKey)}`}
      className={cn(
        "scroll-mt-6 space-y-3 rounded-xl border p-3.5",
        done ? "border-emerald-200 bg-emerald-50/60" : "border-slate-200/80",
      )}
    >
      <div className="flex items-center gap-2">
        <p className="font-semibold text-slate-900">{item.skillName}</p>
        <Badge variant={done ? "success" : "primary"}>{doneCount}/3 mốc</Badge>
        <button
          type="button"
          onClick={() => void remove(item.skillKey)}
          disabled={busy}
          aria-label={`Thôi học ${item.skillName}`}
          title="Thôi học kỹ năng này"
          className="ml-auto cursor-pointer rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="size-4" />
        </button>
      </div>

      <Progress
        value={Math.max((doneCount / 3) * 100, 4)}
        className="h-1.5"
        barClassName={done ? "bg-emerald-500" : undefined}
      />

      <div className="space-y-1.5">
        {milestones(item.skillName).map((label, index) => (
          <button
            key={label}
            type="button"
            disabled={busy}
            onClick={() => toggleStep(index)}
            className={cn(
              "flex w-full cursor-pointer items-start gap-2 text-left text-sm",
              item.steps[index] ? "text-slate-400 line-through" : "text-slate-700",
            )}
          >
            <span
              className={cn(
                "mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded border-[1.5px]",
                item.steps[index] ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300",
              )}
            >
              {item.steps[index] && <Check className="size-3" weight="bold" />}
            </span>
            {label}
          </button>
        ))}
      </div>

      {done ? (
        <p className="text-xs text-emerald-700">
          Xong! {item.skillName} đã có trong hồ sơ của bạn.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-1 text-xs text-slate-500">
            <span className="mr-1">Học vào:</span>
            {WEEK_DAYS.map((day) => (
              <button
                key={day.value}
                type="button"
                disabled={busy}
                onClick={() => toggleDay(day.value)}
                aria-pressed={item.days.includes(day.value)}
                className={cn(
                  "h-6.5 min-w-7.5 cursor-pointer rounded-full border px-1.5 text-xs",
                  item.days.includes(day.value)
                    ? "border-primary-600 bg-primary-600 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                )}
              >
                {day.label}
              </button>
            ))}
          </div>

          {item.days.length > 0 ? (
            <div className="space-y-2 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600">
              <p>
                Học {item.skillName} vào{" "}
                {WEEK_DAYS.filter((day) => item.days.includes(day.value))
                  .map((day) => day.label)
                  .join(", ")}{" "}
                hằng tuần, lúc 20:00
              </p>
              <div className="flex flex-wrap gap-1.5">
                <a
                  href={googleCalendarUrl(item.skillName, item.days, new Date())}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="sm" variant="outline">
                    <CalendarPlus className="size-4" />
                    Google Calendar
                  </Button>
                </a>
                <Button size="sm" variant="ghost" onClick={() => downloadIcs(item.skillName, item.days)}>
                  Tải file .ics
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">Chọn ngày để thêm buổi học vào lịch của bạn.</p>
          )}

          <div className="space-y-1 text-xs">
            {docs.map((doc) => (
              <a
                key={doc.url}
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-1.5 text-primary-800 hover:underline"
              >
                <ArrowSquareOut className="mt-0.5 size-3.5" />
                <span>{doc.title}</span>
                <span className="col-start-2 text-slate-500">{hostOf(doc.url)}</span>
              </a>
            ))}
            {docs.length === 0 && (
              <a
                href={searchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-primary-800 hover:underline"
              >
                <ArrowSquareOut className="size-3.5" />
                Tìm tài liệu chính thức cho {item.skillName}
              </a>
            )}
          </div>
        </>
      )}
    </div>
  );
}
