"use client";

import { useState, useSyncExternalStore, useMemo } from "react";
import { ArrowSquareOut, ArrowUpRight, Gift } from "@phosphor-icons/react/ssr";
import { DashSection } from "@/components/dashboard/dash-section";
import { Card } from "@/components/ui/card";
import { cn } from "@/utils";
import {
  AFFILIATE_OFFERS,
  affiliateLink,
  pickOffers,
  type AffiliateOffer,
  type AffiliatePlacement,
} from "@/lib/affiliate";

let clientSeed = 0;
function getClientSeed(): number {
  if (clientSeed === 0) clientSeed = Math.floor(Math.random() * 10_000) + 1;
  return clientSeed;
}

/** Random rotation cho các tin để sản phẩm xoay tua đều, SSR trả về 0 để tránh lỗi hydration. */
function useRotation(seed?: string | number | null): number {
  const randomOffset = useSyncExternalStore(() => () => {}, getClientSeed, () => 0);
  return useMemo(() => {
    let hash = 0;
    const str = String(seed ?? "");
    for (let i = 0; i < str.length; i++) hash = (hash << 5) - hash + str.charCodeAt(i);
    return Math.abs(hash) + randomOffset;
  }, [randomOffset, seed]);
}

/** Nhãn header "Tài trợ" */
function Header({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
      <span>{label}</span>
      <span className="rounded-full border border-slate-200 px-1.5 py-px text-[10px] tracking-wide uppercase">
        Tài trợ
      </span>
    </div>
  );
}

/** Một dòng sản phẩm: ảnh, tên, dòng phụ (kỹ năng hoặc nơi bán) và icon mở link; dùng chung cho mọi thẻ gợi ý sản phẩm. */
function OfferRow({ href, offer, skill }: { href: string; offer: AffiliateOffer; skill?: string | null }) {
  return (
    <li className="border-t border-slate-100 first:border-t-0">
      <a
        href={href}
        target="_blank"
        rel="sponsored noopener noreferrer"
        className="group grid grid-cols-[5rem_minmax(0,1fr)_auto] items-center gap-4 py-3"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={offer.images["300x250"]}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          className="size-20 rounded-xl bg-slate-100 object-cover"
        />
        <span className="min-w-0">
          <span className="line-clamp-2 text-sm font-semibold text-slate-900 group-hover:text-primary-600">
            {offer.title}
          </span>
          <span className="block text-xs text-slate-500">
            {skill ? `Cho kỹ năng ${skill} · ${offer.provider}` : offer.provider}
          </span>
        </span>
        <ArrowSquareOut className="size-4 text-slate-400 group-hover:text-primary-600" />
      </a>
    </li>
  );
}

/**
 * Thẻ gợi ý sản phẩm theo kỹ năng / ngành nghề:
 * Tự động cấu hình số lượng, tiêu đề và cuộn (scroll) theo vị trí (dashboard hoặc job-detail).
 */
export function SkillResources({
  placement = "job-detail",
  occupation,
  skills,
  missingSkills,
  jobId,
  className,
}: {
  placement?: AffiliatePlacement;
  occupation?: string | null;
  skills?: string[];
  missingSkills?: string[];
  jobId?: string;
  className?: string;
}) {
  const activeSkills = skills ?? missingSkills ?? [];
  const rotation = useRotation(jobId ?? occupation);
  const picked = pickOffers(AFFILIATE_OFFERS, {
    skills: activeSkills,
    occupation,
    max: placement === "dashboard" ? 10 : 2,
    rotation,
  });
  if (picked.length === 0) return null;

  if (placement === "dashboard") {
    return (
      <Card className={className}>
      <DashSection
        title="Sản phẩm cho ngành của bạn"
        icon={Gift}
        action={<span className="text-2xs font-semibold tracking-[0.06em] text-slate-400 uppercase">Tài trợ</span>}
      >
        <ul className="max-h-[209px] overflow-y-auto pr-1.5 [scrollbar-width:thin]">
          {picked.map(({ offer, skill }) => (
            <OfferRow key={offer.id} href={affiliateLink(offer, placement, skill)} offer={offer} skill={skill} />
          ))}
        </ul>
        <p className="mt-2 text-xs text-slate-400">
          Careelot có thể nhận hoa hồng khi bạn mua qua các liên kết này. Giá bạn trả không đổi.
        </p>
      </DashSection>
      </Card>
    );
  }

  const headerLabel = picked.every((item) => item.skill)
    ? "Tài liệu cho kỹ năng còn thiếu"
    : "Gợi ý sản phẩm cho công việc này";

  return (
    <div className={cn("@container grid gap-2.5 rounded-xl border border-slate-200/80 bg-white p-4", className)}>
      <Header label={headerLabel} />

      <ul className="grid gap-x-6 @2xl:grid-cols-2 @2xl:[&>li]:border-t-0">
        {picked.map(({ offer, skill }) => (
          <OfferRow key={offer.id} href={affiliateLink(offer, placement, skill)} offer={offer} skill={skill} />
        ))}
      </ul>

      <p className="text-[11px] leading-snug text-slate-500">
        Careelot có thể nhận hoa hồng khi bạn mua qua các liên kết này. Giá bạn trả không đổi.
      </p>
    </div>
  );
}

/** Cụm thẻ tài trợ cho cột phải (dùng trên trang Ngân hàng câu hỏi phỏng vấn) */
export function SponsoredRailCard({
  placement = "question-bank",
  label = "Chuẩn bị phỏng vấn",
  onClose,
}: {
  placement?: AffiliatePlacement;
  label?: string;
  onClose?: () => void;
}) {
  const rotation = useRotation(placement);
  const [closed, setClosed] = useState(false);
  const picked = pickOffers(AFFILIATE_OFFERS, { placement, max: 2, rotation });
  if (closed || picked.length === 0) return null;

  return (
    <div className="sticky top-6 grid gap-3">
      <div className="flex items-center gap-2 px-1">
        <div className="min-w-0 flex-1">
          <Header label={label} />
        </div>
        {onClose && (
          <button
            type="button"
            onClick={() => {
              setClosed(true);
              onClose();
            }}
            className="cursor-pointer text-[11px] text-slate-400 transition-colors hover:text-slate-700"
          >
            Ẩn
          </button>
        )}
      </div>

      {picked.map(({ offer, skill }) => (
        <a
          key={offer.id}
          href={affiliateLink(offer, placement, skill)}
          target="_blank"
          rel="sponsored noopener noreferrer"
          className="group grid gap-2 rounded-xl border border-slate-200/80 bg-white p-3 transition-colors hover:border-primary-300"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={offer.images["300x250"]}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            className="aspect-square w-full rounded-lg bg-slate-50 object-cover"
          />
          <span className="line-clamp-2 text-[13px] leading-snug font-medium text-slate-900">{offer.title}</span>
          <span className="flex items-center justify-between text-xs font-semibold text-slate-700 group-hover:text-primary-700">
            Xem trên {offer.provider}
            <ArrowUpRight className="size-3.5" />
          </span>
        </a>
      ))}

      <p className="px-1 text-[11px] leading-snug text-slate-500">
        Careelot có thể nhận hoa hồng khi bạn mua qua các liên kết này. Giá bạn trả không đổi.
      </p>
    </div>
  );
}
