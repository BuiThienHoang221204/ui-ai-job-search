"use client";

import { useEffect, useRef } from "react";
import {
  Check,
  DownloadSimple,
  FacebookLogo,
  LinkSimple,
  LinkedinLogo,
} from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { useCopy } from "@/hooks/use-copy";
import { useReferrals } from "@/hooks/use-referrals";
import { useSession } from "@/hooks/use-session";
import { drawShareCard } from "@/lib/cv-check";
import type { CvCheckResult } from "@/types";

/** Ảnh chia sẻ kết quả; người đã đăng nhập thì link kèm mã giới thiệu. */
export function CvShare({ result }: { result: CvCheckResult }) {
  const { user } = useSession();
  const { data: referral } = useReferrals(Boolean(user));
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { copied, copy } = useCopy();

  let link = `${window.location.origin}/dashboard/cv-check`;
  if (user && referral) link = `${link}?ref=${referral.code}`;

  useEffect(() => {
    if (canvasRef.current) drawShareCard(canvasRef.current, result, link);
  }, [result, link]);

  const download = () => {
    const anchor = document.createElement("a");
    anchor.href = canvasRef.current?.toDataURL("image/png") ?? "";
    anchor.download = "careelot-cham-cv.png";
    anchor.click();
  };

  const encoded = encodeURIComponent(link);

  return (
    <div className="space-y-3">
      <canvas ref={canvasRef} className="w-full rounded-xl" />
      <div className="flex flex-wrap gap-2">
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" size="sm">
            <FacebookLogo weight="fill" className="size-4" />
            Facebook
          </Button>
        </a>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" size="sm">
            <LinkedinLogo weight="fill" className="size-4" />
            LinkedIn
          </Button>
        </a>
        <Button variant="outline" size="sm" onClick={download}>
          <DownloadSimple className="size-4" />
          Tải ảnh
        </Button>
        <Button variant="outline" size="sm" onClick={() => copy("link", link)}>
          {copied === "link" ? (
            <Check className="size-4" />
          ) : (
            <LinkSimple className="size-4" />
          )}
          {copied === "link" ? "Đã sao chép" : "Sao chép link"}
        </Button>
      </div>
      <p className="text-xs text-slate-500">
        Link mở trang Phân tích CV, không mở kết quả của bạn: kết quả không được
        lưu ở máy chủ.
      </p>
    </div>
  );
}
