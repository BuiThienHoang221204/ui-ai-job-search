"use client";

import { useCallback, useMemo, useState } from "react";
import { create } from "zustand";
import { useQueryClient } from "@tanstack/react-query";
import {
  documentsService,
  type CvContentInput,
  type CvLayout,
  type CvSectionKey,
  type DocumentRecord,
} from "@/services";
import { apiErrorMessage } from "@/lib/axios";
import { useApiQuery } from "@/hooks/use-api-query";
import { useDebounce } from "@/hooks/use-debounce";
import { parseCvContent } from "@/lib/document-content";
import { keys } from "@/lib/query-keys";
import { openBlobInNewTab } from "@/utils";
import type { CvDraft, CvRailTab } from "@/types";

const SECTION_KEYS: CvSectionKey[] = [
  "profile",
  "competencies",
  "experience",
  "projects",
  "education",
  "skills",
];

const PREVIEW_DEBOUNCE_MS = 400;

interface CvDraftState extends CvDraft {
  recordId: string | null;
  saved: CvDraft | null;
  tab: CvRailTab;
  openSection: CvSectionKey | null;
  skipped: string[];
  load: (record: DocumentRecord) => void;
  setContent: (content: CvContentInput) => void;
  setLayout: (layout: CvLayout) => void;
  setTemplate: (templateId: string) => void;
  setAccent: (accent: string) => void;
  setTab: (tab: CvRailTab) => void;
  openEditor: (section: CvSectionKey | null) => void;
  skip: (keyword: string) => void;
}

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

/** Bản nháp của CV đang mở; header, dải mẫu, bản xem trước và cột phải đọc chung, không truyền props. */
export const useCvDraft = create<CvDraftState>((set) => ({
  recordId: null,
  saved: null,
  content: toDraft(null),
  layout: toLayout(null),
  templateId: "",
  accent: undefined,
  tab: "hoan-thien",
  openSection: null,
  skipped: [],
  load: (record) => {
    const saved: CvDraft = {
      content: toDraft(record.content),
      layout: toLayout(record.layout),
      templateId: record.templateId,
      accent: record.templateOptions?.accent,
    };
    set((now) => ({
      ...saved,
      saved,
      recordId: record.id,
      ...(now.recordId === record.id
        ? {}
        : { tab: "hoan-thien", openSection: null, skipped: [] }),
    }));
  },
  setContent: (content) => set({ content }),
  setLayout: (layout) => set({ layout }),
  setTemplate: (templateId) => set({ templateId, accent: undefined }),
  setAccent: (accent) => set({ accent }),
  setTab: (tab) => set({ tab }),
  openEditor: (section) => set({ tab: "noi-dung", openSection: section }),
  skip: (keyword) => set((now) => ({ skipped: [...now.skipped, keyword] })),
}));

const draftOf = (state: CvDraft): CvDraft => ({
  content: state.content,
  layout: state.layout,
  templateId: state.templateId,
  accent: state.accent,
});

/** Bản nháp khác bản đã lưu chưa. */
export function useCvDirty(): boolean {
  return useCvDraft(
    (state) =>
      state.saved !== null &&
      JSON.stringify(draftOf(state)) !== JSON.stringify(state.saved),
  );
}

/** HTML xem trước của bản nháp, hỏi lại máy chủ sau khi người dùng ngừng gõ. */
export function useCvPreview(recordId: string) {
  const content = useCvDraft((state) => state.content);
  const layout = useCvDraft((state) => state.layout);
  const templateId = useCvDraft((state) => state.templateId);
  const accent = useCvDraft((state) => state.accent);
  const draft = useMemo(
    () => ({ content, layout, templateId, accent }),
    [content, layout, templateId, accent],
  );
  const key = useDebounce(
    `${recordId}|${JSON.stringify(draft)}`,
    PREVIEW_DEBOUNCE_MS,
  );

  return useApiQuery(
    keys.cvPreview(key),
    () => documentsService.previewDraft(recordId, draft),
    { errorMessage: "Không tải được bản xem trước", keepPrevious: true },
  );
}

/** Lưu bản nháp (nội dung, bố cục, mẫu) và tải PDF của CV đang mở. */
export function useCvActions(recordId: string) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = useCallback(async () => {
    const state = useCvDraft.getState();
    setSaving(true);
    setError(null);
    try {
      let saved = await documentsService.updateCv(recordId, {
        content: state.content,
        layout: state.layout,
      });
      if (
        state.templateId !== state.saved?.templateId ||
        state.accent !== state.saved?.accent
      ) {
        saved = await documentsService.setTemplate(
          recordId,
          state.templateId,
          state.accent,
        );
      }
      queryClient.setQueryData<DocumentRecord>(
        keys.document(recordId),
        (current) => current && { ...saved, job: current.job },
      );
      void queryClient.invalidateQueries({ queryKey: keys.documents() });
    } catch (cause: unknown) {
      setError(apiErrorMessage(cause, "Không lưu được thay đổi"));
    } finally {
      setSaving(false);
    }
  }, [recordId, queryClient]);

  const download = useCallback(async () => {
    setError(null);
    try {
      openBlobInNewTab(await documentsService.pdf(recordId, "html"));
    } catch (cause: unknown) {
      setError(apiErrorMessage(cause, "Không tạo được PDF"));
    }
  }, [recordId]);

  return { save, download, saving, error };
}
