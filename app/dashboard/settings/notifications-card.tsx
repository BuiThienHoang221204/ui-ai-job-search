"use client";

import Link from "next/link";
import {
  Alarm,
  Bell,
  BellRinging,
  BellSlash,
  Briefcase,
  DeviceMobile,
  Info,
  PaperPlaneTilt,
} from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { Switch } from "@/components/ui/switch";
import { useLearning } from "@/hooks/use-learning";
import { usePushPreferences } from "@/hooks/use-push-preferences";
import { usePushReminder } from "@/hooks/use-push-reminder";
import { remindTime } from "@/lib/study-schedule";
import { cn } from "@/lib/cn";

/** Mục "Thông báo": bật thiết bị một lần, rồi bật/tắt riêng từng loại thông báo. */
export function NotificationsCard() {
  const device = usePushReminder();
  const preferences = usePushPreferences();
  const learning = useLearning();

  const on = device.state === "on";
  const usable = device.state === "on" || device.state === "off";
  let Icon = Bell;
  let title = "Bật thông báo trên thiết bị này";
  let detail = "Trình duyệt sẽ hỏi quyền gửi thông báo";
  let hint: string | null = null;
  if (on) {
    Icon = BellRinging;
    title = "Thiết bị này đang nhận thông báo";
    detail = "Điện thoại, máy tính khác cần bật riêng";
  }
  if (device.state === "denied") {
    Icon = BellSlash;
    title = "Thông báo đang bị chặn";
    detail = "Bật lại trong cài đặt trình duyệt";
    hint =
      "Bấm biểu tượng ổ khoá cạnh thanh địa chỉ → Thông báo → Cho phép, rồi tải lại trang.";
  }
  if (device.state === "install") {
    Icon = DeviceMobile;
    title = "Thêm Careelot ra màn hình chính";
    detail = "iPhone chỉ nhận thông báo từ app đã cài";
    hint =
      'Trên iPhone: bấm Chia sẻ → "Thêm vào MH chính", mở app từ biểu tượng đó rồi bật.';
  }
  if (device.state === "unsupported") {
    Icon = BellSlash;
    title = "Trình duyệt không hỗ trợ thông báo";
    detail = "Dùng Chrome, Edge hoặc Firefox";
    hint = "Thông báo chạy trên Chrome, Edge, Firefox ở máy tính hoặc Android.";
  }

  let studyDetail = "Vào ngày học của từng kỹ năng";
  if (learning.data) {
    studyDetail = `Nhắc lúc ${remindTime(learning.data.studyTime)} (giờ học ${learning.data.studyTime}), vào ngày học của từng kỹ năng`;
  }
  const studyOn = on && preferences.data?.studyReminders === true;
  const jobsOn = on && preferences.data?.jobNotifications === true;
  const typesDisabled = !on || preferences.busy;

  return (
    <SectionCard
      icon={Bell}
      title="Thông báo"
      description="Bật thiết bị một lần, rồi chọn loại thông báo muốn nhận."
    >
      <div
        className={cn(
          "overflow-hidden rounded-xl border",
          on && "border-primary-200",
          !on && usable && "border-slate-200",
          !usable && "border-amber-200",
        )}
      >
        <div
          className={cn(
            "flex items-center gap-3 p-3",
            on ? "bg-primary-50" : "bg-slate-50",
          )}
        >
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
          {on && (
            <Button
              variant="outline"
              size="sm"
              aria-label="Gửi thử"
              disabled={device.busy}
              onClick={() => void device.sendTest()}
            >
              <PaperPlaneTilt className="size-3.5" />
              <span className="hidden sm:inline">Gửi thử</span>
            </Button>
          )}
          <Switch
            checked={on}
            label={
              on
                ? "Tắt thông báo trên thiết bị này"
                : "Bật thông báo trên thiết bị này"
            }
            disabled={!usable || device.busy}
            onChange={() => void (on ? device.disable() : device.enable())}
          />
        </div>
        {hint && (
          <p className="flex gap-2 border-t border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
            <Info className="mt-px size-4 shrink-0" />
            {hint}
          </p>
        )}
      </div>

      <div className="mt-2 divide-y divide-slate-100">
        <div className="flex items-center gap-3 py-3">
          <Alarm className="size-5 shrink-0 text-slate-500" />
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "text-sm font-semibold",
                on ? "text-slate-900" : "text-slate-400",
              )}
            >
              Nhắc học
            </p>
            <p
              className={cn(
                "text-xs",
                on ? "text-slate-500" : "text-slate-400",
              )}
            >
              {on ? studyDetail : "Bật thiết bị ở trên trước"}
              {on && (
                <>
                  {" · "}
                  <Link
                    href="/dashboard/upskill"
                    className="text-primary-700 hover:text-primary-800 font-semibold"
                  >
                    Đổi giờ ở Lộ trình học
                  </Link>
                </>
              )}
            </p>
          </div>
          <Switch
            checked={studyOn}
            label={studyOn ? "Tắt nhắc học" : "Bật nhắc học"}
            disabled={typesDisabled}
            onChange={() => void preferences.set({ studyReminders: !studyOn })}
          />
        </div>
        <div className="flex items-center gap-3 py-3">
          <Briefcase className="size-5 shrink-0 text-slate-500" />
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "text-sm font-semibold",
                on ? "text-slate-900" : "text-slate-400",
              )}
            >
              Thông báo tìm việc
            </p>
            <p
              className={cn(
                "text-xs",
                on ? "text-slate-500" : "text-slate-400",
              )}
            >
              {on
                ? "07:30 mỗi sáng báo tin mới hợp với bạn"
                : "Bật thiết bị ở trên trước"}
            </p>
          </div>
          <Switch
            checked={jobsOn}
            label={jobsOn ? "Tắt thông báo tìm việc" : "Bật thông báo tìm việc"}
            disabled={typesDisabled}
            onChange={() => void preferences.set({ jobNotifications: !jobsOn })}
          />
        </div>
      </div>
    </SectionCard>
  );
}
