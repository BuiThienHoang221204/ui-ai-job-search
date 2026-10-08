"use client";

import { PencilSimple, User } from "@phosphor-icons/react/ssr";
import { DashSection } from "@/components/dashboard/dash-section";
import { useProfile, useProfileUi } from "../use-profile";

const EDIT_BUTTON =
  "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-600 hover:border-primary-300 hover:text-primary-600";

/** Phần "Giới thiệu": đoạn tự giới thiệu và vài thông tin liên hệ; sửa trong modal. */
export function IdentitySection() {
  const { data: profile } = useProfile();
  const edit = useProfileUi((state) => state.edit);
  if (!profile) return null;

  const facts = [
    ["Nơi ở", [profile.location, profile.country].filter(Boolean).join(", ")],
    ["Điện thoại", profile.phone],
    ["Ngôn ngữ", profile.languages.join(", ")],
    ["Tình trạng", profile.employmentStatus],
  ];

  return (
    <DashSection
      title="Giới thiệu"
      icon={User}
      action={
        <button
          type="button"
          className={EDIT_BUTTON}
          onClick={() => edit({ kind: "basic" })}
        >
          <PencilSimple className="size-3.5" />
          Sửa
        </button>
      }
    >
      <p className="max-w-[68ch] text-sm text-slate-700">
        {profile.summary || (
          <span className="text-slate-400">
            Chưa có đoạn giới thiệu. AI dùng đoạn này làm mở đầu CV.
          </span>
        )}
      </p>
      <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
        {facts.map(([label, value]) => (
          <div key={label} className="flex gap-1">
            <dt>{label}</dt>
            <dd className="font-medium text-slate-700">{value || "—"}</dd>
          </div>
        ))}
      </dl>
    </DashSection>
  );
}
