/** Bỏ dấu tiếng Việt và hạ chữ thường, để gõ không dấu vẫn tìm ra. */
export const fold = (value: string): string =>
  value.toLowerCase().replace(/đ/g, "d").normalize("NFD").replace(/[̀-ͯ]/g, "");

/** Rút markdown thành chữ trơn cho đoạn xem trước: bỏ **đậm**, `code`, tiêu đề #, dấu đầu dòng và gộp xuống dòng thành khoảng trắng. */
export function plainPreview(value: string): string {
  return value
    .replace(/[*`#]+/g, "")
    .replace(/^\s*[-•]\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Chuyển HTML thô của mô tả tin (scrape về) thành văn bản dễ đọc: <br>, </p>, </div> thành xuống dòng, <li> thành gạch đầu dòng, bỏ các thẻ còn lại, giải mã entity rồi gộp bớt khoảng trắng và dòng trống. Kết quả render dạng text (React escape) nên an toàn với nội dung không tin cậy. */
export function htmlToText(value: string): string {
  return value
    .replace(/<\s*li[^>]*>/gi, "\n• ")
    .replace(/<\s*\/\s*(p|div|ul|ol|tr|h[1-6])\s*>/gi, "\n")
    .replace(/<\s*br\s*\/?\s*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCodePoint(Number(code)),
    )
    .replace(/[^\S\n]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Viết hoa chữ cái đầu ("quyết toán thuế" → "Quyết toán thuế"); từ đầu đã có chữ hoa ("iOS", "eKYC") thì giữ nguyên. */
export function capitalize(value: string): string {
  const firstWord = value.split(" ")[0];
  if (firstWord !== firstWord.toLowerCase()) return value;
  return value.charAt(0).toLocaleUpperCase("vi") + value.slice(1);
}
