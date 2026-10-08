"use client";

import { useState } from "react";
import { Sparkle, X } from "@phosphor-icons/react/ssr";
import { DashSection } from "@/components/dashboard/dash-section";
import { cn } from "@/utils";
import { useDashboard } from "../../use-dashboard";
import { useProfile, useSaveProfile } from "../use-profile";

const TONES = {
  main: "border-primary-200 bg-primary-50 text-primary-700",
  plain: "border-slate-200 bg-white text-slate-700",
  gap: "border-dashed border-amber-300 bg-white text-amber-700",
  no: "border-rose-200 bg-rose-50 text-rose-700",
};

/** Danh sách chip thêm/bỏ tại chỗ; `options` là gợi ý bấm một lần để thêm. */
export function TagPicker({
  value,
  onChange,
  options = [],
  tone = "plain",
  placeholder = "+ Thêm",
}: {
  value: string[];
  onChange: (next: string[]) => void;
  options?: readonly string[];
  tone?: keyof typeof TONES;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");
  const has = (name: string) =>
    value.some((entry) => entry.toLowerCase() === name.toLowerCase());
  const add = (name: string) => {
    const clean = name.trim();
    if (clean && !has(clean)) onChange([...value, clean]);
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {value.map((entry) => (
        <span
          key={entry}
          className={cn(
            "inline-flex h-7.5 items-center gap-1 rounded-lg border pr-1 pl-3 text-sm font-medium",
            TONES[tone],
          )}
        >
          {entry}
          <button
            type="button"
            aria-label={`Bỏ ${entry}`}
            onClick={() => onChange(value.filter((item) => item !== entry))}
            className="flex size-5 cursor-pointer items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
      {options
        .filter((option) => !has(option))
        .map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => add(option)}
            className="h-7.5 cursor-pointer rounded-lg border border-slate-200 px-3 text-sm text-slate-600 hover:border-primary-300 hover:text-primary-600"
          >
            + {option}
          </button>
        ))}
      <input
        value={draft}
        placeholder={placeholder}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== "Enter") return;
          event.preventDefault();
          add(draft);
          setDraft("");
        }}
        className="h-7.5 w-40 rounded-lg border border-dashed border-slate-300 bg-transparent px-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-solid focus:border-primary-500"
      />
    </div>
  );
}

const GROUPS = [
  { key: "primarySkills", label: "Kỹ năng chính", tone: "main" },
  { key: "secondarySkills", label: "Có dùng", tone: "plain" },
  { key: "lackingSkills", label: "Còn thiếu, đang học", tone: "gap" },
  {
    key: "directExperienceDomains",
    label: "Lĩnh vực đã làm trực tiếp",
    tone: "plain",
  },
  { key: "adjacentExperience", label: "Lĩnh vực có liên quan", tone: "plain" },
] as const;

/** Kỹ năng và lĩnh vực; mỗi lần thêm/bỏ là lưu ngay. */
export function SkillsSection() {
  const { data: profile } = useProfile();
  const { data: dashboard } = useDashboard();
  const { save } = useSaveProfile();
  if (!profile) return null;

  const known = new Set(
    [
      ...profile.primarySkills,
      ...profile.secondarySkills,
      ...profile.lackingSkills,
    ].map((skill) => skill.toLowerCase()),
  );
  const suggestions = (dashboard?.skillGaps ?? [])
    .filter((gap) => !known.has(gap.skill.toLowerCase()))
    .slice(0, 4);

  return (
    <DashSection title="Kỹ năng" icon={Sparkle} className="scroll-mt-24">
      <div id="profile-skills" className="grid gap-4">
        {GROUPS.map((group) => (
          <div key={group.key}>
            <h3 className="mb-2 text-xs font-semibold text-slate-500">
              {group.label}
            </h3>
            <TagPicker
              value={profile[group.key]}
              tone={group.tone}
              onChange={(next) => void save({ [group.key]: next })}
            />
            {group.key === "lackingSkills" && suggestions.length > 0 && (
              <p className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                Tin trong ngành hay đòi mà hồ sơ chưa có:
                {suggestions.map((gap) => (
                  <button
                    key={gap.skill}
                    type="button"
                    onClick={() =>
                      void save({
                        lackingSkills: [...profile.lackingSkills, gap.skill],
                      })
                    }
                    className="h-6.5 cursor-pointer rounded-md border border-dashed border-primary-300 px-2 font-semibold text-primary-600 hover:bg-primary-50"
                  >
                    + {gap.skill}{" "}
                    <span className="font-normal text-slate-400">
                      {gap.jobCount} tin
                    </span>
                  </button>
                ))}
              </p>
            )}
          </div>
        ))}
      </div>
    </DashSection>
  );
}
