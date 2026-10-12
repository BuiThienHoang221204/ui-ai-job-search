"use client";

import { DocumentSource } from "@/components/dashboard/document-job";
import { Card } from "@/components/ui/card";
import type { CvRailTab } from "@/types";
import { CvEditor } from "../cv-editor";
import { CvLayoutPanel } from "../cv-layout-panel";
import { useCvDraft } from "@/hooks/use-cv-draft";
import { CvChecklist } from "./cv-checklist";

const LOGIN_NEXT = "/dashboard/cv-optimizer";

const RAIL_TABS: { value: CvRailTab; label: string }[] = [
  { value: "hoan-thien", label: "Hoàn thiện" },
  { value: "noi-dung", label: "Sửa nội dung" },
  { value: "bo-cuc", label: "Bố cục" },
];

/** Cột phải: danh sách hoàn thiện, trình sửa nội dung và bố cục. */
export function CvRail({
  documentId,
  jobId,
}: {
  documentId: string;
  jobId: string | null;
}) {
  const tab = useCvDraft((state) => state.tab);
  const setTab = useCvDraft((state) => state.setTab);
  const content = useCvDraft((state) => state.content);
  const layout = useCvDraft((state) => state.layout);
  const openSection = useCvDraft((state) => state.openSection);
  const setContent = useCvDraft((state) => state.setContent);
  const setLayout = useCvDraft((state) => state.setLayout);

  return (
    <Card className="xl:sticky xl:top-4">
      <div
        role="tablist"
        className="flex gap-1 border-b border-slate-100 p-1.5"
      >
        {RAIL_TABS.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={tab === item.value}
            onClick={() => setTab(item.value)}
            className={
              "h-9 flex-1 cursor-pointer rounded-lg text-sm transition-colors " +
              (tab === item.value
                ? "bg-primary-50 font-semibold text-primary-700"
                : "font-medium text-slate-500 hover:text-slate-800")
            }
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="p-5">
        {tab === "hoan-thien" ? (
          <CvChecklist jobId={jobId} />
        ) : tab === "noi-dung" ? (
          <CvEditor
            content={content}
            layout={layout}
            openKey={openSection}
            onOpenKeyChange={(key) => useCvDraft.setState({ openSection: key })}
            onContentChange={setContent}
          />
        ) : (
          <div className="space-y-5">
            <CvLayoutPanel layout={layout} onChange={setLayout} />
            <div className="border-t border-slate-100 pt-4">
              <p className="mb-2 text-xs font-semibold text-slate-500">
                Bản LaTeX
              </p>
              <DocumentSource
                key={documentId}
                documentId={documentId}
                loginNext={LOGIN_NEXT}
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
