export const MAX_PDF_BYTES = 10 * 1024 * 1024;

const MAX_PAGES = 10;

const COLUMN_START = 0.25;
const COLUMN_BUCKET = 12;
const COLUMN_GAP = 0.06;
const COLUMN_MIN_LINES = 8;
const COLUMN_MIN_SHARE = 0.2;

export interface PdfText {
  text: string;
  pages: number;
  pagesRead: number;
  multiColumn: boolean;
}

export interface PdfTextItem {
  x: number;
  y: number;
  width: number;
  text: string;
}

/** Trang chia nhiều cột hoặc kẻ bảng: nhiều dòng cùng bắt đầu ở một mép trái nằm sâu bên phải trang, như cột chính cạnh thanh bên. */
export function isMultiColumn(
  items: PdfTextItem[],
  pageWidth: number,
): boolean {
  const rows = new Map<number, PdfTextItem[]>();
  for (const item of items) {
    if (!item.text.trim()) continue;
    const y = Math.round(item.y);
    rows.set(y, [...(rows.get(y) ?? []), item]);
  }

  const starts = new Map<number, number>();
  for (const row of rows.values()) {
    row.sort((a, b) => a.x - b.x);
    const lineStarts = [row[0].x];
    for (let index = 1; index < row.length; index++) {
      const previous = row[index - 1];
      if (row[index].x - previous.x - previous.width > pageWidth * COLUMN_GAP) {
        lineStarts.push(row[index].x);
      }
    }
    for (const x of lineStarts) {
      if (x < pageWidth * COLUMN_START) continue;
      const bucket = Math.round(x / COLUMN_BUCKET);
      starts.set(bucket, (starts.get(bucket) ?? 0) + 1);
    }
  }

  const most = Math.max(0, ...starts.values());
  return most >= COLUMN_MIN_LINES && most >= rows.size * COLUMN_MIN_SHARE;
}

/** Đọc chữ của PDF ngay trong trình duyệt bằng pdf.js, tối đa 10 trang đầu; file không rời máy người dùng. */
export async function readPdfText(file: File): Promise<PdfText> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();

  const task = pdfjs.getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
  });
  const doc = await task.promise;
  const pagesRead = Math.min(doc.numPages, MAX_PAGES);
  const lines: string[] = [];
  let multiColumn = false;

  for (let number = 1; number <= pagesRead; number++) {
    const page = await doc.getPage(number);
    const content = await page.getTextContent();
    const items: PdfTextItem[] = [];
    let line = "";
    for (const item of content.items) {
      if (!("str" in item)) continue;
      items.push({
        x: item.transform[4],
        y: item.transform[5],
        width: item.width,
        text: item.str,
      });
      line += item.str;
      if (item.hasEOL) {
        lines.push(line);
        line = "";
      }
    }
    if (line) lines.push(line);
    if (isMultiColumn(items, page.getViewport({ scale: 1 }).width)) {
      multiColumn = true;
    }
  }

  const pages = doc.numPages;
  await task.destroy();
  return { text: lines.join("\n"), pages, pagesRead, multiColumn };
}

/** Câu báo lỗi cho người dùng khi pdf.js không mở được file; `null` nếu không phải lỗi của file. */
export function pdfErrorMessage(error: unknown): string | null {
  const name = error instanceof Error ? error.name : "";
  if (name === "PasswordException") {
    return "File PDF đang đặt mật khẩu nên không đọc được. Bỏ mật khẩu rồi thử lại.";
  }
  if (name === "InvalidPDFException") {
    return "File này không phải PDF hợp lệ. Hãy xuất CV ra PDF rồi thử lại.";
  }
  return null;
}
