"use client";

import { useState } from "react";
import { documentsService } from "@/services";
import { apiErrorMessage } from "@/lib/axios";
import { bulletPath, rewriteContext } from "@/lib/cv-checklist";
import { useCvDraft } from "@/hooks/use-cv-draft";
import type { BulletRewrite, CvBullet } from "@/types";

export interface BulletRewriteState {
  loading: boolean;
  result: BulletRewrite | null;
  error: string | null;
  ask: () => Promise<void>;
  apply: (text: string) => void;
}

/** Gợi ý viết lại một chỗ trên CV (câu, đoạn, chức danh) từ chữ đang hiện; "Dùng" chỉ thay chữ trong bản nháp, lưu như sửa tay. */
export function useBulletRewrite(
  bullet: CvBullet,
  text: string,
): BulletRewriteState {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BulletRewrite | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ask = async () => {
    const { recordId, content } = useCvDraft.getState();
    if (!recordId) return;
    setLoading(true);
    setError(null);
    try {
      setResult(
        await documentsService.rewriteBullet(recordId, {
          kind: bullet.kind,
          text,
          context: rewriteContext(content, bullet),
        }),
      );
    } catch (cause: unknown) {
      setResult(null);
      setError(
        apiErrorMessage(
          cause,
          "AI chưa viết được lúc này. Thử lại sau ít phút.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const apply = (suggestion: string) => {
    useCvDraft.getState().applyText(bulletPath(bullet), suggestion);
  };

  return { loading, result, error, ask, apply };
}
