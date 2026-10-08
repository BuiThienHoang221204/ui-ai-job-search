"use client";

import type { Icon } from "@phosphor-icons/react";
import {
  Briefcase,
  GraduationCap,
  Medal,
  PencilSimple,
  Plus,
  Stack,
} from "@phosphor-icons/react/ssr";
import { DashSection } from "@/components/dashboard/dash-section";
import { companyInitials } from "@/utils";
import { RECORDS, asItems, type RecordType } from "../profile-config";
import { useProfile, useProfileUi } from "../use-profile";

const LISTS: { type: RecordType; icon: Icon }[] = [
  { type: "experiences", icon: Briefcase },
  { type: "projects", icon: Stack },
  { type: "educations", icon: GraduationCap },
  { type: "certificates", icon: Medal },
];

/** Một danh sách kiểu trang CV (kinh nghiệm, dự án…); thêm và sửa trong modal. */
function RecordList({ type, icon }: { type: RecordType; icon: Icon }) {
  const { data: profile } = useProfile();
  const edit = useProfileUi((state) => state.edit);
  if (!profile) return null;

  const config = RECORDS[type];
  const items = asItems(profile[type]);

  return (
    <DashSection
      title={config.title}
      icon={icon}
      action={
        <button
          type="button"
          onClick={() => edit({ kind: "record", type, index: null })}
          className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700"
        >
          <Plus className="size-3.5" />
          Thêm
        </button>
      }
    >
      <div id={`profile-${type}`} className="scroll-mt-24">
        {items.length === 0 ? (
          <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
            {config.empty}
          </p>
        ) : (
          <ul>
            {items.map((item, index) => {
              const view = config.view(item);
              return (
                <li
                  key={index}
                  className="grid grid-cols-[2.75rem_minmax(0,1fr)_auto] gap-3.5 border-t border-slate-100 py-3.5 first:border-t-0 first:pt-0"
                >
                  <span className="flex size-11 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-600">
                    {companyInitials(
                      type === "experiences" ? view.sub : view.title,
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">
                      {view.title || "Chưa đặt tên"}
                    </p>
                    {view.sub && (
                      <p className="text-sm text-slate-600">{view.sub}</p>
                    )}
                    {view.when && (
                      <p className="text-xs text-slate-500">{view.when}</p>
                    )}
                    {view.lines.length > 0 && (
                      <ul className="mt-2 list-disc space-y-0.5 pl-4.5 text-sm text-slate-700">
                        {view.lines.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    )}
                    {view.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {view.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    aria-label={`Sửa ${config.title.toLowerCase()}`}
                    onClick={() => edit({ kind: "record", type, index })}
                    className="flex size-8 cursor-pointer items-center justify-center self-start rounded-lg border border-slate-200 text-slate-500 hover:border-primary-300 hover:text-primary-600"
                  >
                    <PencilSimple className="size-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </DashSection>
  );
}

/** Kinh nghiệm, dự án, học vấn và chứng chỉ. */
export function RecordsSection() {
  return LISTS.map((list) => <RecordList key={list.type} {...list} />);
}
