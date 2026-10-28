import { AxiosError } from "axios";

const REVOKE_AFTER_MS = 60_000;

/** Mở một Blob trong tab mới rồi thu hồi URL tạm sau một khoảng chờ. */
export function openBlobInNewTab(blob: Blob): void {
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener");
  setTimeout(() => URL.revokeObjectURL(url), REVOKE_AFTER_MS);
}

/** Đổi lỗi có thân là Blob thành lỗi mà `apiErrorMessage` đọc được. */
export async function blobErrorToError(error: unknown): Promise<unknown> {
  if (!(error instanceof AxiosError)) return error;

  const data: unknown = error.response?.data;
  if (!(data instanceof Blob)) return error;

  try {
    const text = await data.text();
    if (error.response) error.response.data = JSON.parse(text);
  } catch {}
  return error;
}

/** Đổi lỗi có thân là chữ thô thành lỗi mà `apiErrorMessage` đọc được. */
export function textErrorToError(error: unknown): unknown {
  if (!(error instanceof AxiosError)) return error;

  const data: unknown = error.response?.data;
  if (typeof data !== "string") return error;

  try {
    if (error.response) error.response.data = JSON.parse(data);
  } catch {}
  return error;
}
