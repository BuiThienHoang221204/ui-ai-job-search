"use client";

import { Paperclip } from "@phosphor-icons/react/ssr";
import { parseApplicationEmailContent } from "@/lib/document-content";
import { useJobCv, useLetterDocument } from "@/hooks/use-letters";

/** Mail ứng tuyển hiện như trong hộp soạn thư: tiêu đề, thân mail, chữ ký và CV sẽ đính kèm. */
export function EmailPreview({ documentId }: { documentId: string }) {
  const { record } = useLetterDocument(documentId);
  const cv = useJobCv(record?.jobId ?? null);
  if (!record) return null;

  const email = parseApplicationEmailContent(record.content);
  const { name, title, phone, email: address } = email.signature;
  const body = [
    email.greeting,
    ...email.paragraphs,
    email.attachmentNote,
    email.closing,
  ].filter((part): part is string => Boolean(part));

  return (
    <div className="mx-auto max-w-3xl overflow-hidden rounded-xl bg-white shadow-lg shadow-slate-900/5">
      <dl className="text-sm">
        <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-2.5 border-b border-slate-100 px-4 py-2.5 sm:px-5">
          <dt className="text-slate-500">Tiêu đề</dt>
          <dd className="font-semibold text-slate-900">
            {email.subject ?? "AI chưa viết tiêu đề — tự điền khi gửi"}
          </dd>
        </div>
      </dl>
      <div className="space-y-3 px-4 py-5 text-sm leading-relaxed text-slate-700 sm:px-6">
        {body.map((paragraph, index) => (
          <p key={`${index}-${paragraph}`}>{paragraph}</p>
        ))}
        <p>
          {email.signOff}
          {[name, title, phone, address]
            .filter((part): part is string => Boolean(part))
            .map((part) => (
              <span key={part} className="block">
                {part}
              </span>
            ))}
        </p>
      </div>
      {cv && (
        <div className="mx-4 mb-5 inline-flex items-center gap-2.5 rounded-lg border border-slate-200 px-3 py-2 text-sm sm:mx-6">
          <Paperclip className="size-4 text-slate-400" />
          <span>
            <span className="block font-semibold text-slate-900">
              {cv.title}
            </span>
            <span className="block text-xs text-slate-500">
              CV viết cho tin này — tải về và đính kèm khi gửi
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
