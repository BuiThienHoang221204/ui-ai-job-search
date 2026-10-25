"use client";

import Link from "next/link";
import { Alarm, ArrowRight, BellSlash } from "@phosphor-icons/react/ssr";
import { useLearning, useLearningActions } from "@/hooks/use-learning";
import { usePushPreferences } from "@/hooks/use-push-preferences";
import { usePushReminder } from "@/hooks/use-push-reminder";
import { STUDY_TIMES, remindTime } from "@/lib/study-schedule";
import { SelectMenu } from "@/components/ui/select-menu";

const TIME_OPTIONS = STUDY_TIMES.map((time) => ({ value: time, label: time }));

/** Giờ học chung cho mọi kỹ năng và giờ nhắc suy ra từ đó; bật/tắt nhắc học nằm ở Tài khoản → Thông báo. */
export function StudyReminder() {
  const { data } = useLearning();
  const { busyKey, setStudyTime } = useLearningActions();
  const device = usePushReminder();
  const preferences = usePushPreferences();
  if (!data) return null;

  const on = device.state === "on" && preferences.data?.studyReminders === true;

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center gap-2 p-3 text-sm text-slate-600">
        <SelectMenu
          label="Giờ học"
          value={data.studyTime}
          options={TIME_OPTIONS}
          disabled={busyKey === "study-time"}
          onChange={(next) => void setStudyTime(next)}
        />
        {on && (
          <>
            <ArrowRight className="size-3.5 text-slate-300" />
            <span className="text-primary-700 inline-flex items-center gap-1 font-semibold">
              <Alarm className="size-4" />
              Nhắc lúc {remindTime(data.studyTime)}
            </span>
          </>
        )}
        {!on && (
          <span className="inline-flex items-center gap-1 text-slate-400">
            <BellSlash className="size-4" />
            Nhắc học đang tắt
          </span>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-3 py-2 text-xs text-slate-500">
        <span>Chỉ nhắc vào ngày học</span>
        <Link
          href="/dashboard/settings"
          className="text-primary-700 hover:text-primary-800 shrink-0 font-semibold"
        >
          {on ? "Bật/tắt ở Tài khoản →" : "Bật ở Tài khoản →"}
        </Link>
      </div>
    </div>
  );
}
