export type InlineToken = { text: string; bold: boolean };

export type MarkdownBlock =
  | { kind: "heading"; level: 2 | 3; text: string }
  | { kind: "paragraph"; lines: InlineToken[][] }
  | { kind: "list"; ordered: boolean; items: InlineToken[][] }
  | { kind: "table"; header: string[]; rows: string[][] }
  | { kind: "code"; text: string }
  | { kind: "rule" };

/** Tách `**đậm**` khỏi chữ thường. Dấu sao lẻ được giữ nguyên như chữ. */
export function parseInline(line: string): InlineToken[] {
  const tokens: InlineToken[] = [];

  for (const part of line.split(/(\*\*[^*]+\*\*)/g)) {
    if (!part) continue;
    const bold = part.startsWith("**") && part.endsWith("**");
    tokens.push({ text: bold ? part.slice(2, -2) : part, bold });
  }

  return tokens.length > 0 ? tokens : [{ text: line, bold: false }];
}

/** Tách một dòng bảng markdown thành các ô. */
const cells = (line: string): string[] =>
  line
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((cell) => cell.trim().replace(/\*\*/g, ""));

/** Dòng phân cách của bảng: `|---|:---:|` và các biến thể. */
const isDivider = (line: string): boolean =>
  /^\|?[\s:|-]+\|[\s:|-]*$/.test(line) && line.includes("-");

/** Dòng có phải một hàng của bảng markdown hay không. */
const isTableRow = (line: string): boolean => line.trim().startsWith("|");

/** Phân tích markdown đơn giản thành các khối để hiển thị. */
export function parseMarkdown(input: string): MarkdownBlock[] {
  const lines = input.replace(/\r\n/g, "\n").split("\n");
  const blocks: MarkdownBlock[] = [];

  let paragraph: string[] = [];
  const flush = () => {
    if (paragraph.length === 0) return;
    blocks.push({ kind: "paragraph", lines: paragraph.map(parseInline) });
    paragraph = [];
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === "") {
      flush();
      continue;
    }

    if (trimmed.startsWith("```")) {
      flush();
      const body: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        body.push(lines[i]);
        i += 1;
      }
      blocks.push({ kind: "code", text: body.join("\n") });
      continue;
    }

    if (/^-{3,}$/.test(trimmed) || /^_{3,}$/.test(trimmed)) {
      flush();
      blocks.push({ kind: "rule" });
      continue;
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(trimmed);
    if (heading) {
      flush();
      blocks.push({
        kind: "heading",
        level: heading[1].length <= 2 ? 2 : 3,
        text: heading[2].replace(/\*\*/g, "").trim(),
      });
      continue;
    }

    if (isTableRow(trimmed) && isDivider(lines[i + 1]?.trim() ?? "")) {
      flush();
      const header = cells(trimmed);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && isTableRow(lines[i].trim())) {
        rows.push(cells(lines[i].trim()));
        i += 1;
      }
      i -= 1;
      blocks.push({ kind: "table", header, rows });
      continue;
    }

    const bullet = /^([-*+]|\d+[.)])\s+(.*)$/.exec(trimmed);
    if (bullet) {
      flush();
      const ordered = /\d/.test(bullet[1]);
      const items: InlineToken[][] = [parseInline(bullet[2])];

      while (i + 1 < lines.length) {
        const next = /^([-*+]|\d+[.)])\s+(.*)$/.exec(lines[i + 1].trim());
        if (!next || /\d/.test(next[1]) !== ordered) break;
        items.push(parseInline(next[2]));
        i += 1;
      }

      blocks.push({ kind: "list", ordered, items });
      continue;
    }

    paragraph.push(trimmed);
  }

  flush();
  return blocks;
}

/** Bỏ hết cú pháp markdown, giữ lại chữ để hiện trên một dòng. */
export function toPlainText(input: string): string {
  return input
    .replace(/```[\s\S]*?```/g, " ")
    .split("\n")
    .filter((line) => !isDivider(line.trim()))
    .map((line) => {
      const trimmed = line.trim();
      if (isTableRow(trimmed)) return cells(trimmed).filter(Boolean).join(" · ");
      return trimmed
        .replace(/^#{1,6}\s+/, "")
        .replace(/^([-*+]|\d+[.)])\s+/, "")
        .replace(/^-{3,}$/, "");
    })
    .join(" ")
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}
