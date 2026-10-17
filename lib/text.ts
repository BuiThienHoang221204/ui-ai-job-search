/** Bỏ dấu tiếng Việt và hạ chữ thường, để gõ không dấu vẫn tìm ra. */
export const fold = (value: string): string =>
  value
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

/** Viết hoa chữ cái đầu ("quyết toán thuế" → "Quyết toán thuế"); từ đầu đã có chữ hoa ("iOS", "eKYC") thì giữ nguyên. */
export function capitalize(value: string): string {
  const firstWord = value.split(" ")[0];
  if (firstWord !== firstWord.toLowerCase()) return value;
  return value.charAt(0).toLocaleUpperCase("vi") + value.slice(1);
}
