export const MAX_PDF_BYTES = 10 * 1024 * 1024;

const MAX_PAGES = 10;

export interface PdfText {
  text: string;
  pages: number;
  pagesRead: number;
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

  for (let number = 1; number <= pagesRead; number++) {
    const page = await doc.getPage(number);
    const content = await page.getTextContent();
    let line = "";
    for (const item of content.items) {
      if (!("str" in item)) continue;
      line += item.str;
      if (item.hasEOL) {
        lines.push(line);
        line = "";
      }
    }
    if (line) lines.push(line);
  }

  const pages = doc.numPages;
  await task.destroy();
  return { text: lines.join("\n"), pages, pagesRead };
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
