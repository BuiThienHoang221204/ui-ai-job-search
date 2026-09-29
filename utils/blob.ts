const REVOKE_AFTER_MS = 60_000;

/** Mở một Blob trong tab mới rồi thu hồi URL tạm sau một khoảng chờ. */
export function openBlobInNewTab(blob: Blob): void {
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener");
  setTimeout(() => URL.revokeObjectURL(url), REVOKE_AFTER_MS);
}
