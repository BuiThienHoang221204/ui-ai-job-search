/** Bỏ dấu tiếng Việt và hạ chữ thường, để gõ không dấu vẫn tìm ra. */
export const fold = (value: string): string =>
  value
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
