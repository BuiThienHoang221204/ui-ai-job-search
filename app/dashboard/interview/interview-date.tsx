"use client";

import { useState } from "react";
import { CalendarBlank, X } from "@phosphor-icons/react/ssr";
import { useQueryClient } from "@tanstack/react-query";
import { applicationsService, type PrepApplication } from "@/services";
import { apiErrorMessage } from "@/lib/axios";
import { invalidateAfter } from "@/lib/query-keys";
import { useInterviewRefresh } from "@/hooks/use-interview-prep";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils";

/** Ngày dạng `yyyy-mm-dd` theo giờ máy, để đổ vào ô `<input type="date">`. */
const toInputDate = (iso: string) => {
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

/** Ghi hoặc đổi ngày phỏng vấn của đơn ứng tuyển gắn với bộ đề này. */
export function InterviewDate({
  application,
}: {
  application: PrepApplication | null;
}) {
  const toast = useToast();
  const client = useQueryClient();
  const refresh = useInterviewRefresh();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);

  if (!application) return null;

  const save = async (date: string | null) => {
    setSaving(true);
    try {
      await applicationsService.setInterviewDate(
        application.id,
        date ? new Date(`${date}T09:00:00`).toISOString() : null,
      );
      refresh();
      invalidateAfter(client, "applicationStatus");
      setEditing(false);
    } catch (cause) {
      toast.danger(apiErrorMessage(cause, "Không lưu được ngày phỏng vấn"));
    } finally {
      setSaving(false);
    }
  };

  const open = () => {
    setValue(application.interviewAt ? toInputDate(application.interviewAt) : "");
    setEditing(true);
  };

  if (editing) {
    return (
      <span className="inline-flex flex-wrap items-center gap-1.5">
        <input
          type="date"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          aria-label="Ngày phỏng vấn"
          className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-800 focus:border-primary-400 focus:outline-none"
        />
        <Button
          size="sm"
          loading={saving}
          disabled={!value}
          onClick={() => void save(value)}
        >
          Lưu
        </Button>
        {application.interviewAt && (
          <Button
            size="sm"
            variant="ghost"
            disabled={saving}
            onClick={() => void save(null)}
          >
            Xoá ngày
          </Button>
        )}
        <Button
          size="icon"
          variant="ghost"
          className="size-8"
          aria-label="Huỷ"
          onClick={() => setEditing(false)}
        >
          <X className="size-4" />
        </Button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={open}
      className="inline-flex cursor-pointer items-center gap-1 text-primary-700 hover:text-primary-800"
    >
      <CalendarBlank className="size-3.5" />
      {application.interviewAt
        ? `Phỏng vấn ${formatDate(application.interviewAt)}`
        : "Ghi ngày phỏng vấn"}
    </button>
  );
}
