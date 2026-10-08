"use client";

import type { ReactNode } from "react";
import { Check } from "@phosphor-icons/react/ssr";
import type { ProfileRecord } from "@/services";
import {
  DEAL_BREAKER_OPTIONS,
  DRAINING_OPTIONS,
  ENERGIZING_OPTIONS,
  SECTOR_OPTIONS,
  TEAM_OPTIONS,
  WORK_STYLE_OPTIONS,
  asObject,
  strings,
} from "../profile-config";
import { useProfile, useSaveProfile } from "../use-profile";
import { TagPicker } from "./skills-section";

/** Một câu hỏi của tab "Mong muốn tìm việc", kèm dấu "Đã trả lời" hoặc "Chưa trả lời". */
export function Question({
  id,
  title,
  hint,
  answered,
  children,
}: {
  id: string;
  title: string;
  hint?: string;
  answered: boolean;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 border-t border-slate-100 p-5 first:border-t-0"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
        </div>
        {answered ? (
          <span className="flex shrink-0 items-center gap-1 text-2xs font-semibold text-emerald-600">
            <Check className="size-3" weight="bold" />
            Đã trả lời
          </span>
        ) : (
          <span className="shrink-0 text-2xs font-semibold text-amber-600">
            Chưa trả lời
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

type ListKey =
  | "careerGoals"
  | "targetSectors"
  | "energizingTasks"
  | "drainingTasks"
  | "dealBreakers";

const QUESTIONS: {
  key: ListKey;
  title: string;
  hint: string;
  options: readonly string[];
}[] = [
  {
    key: "careerGoals",
    title: "Bạn muốn đi tới đâu trong 1–2 năm tới?",
    hint: "Gõ vị trí hoặc mục tiêu rồi nhấn Enter.",
    options: [],
  },
  {
    key: "targetSectors",
    title: "Bạn muốn làm cho lĩnh vực nào?",
    hint: "AI ưu tiên tin thuộc các lĩnh vực này khi chấm phần Định hướng.",
    options: SECTOR_OPTIONS,
  },
  {
    key: "energizingTasks",
    title: "Việc nào làm bạn thấy hứng thú?",
    hint: "CV không nói được điều này. AI dùng nó khi chấm phần Định hướng (30% điểm).",
    options: ENERGIZING_OPTIONS,
  },
  {
    key: "drainingTasks",
    title: "Việc nào làm bạn kiệt sức?",
    hint: "AI trừ điểm tin có nhiều việc kiểu này.",
    options: DRAINING_OPTIONS,
  },
  {
    key: "dealBreakers",
    title: "Điều gì khiến bạn từ chối một công việc?",
    hint: "AI trừ điểm hoặc chấm “không đạt” cho tin vi phạm. Tin vẫn hiện trong danh sách.",
    options: DEAL_BREAKER_OPTIONS,
  },
];

const TRAITS = [
  {
    key: "workStyle",
    title: "Bạn làm việc theo kiểu nào?",
    options: WORK_STYLE_OPTIONS,
  },
  {
    key: "teamPreference",
    title: "Bạn hợp với môi trường nào?",
    options: TEAM_OPTIONS,
  },
];

const TRAITS_HINT = "AI dùng khi chấm phần Hành vi & văn hoá (15% điểm).";

/** Các câu hỏi định hướng và đặc điểm hành vi; chọn là lưu ngay. */
export function CareerSection() {
  const { data: profile } = useProfile();
  const { save } = useSaveProfile();
  if (!profile) return null;

  const traits = asObject(profile.behavioralTraits);
  const saveList = (key: keyof ProfileRecord, next: string[]) =>
    void save({ [key]: next });

  return (
    <>
      {QUESTIONS.map((question) => (
        <Question
          key={question.key}
          id={`q-${question.key}`}
          title={question.title}
          hint={question.hint}
          answered={profile[question.key].length > 0}
        >
          <TagPicker
            value={profile[question.key]}
            options={question.options}
            tone={question.key === "dealBreakers" ? "no" : "main"}
            placeholder="+ Tự gõ"
            onChange={(next) => saveList(question.key, next)}
          />
        </Question>
      ))}
      {TRAITS.map((trait) => (
        <Question
          key={trait.key}
          id={`q-${trait.key}`}
          title={trait.title}
          hint={TRAITS_HINT}
          answered={strings(traits[trait.key]).length > 0}
        >
          <TagPicker
            value={strings(traits[trait.key])}
            options={trait.options}
            tone="main"
            placeholder="+ Tự gõ"
            onChange={(next) =>
              void save({ behavioralTraits: { ...traits, [trait.key]: next } })
            }
          />
        </Question>
      ))}
    </>
  );
}
