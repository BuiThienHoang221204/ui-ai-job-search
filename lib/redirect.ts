const BASE = "http://careelot.invalid";

/** Tham số `next` sau đăng nhập -> đường dẫn nội bộ an toàn, không thì trả `fallback`. */
export function safeNextPath(raw: string | null, fallback: string): string {
  if (!raw || !raw.startsWith("/") || /[\\\u0000-\u001f\u007f]/.test(raw))
    return fallback;
  try {
    const url = new URL(raw, BASE);
    return url.origin === BASE
      ? url.pathname + url.search + url.hash
      : fallback;
  } catch {
    return fallback;
  }
}

/** Đường dẫn mở modal đăng nhập/đăng ký trên trang chủ, giữ `next` và `ref` của đường dẫn cũ `/login`, `/register`. */
export function authEntryPath(
  mode: "login" | "register",
  params: Record<string, string | string[] | undefined>,
): string {
  const query = new URLSearchParams({ auth: mode });
  for (const key of ["next", "ref"]) {
    const value = params[key];
    if (typeof value === "string" && value) query.set(key, value);
  }
  return `/dashboard?${query.toString()}`;
}
