import { htmlToText } from "@/lib/text";

export type DescBlock =
  | { type: "heading"; text: string }
  | { type: "list"; items: string[] }
  | { type: "para"; text: string };

const BULLET = /^[-•–—+*·]\s+/;
const SEPARATOR = /^[-\s–—_=.*]{3,}$/;
const NUMBERED = /^\d+(\.\d+)*\s*[.):,]\s+\S/;
const SECTION =
  /^(mô tả công việc|mô tả chung.*|chi tiết.*|yêu cầu.*|quyền lợi.*|phúc lợi.*|chế độ.*|đãi ngộ.*|trách nhiệm.*|nhiệm vụ.*|kỹ năng.*|kinh nghiệm|học vấn|trình độ.*|job description|responsibilities|requirements|benefits|what you.*|about (us|the).*)\s*:?\s*$/i;

function isAllCaps(line: string): boolean {
  const letters = line.replace(/[^\p{L}]/gu, "");
  return letters.length >= 2 && letters === letters.toLocaleUpperCase("vi");
}

function isHeading(line: string): boolean {
  if (line.length > 70) return NUMBERED.test(line);
  return (
    line.endsWith(":") ||
    NUMBERED.test(line) ||
    SECTION.test(line) ||
    isAllCaps(line)
  );
}

/** Tách mô tả tin (HTML thô hoặc text) thành các khối tiêu đề mục / danh sách gạch đầu dòng / đoạn văn để hiển thị một mẫu thống nhất. */
export function parseDescription(raw: string): DescBlock[] {
  const blocks: DescBlock[] = [];
  let list: { type: "list"; items: string[] } | null = null;

  for (const rawLine of htmlToText(raw).split("\n")) {
    const line = rawLine.trim();
    if (!line || SEPARATOR.test(line)) {
      list = null;
      continue;
    }
    if (BULLET.test(line)) {
      const item = line.replace(BULLET, "").trim();
      if (!item) continue;
      if (!list) {
        list = { type: "list", items: [] };
        blocks.push(list);
      }
      list.items.push(item);
      continue;
    }
    list = null;
    if (isHeading(line)) {
      blocks.push({ type: "heading", text: line.replace(/\s*:\s*$/, "") });
    } else {
      blocks.push({ type: "para", text: line });
    }
  }

  return blocks;
}
