"use client";

import {
  Alarm,
  ArrowRight,
  Bell,
  BellRinging,
  BellSlash,
  DeviceMobile,
  Info,
  PaperPlaneTilt,
} from "@phosphor-icons/react/ssr";
import { useLearning, useLearningActions } from "@/hooks/use-learning";
import { usePushReminder } from "@/hooks/use-push-reminder";
import { STUDY_TIMES, remindTime } from "@/lib/study-schedule";
import { SelectMenu } from "@/components/ui/select-menu";
import { cn } from "@/lib/cn";

const TIME_OPTIONS = STUDY_TIMES.map((time) => ({ value: time, label: time }));

/** Thẻ nhắc học: công tắc bật/tắt Web Push trên thiết bị đang dùng, giờ học chung cho mọi kỹ năng và giờ nhắc suy ra từ đó. */
export function StudyReminder() {
  const { data } = useLearning();
  const { busyKey, setStudyTime } = useLearningActions();
  const { state, busy, enable, disable, sendTest } = usePushReminder();
  if (!data) return null;

  const on = state === "on";
  const usable = state === "on" || state === "off";
  let Icon = Bell;
  let title = "Bật nhắc học";
  let detail = "Nhận thông báo trước giờ học 15 phút";
  let hint: string | null = null;
  if (on) {
    Icon = BellRinging;
    title = "Nhắc học đang bật";
    detail = "Trên thiết bị này, trước giờ học 15 phút";
  }
  if (state === "denied") {
    Icon = BellSlash;
    title = "Thông báo đang bị chặn";
    detail = "Bật lại trong cài đặt trình duyệt";
    hint = "Bấm biểu tượng ổ khoá cạnh thanh địa chỉ → Thông báo → Cho phép, rồi tải lại trang.";
  }
  if (state === "install") {
    Icon = DeviceMobile;
    title = "Thêm Careelot ra màn hình chính";
    detail = "iPhone chỉ nhận nhắc học từ app đã cài";
    hint = "Trên iPhone: bấm Chia sẻ → \"Thêm vào MH chính\", mở app từ biểu tượng đó rồi bật nhắc học.";
  }
  if (state === "unsupported") {
    Icon = BellSlash;
    title = "Trình duyệt không hỗ trợ nhắc học";
    detail = "Dùng Chrome, Edge hoặc Firefox";
    hint = "Nhắc học chạy trên Chrome, Edge, Firefox ở máy tính hoặc Android.";
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-white",
        on ? "border-primary-200" : "border-slate-200",
      )}
    >
      <div className={cn("flex items-center gap-3 p-3", on ? "bg-primary-50" : "bg-slate-50")}>
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg border bg-white",
            on && "border-primary-200 text-primary-600",
            !on && usable && "border-slate-200 text-slate-500",
            !usable && "border-amber-200 text-amber-600",
          )}
        >
          <Icon className="size-4.5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="text-xs text-slate-500">{detail}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label={on ? "Tắt nhắc học" : "Bật nhắc học"}
          disabled={!usable || busy}
          onClick={() => void (on ? disable() : enable())}
          className={cn(
            "relative h-6 w-10 shrink-0 cursor-pointer rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-40",
            on ? "bg-primary-600" : "bg-slate-300",
          )}
        >
          <span
            className={cn(
              "absolute top-[3px] size-[18px] rounded-full bg-white shadow-sm transition-[left]",
              on ? "left-[19px]" : "left-[3px]",
            )}
          />
        </button>
      </div>

      <div className="flex items-center gap-2 border-t border-slate-100 p-3 text-sm text-slate-600">
        <SelectMenu
          label="Giờ học"
          value={data.studyTime}
          options={TIME_OPTIONS}
          disabled={busyKey === "study-time"}
          onChange={(next) => void setStudyTime(next)}
        />
        <ArrowRight className="size-3.5 text-slate-300" />
        <span className="inline-flex items-center gap-1 font-semibold text-primary-700">
          <Alarm className="size-4" />
          Nhắc lúc {remindTime(data.studyTime)}
        </span>
      </div>

      {hint ? (
        <p className="flex gap-2 border-t border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
          <Info className="mt-px size-4 shrink-0" />
          {hint}
        </p>
      ) : (
        <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2 text-xs text-slate-500">
          <span>Nhắc vào ngày học của từng kỹ năng</span>
          {on && (
            <button
              type="button"
              disabled={busy}
              onClick={() => void sendTest()}
              className="inline-flex cursor-pointer items-center gap-1 font-semibold text-primary-700 hover:text-primary-800"
            >
              <PaperPlaneTilt className="size-3.5" />
              Gửi thử
            </button>
          )}
        </div>
      )}
    </div>
  );
}
