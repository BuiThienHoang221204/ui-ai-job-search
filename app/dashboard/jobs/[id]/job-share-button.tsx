"use client";

import {
  Check,
  EnvelopeSimple,
  FacebookLogo,
  LinkSimple,
  LinkedinLogo,
  ShareNetwork,
} from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { useCopy } from "@/hooks/use-copy";
import { useDropdown } from "@/hooks/use-dropdown";
import { useReferrals } from "@/hooks/use-referrals";
import { useSession } from "@/hooks/use-session";
import { jobShareUrl } from "@/lib/public-job";

const ITEM =
  "flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-slate-800 hover:bg-slate-100";

/** Nút chia sẻ tin: điện thoại mở bảng chia sẻ của máy, máy tính mở menu sao chép link, Facebook, LinkedIn, email. */
export function JobShareButton({
  jobId,
  title,
}: {
  jobId: string;
  title: string;
}) {
  const { user } = useSession();
  const { data: referral } = useReferrals(Boolean(user));
  const { copied, copy } = useCopy();
  const { open, setOpen, root } = useDropdown();

  const url = () => jobShareUrl(window.location.origin, jobId, referral?.code);

  const share = () => {
    if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
      navigator.share({ title, url: url() }).catch(() => {});
      return;
    }
    setOpen((now) => !now);
  };

  return (
    <div ref={root} className="relative flex-1 sm:flex-none">
      <Button variant="outline" className="w-full" onClick={share}>
        <ShareNetwork className="size-4.5" />
        Chia sẻ
      </Button>
      {open && (
        <div className="absolute top-full left-0 z-20 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
          <p className="border-b border-slate-100 px-2.5 pt-1 pb-2 text-xs text-slate-500">
            Người nhận mở link là xem được tin, không cần tài khoản.
          </p>
          <button
            type="button"
            className={ITEM}
            onClick={() => copy("link", url())}
          >
            {copied === "link" ? (
              <Check className="size-4.5 text-emerald-600" />
            ) : (
              <LinkSimple className="size-4.5" />
            )}
            {copied === "link" ? "Đã sao chép link" : "Sao chép link"}
          </button>
          <a
            className={ITEM}
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url())}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FacebookLogo weight="fill" className="size-4.5" />
            Chia sẻ lên Facebook
          </a>
          <a
            className={ITEM}
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url())}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <LinkedinLogo weight="fill" className="size-4.5" />
            Chia sẻ lên LinkedIn
          </a>
          <a
            className={ITEM}
            href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url())}`}
          >
            <EnvelopeSimple className="size-4.5" />
            Gửi qua email
          </a>
        </div>
      )}
    </div>
  );
}
