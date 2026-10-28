import Link from "next/link";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import {
  Clock,
  EnvelopeSimple,
  FileText,
  Info,
  Lightning,
  Scales,
} from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/cn";
import {
  LEGAL_EFFECTIVE_DATE,
  OPERATOR,
  PRIVACY_PATH,
  TERMS_PATH,
} from "@/lib/legal";
import type { LegalSection, LegalTone } from "@/types";
import { IconBadge } from "./icon-badge";
import { LegalToc } from "./legal-toc";
import { PrintButton } from "./print-button";

const SWITCH = [
  { key: "privacy", href: PRIVACY_PATH, label: "Chính sách bảo mật" },
  { key: "terms", href: TERMS_PATH, label: "Điều khoản sử dụng" },
] as const;

/** Khung chung của Chính sách bảo mật và Điều khoản sử dụng: tóm tắt một phút ở đầu, mỗi mục một thẻ có dòng "Nói ngắn gọn", mục lục bên trái và ô liên hệ cuối trang. */
export function LegalPage({
  current,
  title,
  lead,
  basis,
  readMinutes,
  summary,
  sections,
}: {
  current: (typeof SWITCH)[number]["key"];
  title: string;
  lead: string;
  basis?: string;
  readMinutes: number;
  summary: Array<{
    icon: PhosphorIcon;
    tone: LegalTone;
    title: string;
    text: string;
  }>;
  sections: LegalSection[];
}) {
  const other = SWITCH.find((item) => item.key !== current)!;

  return (
    <div className="space-y-6">
      <header className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <span
          aria-hidden
          className="from-primary-100/60 pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-radial to-transparent to-70%"
        />
        <div className="relative">
          <div className="inline-flex gap-1 rounded-xl bg-slate-100 p-1 text-xs font-semibold sm:text-sm">
            {SWITCH.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "rounded-lg px-2.5 py-1.5 whitespace-nowrap text-slate-500 hover:text-slate-900 sm:px-3.5",
                  item.key === current && "bg-white text-slate-900 shadow-sm",
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <h1 className="font-display mt-5 text-3xl text-slate-900 sm:text-[2.4rem]">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl leading-relaxed text-slate-500">
            {lead}
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-700">
            <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1">
              <Clock className="size-4 text-slate-500" />
              Có hiệu lực từ {LEGAL_EFFECTIVE_DATE}
            </span>
            {basis && (
              <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1">
                <Scales className="size-4 text-slate-500" />
                {basis}
              </span>
            )}
            <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1">
              <FileText className="size-4 text-slate-500" />
              Đọc khoảng {readMinutes} phút
            </span>
            <PrintButton />
          </div>

          <h2 className="mt-6 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Lightning weight="fill" className="size-4 text-amber-500" />
            Tóm tắt trong 1 phút
          </h2>
          <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {summary.map((item) => (
              <div
                key={item.title}
                className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3.5 text-sm leading-relaxed"
              >
                <IconBadge icon={item.icon} tone={item.tone} />
                <span>
                  <b className="block font-semibold text-slate-900">
                    {item.title}
                  </b>
                  <span className="text-slate-600">{item.text}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-[14.5rem_minmax(0,1fr)]">
        <LegalToc
          items={sections.map((section) => ({
            id: section.id,
            label: section.title,
            icon: <section.icon />,
          }))}
          other={other}
        />

        <div className="min-w-0 space-y-3.5">
          {sections.map((section, index) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
            >
              <div className="flex items-center gap-3">
                <IconBadge icon={section.icon} tone={section.tone} />
                <div>
                  <p className="text-2xs font-semibold tracking-widest text-slate-500 uppercase">
                    Mục {index + 1}
                  </p>
                  <h2 className="text-xl font-semibold text-slate-900">
                    {section.title}
                  </h2>
                </div>
              </div>
              <p className="mt-4 flex gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm leading-relaxed text-slate-900">
                <Info className="text-primary-600 mt-0.5 size-4.5 shrink-0" />
                <span>
                  <b className="text-primary-600 font-semibold">
                    Nói ngắn gọn:
                  </b>{" "}
                  {section.short}
                </span>
              </p>
              <div className="mt-4 leading-relaxed text-slate-700 [&_b]:font-semibold [&_b]:text-slate-900 [&_p+p]:mt-2.5">
                {section.body}
              </div>
            </section>
          ))}

          <div className="border-primary-100 from-primary-50 flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-linear-to-br to-white p-5 sm:p-6">
            <div>
              <h2 className="font-display text-lg text-slate-900">
                Còn thắc mắc?
              </h2>
              <p className="text-sm text-slate-500">
                Gửi email, chúng tôi trả lời trong 72 giờ làm việc.
              </p>
            </div>
            <a
              href={`mailto:${OPERATOR.email}`}
              className="bg-primary-600 hover:bg-primary-700 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
            >
              <EnvelopeSimple className="size-4.5" />
              {OPERATOR.email}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
