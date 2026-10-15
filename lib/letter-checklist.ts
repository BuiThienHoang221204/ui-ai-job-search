import type { LetterCheck, LetterKind } from "@/types";
import { fold } from "@/lib/text";

const PLACEHOLDER =
  /\[[^\]]{1,40}\]|không cung cấp|chưa cung cấp|<[^>]{1,40}>/i;

export const WORD_RANGE: Record<LetterKind, [number, number]> = {
  APPLICATION_EMAIL: [150, 250],
  COVER_LETTER: [250, 400],
};

/** Số chữ (từ) của một đoạn văn, tách theo khoảng trắng. */
export function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

/** Số lần một cụm xuất hiện trong văn bản, không phân biệt hoa thường và dấu. */
export function mentions(text: string, phrase: string): number {
  const needle = fold(phrase).trim();
  if (needle.length < 2) return 0;
  return fold(text).split(needle).length - 1;
}

/** Phần lõi của chức danh để dò trong thư: bỏ tiền tố địa điểm ("HCM –") và phần trong ngoặc. */
export function coreTitle(title: string): string {
  const parts = title.replace(/\([^)]*\)/g, "").split(/\s[–—-]\s/);
  return parts.reduce(
    (a, b) => (b.trim().length > a.length ? b.trim() : a),
    "",
  );
}

/** Các mục cần soát trước khi gửi thư/mail; chỉ dùng chữ của thư và thông tin tin, không gọi AI. */
export function letterChecklist(input: {
  kind: LetterKind;
  text: string;
  subject: string | null;
  company: string | null;
  title: string | null;
  hasJobCv: boolean;
}): { words: number; range: [number, number]; checks: LetterCheck[] } {
  const { kind, text, subject, company, title, hasJobCv } = input;
  const words = wordCount(text);
  const range = WORD_RANGE[kind];
  const checks: LetterCheck[] = [];

  if (company) {
    const count = mentions(text, company);
    checks.push({
      id: "company",
      ok: count > 0,
      title: count > 0 ? "Nhắc đúng tên công ty" : "Chưa nhắc tên công ty",
      detail:
        count > 0
          ? `“${company}” xuất hiện ${count} lần`
          : `Thư chung chung dễ bị bỏ qua — thêm “${company}” vào đoạn mở.`,
    });
  }
  if (title) {
    const role = coreTitle(title);
    const count = mentions(`${subject ?? ""} ${text}`, role);
    checks.push({
      id: "title",
      ok: count > 0,
      title:
        count > 0 ? "Nêu đúng vị trí ứng tuyển" : "Chưa nêu vị trí ứng tuyển",
      detail:
        count > 0
          ? `“${role}” có trong thư`
          : `Ghi rõ “${role}” để người đọc biết bạn ứng tuyển gì.`,
    });
  }

  const placeholder = PLACEHOLDER.exec(text);
  checks.push({
    id: "placeholder",
    ok: !placeholder,
    title: placeholder ? "Còn câu giữ chỗ" : "Không còn câu giữ chỗ",
    detail: placeholder
      ? `Thư đang có “${placeholder[0]}” — sửa trước khi gửi.`
      : "Không có “[tên]”, “không cung cấp”…",
  });

  checks.push({
    id: "length",
    ok: words >= range[0] && words <= range[1],
    title:
      words < range[0]
        ? "Hơi ngắn"
        : words > range[1]
          ? "Hơi dài"
          : "Độ dài vừa phải",
    detail: `${words} chữ · nên ${range[0]}–${range[1]} chữ`,
  });

  if (kind === "APPLICATION_EMAIL" && subject) {
    const shouting =
      subject === subject.toUpperCase() && /[A-ZÀ-Ỹ]/.test(subject);
    checks.push({
      id: "subject",
      ok: !shouting,
      title: shouting ? "Tiêu đề đang viết hoa toàn bộ" : "Tiêu đề rõ ràng",
      detail: shouting
        ? "Viết hoa toàn bộ dễ bị coi là spam."
        : "Có vị trí và họ tên, không viết hoa toàn bộ",
    });
  }

  checks.push({
    id: "cv",
    ok: hasJobCv,
    title: hasJobCv ? "Có CV viết cho tin này" : "Chưa có CV riêng cho tin này",
    detail: hasJobCv
      ? kind === "APPLICATION_EMAIL"
        ? "Nhớ đính kèm khi gửi — Gmail không tự đính kèm được."
        : "Nộp kèm thư này."
      : "Thư nên đi cùng CV bám đúng tin.",
  });

  return { words, range, checks };
}
