"use client";

import { Input, Label } from "@/components/ui/form";
import { SelectMenu } from "@/components/ui/select-menu";
import { cn, parseMonthlySalary } from "@/utils";
import {
  COMMUTE_OPTIONS,
  REMOTE_OPTIONS,
  WORK_PERMIT_OPTIONS,
} from "../profile-config";
import { useProfile, useSaveProfile } from "../use-profile";
import { Question } from "./career-section";

const money = (value: number | null) =>
  value ? value.toLocaleString("vi-VN") : "";

/** Danh sách lựa chọn, thêm giá trị đang lưu nếu nó không nằm trong danh sách (dữ liệu cũ gõ tay). */
const asOptions = (options: string[]) =>
  options.map((option) => ({ value: option, label: option }));

const withCurrent = (options: string[], current: string | null) =>
  current && !options.includes(current) ? [current, ...options] : options;

/** Hình thức làm việc, lương, đi lại và giấy tờ; mỗi ô lưu ngay khi đổi. */
export function ConditionsSection() {
  const { data: profile } = useProfile();
  const { save } = useSaveProfile();
  if (!profile) return null;

  const saveSalary = (key: "currentSalary" | "expectedSalary", raw: string) => {
    const value = parseMonthlySalary(raw);
    if (value !== profile[key]) void save({ [key]: value });
  };

  return (
    <>
      <Question
        id="q-remote"
        title="Bạn muốn làm theo hình thức nào?"
        hint={`AI so với nơi ở hiện tại của bạn (${profile.location || "chưa điền"}). Tin ở nơi khác vẫn hiện trong danh sách.`}
        answered={Boolean(profile.remotePreference)}
      >
        <div className="flex flex-wrap gap-1.5">
          {withCurrent(REMOTE_OPTIONS, profile.remotePreference).map(
            (option) => (
              <button
                key={option}
                type="button"
                aria-pressed={profile.remotePreference === option}
                onClick={() => void save({ remotePreference: option })}
                className={cn(
                  "h-8 cursor-pointer rounded-lg border px-3 text-sm",
                  profile.remotePreference === option
                    ? "border-primary-500 bg-primary-50 font-semibold text-primary-700"
                    : "border-slate-200 text-slate-600 hover:border-primary-300",
                )}
              >
                {option}
              </button>
            ),
          )}
        </div>
      </Question>

      <Question
        id="q-salary"
        title="Mức lương của bạn?"
        hint="Dùng cho phần gợi ý lương ở trang chi tiết tin. Nhà tuyển dụng không thấy."
        answered={profile.expectedSalary !== null}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="p-current-salary">
              Lương hiện tại / tháng (VND)
            </Label>
            <Input
              id="p-current-salary"
              key={`c-${profile.currentSalary}`}
              defaultValue={money(profile.currentSalary)}
              placeholder="25.000.000"
              inputMode="numeric"
              onBlur={(event) =>
                saveSalary("currentSalary", event.target.value)
              }
            />
          </div>
          <div>
            <Label htmlFor="p-expected-salary">Mong muốn / tháng (VND)</Label>
            <Input
              id="p-expected-salary"
              key={`e-${profile.expectedSalary}`}
              defaultValue={money(profile.expectedSalary)}
              placeholder="35.000.000"
              inputMode="numeric"
              onBlur={(event) =>
                saveSalary("expectedSalary", event.target.value)
              }
            />
          </div>
        </div>
      </Question>

      <Question
        id="q-move"
        title="Đi lại và giấy tờ"
        hint="AI dùng quốc tịch và giấy phép lao động để kiểm bạn có đủ điều kiện ứng tuyển không."
        answered={Boolean(profile.citizenship)}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="p-citizenship">Quốc tịch</Label>
            <Input
              id="p-citizenship"
              key={`n-${profile.citizenship}`}
              defaultValue={profile.citizenship ?? ""}
              placeholder="Việt Nam"
              onBlur={(event) => {
                const value = event.target.value.trim();
                if (value !== (profile.citizenship ?? ""))
                  void save({ citizenship: value });
              }}
            />
          </div>
          <div>
            <Label htmlFor="p-work-permit">Giấy phép lao động</Label>
            <SelectMenu
              id="p-work-permit"
              variant="field"
              label="Chưa chọn"
              value={profile.workPermit ?? ""}
              options={asOptions(
                withCurrent(WORK_PERMIT_OPTIONS, profile.workPermit),
              )}
              onChange={(next) => void save({ workPermit: next })}
            />
          </div>
          <div>
            <Label htmlFor="p-commute">Thời gian đi lại tối đa</Label>
            <SelectMenu
              id="p-commute"
              variant="field"
              label="Chưa chọn"
              value={profile.commuteConstraint ?? ""}
              options={asOptions(
                withCurrent(COMMUTE_OPTIONS, profile.commuteConstraint),
              )}
              onChange={(next) => void save({ commuteConstraint: next })}
            />
          </div>
          <label className="flex items-center gap-2 self-end pb-2.5 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={profile.willingToRelocate}
              onChange={(event) =>
                void save({ willingToRelocate: event.target.checked })
              }
              className="size-4 accent-primary-600"
            />
            Sẵn sàng chuyển tới thành phố khác
          </label>
        </div>
      </Question>
    </>
  );
}
