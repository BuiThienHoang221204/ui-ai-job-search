"use client";

import { useState } from "react";
import Link from "next/link";
import type { Icon } from "@phosphor-icons/react";
import {
  ArrowCounterClockwise,
  Briefcase,
  CheckCircle,
  GraduationCap,
  Info,
  Medal,
  PencilSimple,
  Sparkle,
  Stack,
  User,
  X,
} from "@phosphor-icons/react/ssr";
import {
  FIELD_LABELS,
  buildReview,
  defaultChoices,
  isReviewEmpty,
  reviewValues,
  type Item,
  type ItemField,
  type ReviewChoices,
  type TextChange,
} from "@/lib/profile-draft-content";
import type { ProfileDraftRecord, ProfileRecord } from "@/services";
import { DashSection } from "@/components/dashboard/dash-section";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { cn, companyInitials } from "@/utils";
import { RecordForm } from "../edit-modal";
import { RECORDS } from "../profile-config";

const ITEM_ICONS: Record<ItemField, Icon> = {
  experiences: Briefcase,
  projects: Stack,
  educations: GraduationCap,
  certificates: Medal,
};

const ICON_BUTTON =
  "flex size-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-primary-300 hover:text-primary-600";

/** Chữ CV ghi khác hồ sơ: hai lựa chọn ngang nhau. Hồ sơ còn trống thì chỉ là một dòng bật/tắt. */
function TextRow({
  change,
  useCv,
  onChange,
}: {
  change: TextChange;
  useCv: boolean;
  onChange: (useCv: boolean) => void;
}) {
  const label = FIELD_LABELS[change.field];

  if (!change.current) {
    return (
      <div
        className={cn(
          "flex items-start gap-3 rounded-xl px-3 py-2.5",
          useCv ? "bg-emerald-50" : "opacity-60",
        )}
      >
        <div className="min-w-0 flex-1 text-sm">
          <span className="text-slate-500">{label}: </span>
          <span className={cn("text-slate-900", !useCv && "line-through")}>
            {change.proposed}
          </span>
        </div>
        <button
          type="button"
          className={ICON_BUTTON}
          aria-label={useCv ? `Bỏ ${label}` : `Lấy lại ${label}`}
          onClick={() => onChange(!useCv)}
        >
          {useCv ? (
            <X className="size-4" />
          ) : (
            <ArrowCounterClockwise className="size-4" />
          )}
        </button>
      </div>
    );
  }

  const options = [
    { cv: false, caption: "Giữ bản đang có", value: change.current },
    { cv: true, caption: "Dùng bản từ CV", value: change.proposed },
  ];
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3">
      <p className="mb-2 text-xs font-semibold text-amber-700">
        {label}: CV ghi khác hồ sơ, chọn một
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <button
            key={option.caption}
            type="button"
            aria-pressed={useCv === option.cv}
            onClick={() => onChange(option.cv)}
            className={cn(
              "grid cursor-pointer gap-0.5 rounded-lg border-[1.5px] bg-white px-3 py-2.5 text-left text-sm",
              useCv === option.cv
                ? "border-primary-500 text-slate-900 ring-3 ring-primary-50"
                : "border-slate-200 text-slate-600",
            )}
          >
            <span
              className={cn(
                "text-2xs font-bold uppercase",
                useCv === option.cv ? "text-primary-600" : "text-slate-400",
              )}
            >
              {option.caption}
            </span>
            {option.value}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Màn xem lại: hồ sơ sau khi thêm dữ liệu từ CV; bỏ hoặc sửa chỗ AI đọc sai rồi lưu. */
export function ReviewCard({
  draft,
  profile,
  saving,
  onSave,
  onDismiss,
}: {
  draft: ProfileDraftRecord;
  profile: ProfileRecord | null;
  saving: boolean;
  onSave: (values: Record<string, unknown>) => void;
  onDismiss: () => void;
}) {
  const review = draft.proposal
    ? buildReview(draft.proposal, profile)
    : { texts: [], lists: [], items: [] };
  const [choices, setChoices] = useState<ReviewChoices>(() =>
    defaultChoices(review),
  );
  const [editing, setEditing] = useState<{
    field: ItemField;
    index: number;
  } | null>(null);

  if (isReviewEmpty(review)) {
    return (
      <Card className="grid justify-items-center gap-3 p-10 text-center">
        <CheckCircle weight="duotone" className="size-12 text-emerald-500" />
        <p className="font-semibold text-slate-900">
          CV không có gì mới so với hồ sơ của bạn
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onDismiss}>
            Đọc file khác
          </Button>
          <Link href="/dashboard/profile">
            <Button>Về hồ sơ</Button>
          </Link>
        </div>
      </Card>
    );
  }

  const added = (field: ItemField) => choices.added[field] ?? [];
  const setAdded = (field: ItemField, next: Item[]) =>
    setChoices((current) => ({
      ...current,
      added: { ...current.added, [field]: next },
    }));
  const toggleChip = (field: keyof ReviewChoices["dropped"], entry: string) =>
    setChoices((current) => {
      const dropped = current.dropped[field] ?? [];
      const next = dropped.includes(entry)
        ? dropped.filter((item) => item !== entry)
        : [...dropped, entry];
      return { ...current, dropped: { ...current.dropped, [field]: next } };
    });

  const values = reviewValues(review, choices);
  const keptChips = review.lists.reduce(
    (sum, change) =>
      sum +
      change.added.filter(
        (entry) => !(choices.dropped[change.field] ?? []).includes(entry),
      ).length,
    0,
  );
  const summary = [
    { label: "kỹ năng, lĩnh vực", count: keptChips },
    ...review.items.map((change) => ({
      label: RECORDS[change.field].title.toLowerCase(),
      count: added(change.field).length,
    })),
  ];
  const missing = draft.proposal?.missing ?? [];
  const notes = draft.proposal?.notes ?? [];
  const editingItem = editing ? added(editing.field)[editing.index] : null;

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(18.75rem,1fr)]">
      <Card className="min-w-0 divide-y divide-slate-100 overflow-hidden">
        <p className="bg-slate-50 px-5 py-3 text-sm text-slate-600">
          Hồ sơ của bạn sau khi thêm dữ liệu từ{" "}
          <b className="text-slate-900">{draft.filename ?? "CV"}</b>. Phần nền
          xanh là mới từ CV.
        </p>

        {review.texts.length > 0 && (
          <DashSection title="Giới thiệu" icon={User}>
            <div className="grid gap-2.5">
              {review.texts.map((change) => (
                <TextRow
                  key={change.field}
                  change={change}
                  useCv={Boolean(choices.useCv[change.field])}
                  onChange={(useCv) =>
                    setChoices((current) => ({
                      ...current,
                      useCv: { ...current.useCv, [change.field]: useCv },
                    }))
                  }
                />
              ))}
            </div>
          </DashSection>
        )}

        {review.lists.length > 0 && (
          <DashSection title="Kỹ năng và lĩnh vực" icon={Sparkle}>
            <div className="grid gap-4">
              {review.lists.map((change) => (
                <div key={change.field}>
                  <h3 className="mb-2 text-xs font-semibold text-slate-500">
                    {FIELD_LABELS[change.field]}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {change.current.map((entry) => (
                      <span
                        key={entry}
                        className="inline-flex h-7.5 items-center rounded-lg border border-slate-200 px-3 text-sm text-slate-700"
                      >
                        {entry}
                      </span>
                    ))}
                    {change.added.map((entry) => {
                      const dropped = (
                        choices.dropped[change.field] ?? []
                      ).includes(entry);
                      return (
                        <button
                          key={entry}
                          type="button"
                          onClick={() => toggleChip(change.field, entry)}
                          aria-label={
                            dropped ? `Lấy lại ${entry}` : `Bỏ ${entry}`
                          }
                          className={cn(
                            "inline-flex h-7.5 cursor-pointer items-center gap-1 rounded-lg border px-3 text-sm",
                            dropped
                              ? "border-dashed border-slate-300 text-slate-400 line-through"
                              : "border-emerald-300 bg-emerald-50 text-emerald-700",
                          )}
                        >
                          {entry}
                          {dropped ? (
                            <ArrowCounterClockwise className="size-3" />
                          ) : (
                            <X className="size-3" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </DashSection>
        )}

        {review.items.map((change) => (
          <DashSection
            key={change.field}
            title={RECORDS[change.field].title}
            icon={ITEM_ICONS[change.field]}
          >
            {added(change.field).length === 0 ? (
              <p className="text-sm text-slate-400">Đã bỏ hết mục mới.</p>
            ) : (
              <ul className="grid gap-2">
                {added(change.field).map((item, index) => {
                  const view = RECORDS[change.field].view(item);
                  return (
                    <li
                      key={index}
                      className="grid grid-cols-[2.75rem_minmax(0,1fr)_auto] gap-3 rounded-xl bg-emerald-50 p-3 shadow-[inset_3px_0_0_var(--color-emerald-500)]"
                    >
                      <span className="flex size-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600">
                        {companyInitials(
                          change.field === "experiences"
                            ? view.sub
                            : view.title,
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
                        {view.tags.length > 0 && (
                          <p className="mt-1 text-xs text-slate-500">
                            {view.tags.join(", ")}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1.5 self-start">
                        <button
                          type="button"
                          className={ICON_BUTTON}
                          aria-label="Sửa"
                          onClick={() =>
                            setEditing({ field: change.field, index })
                          }
                        >
                          <PencilSimple className="size-4" />
                        </button>
                        <button
                          type="button"
                          className={ICON_BUTTON}
                          aria-label="Bỏ"
                          onClick={() =>
                            setAdded(
                              change.field,
                              added(change.field).filter(
                                (_, at) => at !== index,
                              ),
                            )
                          }
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </DashSection>
        ))}
      </Card>

      <div className="grid gap-5 lg:sticky lg:top-6">
        <Card>
          <DashSection title="Sẽ thêm vào hồ sơ" icon={CheckCircle}>
            <ul className="mb-4 grid gap-2 text-sm">
              {summary.map((row) => (
                <li key={row.label} className="flex justify-between">
                  <span className="text-slate-600">{row.label}</span>
                  <b className="text-emerald-600 tabular-nums">+{row.count}</b>
                </li>
              ))}
            </ul>
            <Button
              className="w-full"
              loading={saving}
              disabled={Object.keys(values).length === 0}
              onClick={() => onSave(values)}
            >
              Lưu vào hồ sơ
            </Button>
            <p className="mt-2 text-center text-xs text-slate-500">
              Lưu xong vẫn sửa được ở trang Hồ sơ.
            </p>
            <Button
              variant="outline"
              className="mt-2 w-full"
              onClick={onDismiss}
            >
              Bỏ bản đọc này
            </Button>
          </DashSection>
        </Card>

        {(missing.length > 0 || notes.length > 0) && (
          <Card>
            <DashSection title="CV không ghi" icon={Info}>
              <ul className="grid gap-1.5 text-sm text-slate-700">
                {missing.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
              <Link
                href="/dashboard/profile"
                className="mt-3 inline-block text-xs font-semibold text-primary-600 hover:text-primary-700"
              >
                Tự điền ở trang Hồ sơ →
              </Link>
              {notes.length > 0 && (
                <details className="mt-3 text-xs text-slate-500">
                  <summary className="cursor-pointer">
                    Ghi chú của AI khi đọc ({notes.length})
                  </summary>
                  <ul className="mt-2 list-disc space-y-1 pl-4">
                    {notes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                </details>
              )}
            </DashSection>
          </Card>
        )}
      </div>

      {editing && editingItem && (
        <Modal
          open
          onClose={() => setEditing(null)}
          title={`Sửa ${RECORDS[editing.field].title.toLowerCase()}`}
          className="max-h-[90vh] max-w-xl overflow-y-auto"
        >
          <RecordForm
            type={editing.field}
            item={editingItem}
            onCancel={() => setEditing(null)}
            onSubmit={(item) => {
              setAdded(
                editing.field,
                added(editing.field).map((entry, at) =>
                  at === editing.index ? item : entry,
                ),
              );
              setEditing(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
