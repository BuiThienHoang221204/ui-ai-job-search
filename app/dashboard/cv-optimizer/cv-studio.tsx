"use client";

import { useCallback, useMemo, useState } from "react";
import { Check, Download, Layout } from "@phosphor-icons/react/ssr";
import {
  documentsService,
  type CvContentInput,
  type CvLayout,
  type CvSectionKey,
  type DocumentRecord,
} from "@/services";
import { apiErrorMessage } from "@/lib/axios";
import { useApiQuery } from "@/hooks/use-api-query";
import { parseCvContent } from "@/lib/document-content";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { Tabs } from "@/components/ui/tabs";
import { openBlobInNewTab } from "@/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { CvEditor } from "./cv-editor";
import { CvLayoutPanel } from "./cv-layout-panel";
import { CvPreview } from "./cv-preview";
import { CvTemplatePicker } from "./cv-template-picker";

const SECTION_KEYS: CvSectionKey[] = [
  "profile",
  "competencies",
  "experience",
  "projects",
  "education",
  "skills",
];

const TABS = [
  { value: "noi-dung", label: "Nội dung" },
  { value: "bo-cuc", label: "Bố cục" },
  { value: "mau", label: "Mẫu trình bày" },
];

const PREVIEW_DEBOUNCE_MS = 400;

/** Chuyển bản đã lưu thành bản nháp sửa được: `null` thành chuỗi rỗng. */
const toDraft = (raw: unknown): CvContentInput => {
  const cv = parseCvContent(raw);
  return {
    profileStatement: cv.profileStatement ?? "",
    coreCompetencies: cv.coreCompetencies,
    experiences: cv.experiences.map((experience) => ({
      position: experience.position ?? "",
      company: experience.company ?? "",
      location: experience.location ?? "",
      period: experience.period ?? "",
      bullets: experience.bullets,
    })),
    projects: cv.projects.map((project) => ({
      name: project.name ?? "",
      role: project.role ?? "",
      organization: project.organization ?? "",
      period: project.period ?? "",
      description: project.description ?? "",
      bullets: project.bullets,
      tools: project.tools,
    })),
    educations: cv.educations.map((education) => ({
      degree: education.degree ?? "",
      institution: education.institution ?? "",
      period: education.period ?? "",
      detail: education.detail ?? "",
    })),
    skillGroups: cv.skillGroups.map((group) => ({
      label: group.label ?? "",
      items: group.items,
    })),
  };
};

/** Bố cục đã lưu, điền mặc định cho phần thiếu. */
const toLayout = (raw: CvLayout | null): CvLayout => {
  const order = (raw?.order ?? []).filter((key) => SECTION_KEYS.includes(key));
  const missing = SECTION_KEYS.filter((key) => !order.includes(key));
  return { order: [...order, ...missing], hidden: raw?.hidden ?? [] };
};

/** Bàn làm việc của một CV: sửa nội dung, chọn mẫu, xem trước, tải PDF. */
export function CvStudio({
  record,
  onSaved,
}: {
  record: DocumentRecord;
  onSaved: () => void;
}) {
  const saved = useMemo(
    () => ({
      content: toDraft(record.content),
      layout: toLayout(record.layout),
      templateId: record.templateId,
      accent: record.templateOptions?.accent,
    }),
    [record],
  );

  const [tab, setTab] = useState(TABS[0].value);
  const [openSection, setOpenSection] = useState<CvSectionKey | null>(
    saved.layout.order.find((key) => !saved.layout.hidden.includes(key)) ?? null,
  );

  const [content, setContent] = useState(saved.content);
  const [layout, setLayout] = useState(saved.layout);
  const [templateId, setTemplateId] = useState(saved.templateId);
  const [accent, setAccent] = useState(saved.accent);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const draft = useMemo(
    () => ({ content, layout, templateId, accent }),
    [content, layout, templateId, accent],
  );
  const previewKey = `${record.id}|${JSON.stringify(draft)}`;

  const debouncedKey = useDebounce(previewKey, PREVIEW_DEBOUNCE_MS);

  const preview = useApiQuery(
    ["cv-preview", debouncedKey],
    () => documentsService.previewDraft(record.id, draft),
    {
      errorMessage: "Không tải được bản xem trước",
      keepPrevious: true,
    },
  );

  const html = preview.data;
  const error = saveError ?? preview.error;
  const dirty = previewKey !== `${record.id}|${JSON.stringify(saved)}`;

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaveError(null);
    try {
      await documentsService.updateCv(record.id, { content, layout });
      if (templateId !== saved.templateId || accent !== saved.accent) {
        await documentsService.setTemplate(record.id, templateId, accent);
      }
      onSaved();
    } catch (cause: unknown) {
      setSaveError(apiErrorMessage(cause, "Không lưu được thay đổi"));
    } finally {
      setSaving(false);
    }
  }, [record.id, content, layout, templateId, accent, saved, onSaved]);

  const handleDownload = useCallback(async () => {
    setSaveError(null);
    try {
      openBlobInNewTab(await documentsService.pdf(record.id, "html"));
    } catch (cause: unknown) {
      setSaveError(apiErrorMessage(cause, "Không tạo được PDF"));
    }
  }, [record.id]);

  return (
    <SectionCard
      compact
      icon={Layout}
      title={
        <span className="flex items-center gap-2">
          Sửa CV
          <span className="rounded-full border border-slate-200 px-2 py-0.5 text-2xs font-medium text-slate-500">
            {record.language === "EN" ? "English" : "Tiếng Việt"}
          </span>
        </span>
      }
      description="Sửa thoải mái — chỉ khi bấm “Lưu thay đổi” mới ghi lại"
      className="border-slate-200/90"
      contentClassName="space-y-4"
      actions={
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleDownload}>
            <Download className="size-4.5" />
            Tải PDF
          </Button>
          <Button size="sm" onClick={handleSave} loading={saving} disabled={!dirty}>
            <Check className="size-4.5" />
            {dirty ? "Lưu thay đổi" : "Đã lưu"}
          </Button>
        </div>
      }
    >
      {error ? <Alert tone="danger">{error}</Alert> : null}

      {dirty ? (
        <Alert tone="info">
          Bản xem trước đang hiện thay đổi chưa lưu. Bấm “Lưu thay đổi” trước khi
          tải PDF.
        </Alert>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div className="space-y-3">
          <Tabs tabs={TABS} value={tab} onChange={setTab} />

          {tab === "noi-dung" ? (
            <CvEditor
              content={content}
              layout={layout}
              openKey={openSection}
              onOpenKeyChange={setOpenSection}
              onContentChange={setContent}
            />
          ) : tab === "bo-cuc" ? (
            <CvLayoutPanel layout={layout} onChange={setLayout} />
          ) : (
            <CvTemplatePicker
              templateId={templateId}
              accent={accent}
              onTemplateChange={(id) => {
                setTemplateId(id);
                setAccent(undefined);
              }}
              onAccentChange={setAccent}
            />
          )}
        </div>

        <div className="lg:sticky lg:top-4 lg:self-start">
          <CvPreview
            html={html}
            activeSection={tab === "noi-dung" ? openSection : null}
            onSectionClick={(key) => {
              setTab("noi-dung");
              setOpenSection(key);
            }}
          />
        </div>
      </div>
    </SectionCard>
  );
}
