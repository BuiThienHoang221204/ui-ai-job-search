"use client";

import { useCallback, useState } from "react";
import { apiErrorMessage } from "@/lib/axios";
import { MAX_CV_TEXT, pagesOfText } from "@/lib/cv-check";
import { MAX_PDF_BYTES, pdfErrorMessage, readPdfText } from "@/lib/pdf-browser";
import { cvCheckService } from "@/services";
import type { CvCheckPhase, CvCheckResult, CvCheckSource } from "@/types";

const FAILED = "Chưa phân tích được CV này. Thử lại sau ít phút.";

/** Phân tích một CV từ file PDF (đọc chữ ở trình duyệt) hoặc chữ dán vào; giữ nguồn, giai đoạn, kết quả và lỗi của trang Phân tích CV. */
export function useCvCheck() {
  const [source, setSource] = useState<CvCheckSource | null>(null);
  const [phase, setPhase] = useState<CvCheckPhase>("idle");
  const [result, setResult] = useState<CvCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (picked: File) => {
    setError(null);
    if (picked.size > MAX_PDF_BYTES) {
      setError(
        "File lớn hơn 10 MB. CV thường chỉ vài trăm KB — hãy xuất lại với ảnh nén nhỏ hơn.",
      );
      return;
    }
    setSource({ name: picked.name, file: picked, pages: null });
    setResult(null);
    setPhase("reading");
    try {
      const pdf = await readPdfText(picked);
      setSource({ name: picked.name, file: picked, pages: pdf.pages });
      setPhase("scoring");
      setResult(
        await cvCheckService.check({
          ...pdf,
          text: pdf.text.slice(0, MAX_CV_TEXT),
        }),
      );
    } catch (err) {
      setError(pdfErrorMessage(err) ?? apiErrorMessage(err, FAILED));
    } finally {
      setPhase("idle");
    }
  }, []);

  const runText = useCallback(async (raw: string) => {
    const text = raw.trim().slice(0, MAX_CV_TEXT);
    const pages = pagesOfText(text);
    setError(null);
    setSource({ name: "CV dán vào", file: null, pages });
    setResult(null);
    setPhase("scoring");
    try {
      setResult(await cvCheckService.check({ text, pages, pagesRead: pages }));
    } catch (err) {
      setError(apiErrorMessage(err, FAILED));
    } finally {
      setPhase("idle");
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setSource(null);
  }, []);

  return { source, phase, result, error, run, runText, reset };
}
