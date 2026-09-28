/** Giá trị có phải một object thường (không phải mảng hay null) hay không. */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Chuỗi đã cắt khoảng trắng; chuỗi rỗng hoặc không phải chuỗi thì trả null. */
export function text(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** Đọc mảng chuỗi đã cắt khoảng trắng, bỏ các phần tử rỗng hoặc không phải chuỗi. */
export function textList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(text).filter((item): item is string => item !== null);
}

/** Đọc từng phần tử của mảng bằng `parse`, bỏ các phần tử hỏng. */
export function objectList<T>(
  value: unknown,
  parse: (item: unknown) => T | null,
): T[] {
  if (!Array.isArray(value)) return [];
  return value.map(parse).filter((item): item is T => item !== null);
}

/** Số nguyên trong khoảng cho trước, ngoài khoảng thì coi như thiếu. */
export function boundedInt(
  value: unknown,
  min: number,
  max: number,
): number | null {
  if (typeof value !== "number" || !Number.isInteger(value)) return null;
  return value >= min && value <= max ? value : null;
}
