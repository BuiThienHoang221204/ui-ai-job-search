"use client";

import { useState } from "react";
import {
  CheckCircle,
  CloudArrowUp,
  FilePdf,
  TextAlignLeft,
} from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { useFileDrop } from "@/hooks/use-file-drop";
import { MAX_CV_TEXT } from "@/lib/cv-check";
import { cn } from "@/lib/cn";

const PERKS = [
  "Có điểm trong khoảng nửa phút",
  "File không rời máy bạn",
  "Không cần tài khoản",
];

const MIN_PASTE_CHARS = 200;

/** Khung chọn CV: kéo thả hoặc chọn file PDF, hoặc dán chữ của CV. */
export function CvPicker({
  onPick,
  onText,
}: {
  onPick: (file: File) => void;
  onText: (text: string) => void;
}) {
  const [tab, setTab] = useState("pdf");
  const [text, setText] = useState("");
  const { over, dropProps } = useFileDrop(onPick);

  return (
    <Card className="p-5">
      <h2 className="text-base font-semibold tracking-tight text-slate-900">
        Chọn CV
      </h2>
      <p className="mt-0.5 text-sm text-slate-500">
        Tải file PDF lên hoặc dán chữ của CV.
      </p>
      <Tabs
        className="mt-3"
        value={tab}
        onChange={setTab}
        tabs={[
          {
            value: "pdf",
            label: (
              <span className="inline-flex items-center gap-1.5">
                <FilePdf className="size-4" />
                Tải file PDF
              </span>
            ),
          },
          {
            value: "text",
            label: (
              <span className="inline-flex items-center gap-1.5">
                <TextAlignLeft className="size-4" />
                Dán văn bản CV
              </span>
            ),
          },
        ]}
      />

      {tab === "pdf" ? (
        <label
          {...dropProps}
          className={cn(
            "cv-grid group relative mt-4 grid cursor-pointer justify-items-center gap-1 rounded-xl px-5 pt-11 pb-7 text-center",
            over && "outline-primary-500 outline-2",
          )}
        >
          <p className="font-display relative text-xl text-slate-900">
            Tải lên bản CV của bạn
          </p>
          <p className="relative text-sm text-slate-500">
            Chọn hoặc kéo thả file PDF (tối đa 10 MB)
          </p>
          <span className="group-hover:border-primary-500 group-hover:text-primary-600 group-focus-within:border-primary-500 relative mt-5 grid h-29 w-32 place-content-center justify-items-center gap-2 rounded-xl border border-slate-300 bg-white font-semibold text-slate-900 shadow-[0_8px_20px_-14px_rgba(15,23,42,0.4)] transition-colors">
            <CloudArrowUp className="size-6" />
            Chọn file
          </span>
          <span className="relative mt-5 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-slate-500">
            {PERKS.map((perk) => (
              <span key={perk} className="inline-flex items-center gap-1">
                <CheckCircle
                  weight="fill"
                  className="size-3.5 text-emerald-600"
                />
                {perk}
              </span>
            ))}
          </span>
          <input
            type="file"
            accept="application/pdf,.pdf"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onPick(file);
            }}
          />
        </label>
      ) : (
        <div className="mt-4 space-y-3">
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            maxLength={MAX_CV_TEXT}
            rows={12}
            placeholder="Dán toàn bộ chữ của CV vào đây: thông tin liên hệ, kinh nghiệm, dự án, học vấn, kỹ năng…"
            className="focus:border-primary-500 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none"
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Dán chữ thì không kiểm được máy lọc có đọc được file PDF của bạn
              hay không.
            </p>
            <Button
              size="lg"
              disabled={text.trim().length < MIN_PASTE_CHARS}
              onClick={() => onText(text)}
            >
              Phân tích
            </Button>
          </div>
        </div>
      )}

      <p className="mt-3 text-xs text-slate-500">
        Khi phân tích, bạn đồng ý gửi phần chữ của CV tới nhà cung cấp AI để
        nhận xét; xong là bỏ, không lưu.
      </p>
    </Card>
  );
}
