"use client";

import { useCallback, useState } from "react";
import { create } from "zustand";
import { useQueryClient } from "@tanstack/react-query";
import { documentsService } from "@/services";
import { apiErrorMessage } from "@/lib/axios";
import { useApiQuery } from "@/hooks/use-api-query";
import {
  addCvEntry,
  insertCvLine,
  removeCvItem,
  setCvField,
  withoutEmptyLines,
} from "@/lib/cv-fields";
import { parseCvContent } from "@/lib/document-content";
import { keys } from "@/lib/query-keys";
import type {
  CvDraft,
  CvRailTab,
  CvContentInput,
  CvLayout,
  CvSectionKey,
  CvTypography,
  DocumentRecord,
} from "@/types";
import { openBlobInNewTab } from "@/lib/blob";

const SECTION_KEYS: CvSectionKey[] = [
  "profile",
  "competencies",
  "experience",
  "projects",
  "education",
  "skills",
];

interface CvDraftState extends CvDraft {
  recordId: string | null;
  saved: CvDraft | null;
  tab: CvRailTab;
  previewRev: number;
  target: CvSectionKey | null;
  skipped: string[];
  load: (record: DocumentRecord) => void;
  setContent: (content: CvContentInput) => void;
  editText: (path: string, text: string) => void;
  insertLine: (path: string) => void;
  removeLine: (path: string) => void;
  addEntry: (section: CvSectionKey) => void;
  removeEntry: (path: string) => void;
  setLayout: (layout: CvLayout) => void;
  setTemplate: (templateId: string) => void;
  setAccent: (accent: string) => void;
  setTypography: (typography: CvTypography) => void;
  setTab: (tab: CvRailTab) => void;
  goTo: (section: CvSectionKey | null) => void;
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
  return {
    order: [...order, ...missing],
    hidden: raw?.hidden ?? [],
    titles: raw?.titles ?? {},
  };
};

/** Bản nháp của CV đang mở. Gõ chữ trên trang chỉ sửa `content`; thao tác đổi cấu trúc tăng `previewRev` để dựng lại trang. */
export const useCvDraft = create<CvDraftState>((set) => ({
  recordId: null,
  saved: null,
  content: toDraft(null),
  identity: {},
  layout: toLayout(null),
  templateId: "",
  accent: undefined,
  typography: {},
  tab: "hoan-thien",
  previewRev: 0,
  target: null,
  skipped: [],
  load: (record) => {
    const saved: CvDraft = {
      content: toDraft(record.content),
      identity: record.identity ?? {},
      layout: toLayout(record.layout),
      templateId: record.templateId,
      accent: record.templateOptions?.accent,
      typography: {
        font: record.templateOptions?.font,
        size: record.templateOptions?.size,
        lineHeight: record.templateOptions?.lineHeight,
      },
    };
    set((now) => ({
      ...saved,
      saved,
      recordId: record.id,
      previewRev: now.previewRev + 1,
      ...(now.recordId === record.id
        ? {}
        : { tab: "hoan-thien", target: null, skipped: [] }),
    }));
  },
  setContent: (content) =>
    set((now) => ({
      content: withoutEmptyLines(content),
      previewRev: now.previewRev + 1,
    })),
  editText: (path, text) =>
    set((now) => {
      if (path.startsWith("identity.")) {
        const key = path.slice("identity.".length);
        return { identity: { ...now.identity, [key]: text } };
      }
      if (path.startsWith("layout.titles.")) {
        const key = path.slice("layout.titles.".length);
        const titles = { ...now.layout.titles, [key]: text };
        return { layout: { ...now.layout, titles } };
      }
      return { content: setCvField(now.content, path, text) };
    }),
  insertLine: (path) =>
    set((now) => ({ content: insertCvLine(now.content, path) })),
  removeLine: (path) =>
    set((now) => ({ content: removeCvItem(now.content, path) })),
  addEntry: (section) =>
    set((now) => ({
      content: addCvEntry(withoutEmptyLines(now.content), section),
      previewRev: now.previewRev + 1,
    })),
  removeEntry: (path) =>
    set((now) => ({
      content: removeCvItem(withoutEmptyLines(now.content), path),
      previewRev: now.previewRev + 1,
    })),
  setLayout: (layout) =>
    set((now) => ({ layout, content: withoutEmptyLines(now.content) })),
  setTemplate: (templateId) =>
    set((now) => ({
      templateId,
      accent: undefined,
      content: withoutEmptyLines(now.content),
    })),
  setAccent: (accent) =>
    set((now) => ({ accent, content: withoutEmptyLines(now.content) })),
  setTypography: (typography) =>
    set((now) => ({ typography, content: withoutEmptyLines(now.content) })),
  setTab: (tab) => set({ tab }),
  goTo: (target) => set({ target }),
  skip: (keyword) => set((now) => ({ skipped: [...now.skipped, keyword] })),
}));

const draftOf = (state: CvDraft): CvDraft => ({
  content: state.content,
  identity: state.identity,
  layout: state.layout,
  templateId: state.templateId,
  accent: state.accent,
  typography: state.typography,
});

/** Bản nháp khác bản đã lưu chưa. */
export function useCvDirty(): boolean {
  return useCvDraft(
    (state) =>
      state.saved !== null &&
      JSON.stringify(draftOf(state)) !== JSON.stringify(state.saved),
  );
}

/** HTML của trang CV ở chế độ sửa. Chỉ hỏi lại máy chủ khi cấu trúc, bố cục hay mẫu đổi — chữ đang gõ đã nằm sẵn trên trang. */
export function useCvPreview(recordId: string) {
  const previewRev = useCvDraft((state) => state.previewRev);
  const order = useCvDraft((state) => state.layout.order);
  const hidden = useCvDraft((state) => state.layout.hidden);
  const templateId = useCvDraft((state) => state.templateId);
  const accent = useCvDraft((state) => state.accent);
  const typography = useCvDraft((state) => state.typography);
  const key = `${recordId}|${previewRev}|${order.join()}|${hidden.join()}|${templateId}|${accent}|${JSON.stringify(typography)}`;

  return useApiQuery(
    keys.cvPreview(key),
    () =>
      documentsService.previewDraft(recordId, {
        content: withoutEmptyLines(useCvDraft.getState().content),
        identity: useCvDraft.getState().identity,
        layout: useCvDraft.getState().layout,
        templateId,
        accent,
        ...typography,
        editing: true,
      }),
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
        content: withoutEmptyLines(state.content),
        identity: state.identity,
        layout: state.layout,
      });
      if (
        state.templateId !== state.saved?.templateId ||
        state.accent !== state.saved?.accent ||
        JSON.stringify(state.typography) !==
          JSON.stringify(state.saved?.typography)
      ) {
        saved = await documentsService.setTemplate(recordId, state.templateId, {
          accent: state.accent,
          ...state.typography,
        });
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
