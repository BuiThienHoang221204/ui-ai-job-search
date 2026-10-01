import { NextResponse, type NextRequest } from "next/server";

/** Cờ "còn phiên hay không", KHÔNG httpOnly - access token chỉ sống 15 phút nên dùng nó làm dấu hiệu đăng nhập sẽ đá người dùng hợp lệ về /login mỗi 15 phút. */
const SESSION_HINT_COOKIE = "aijob_session";

/** Chỉ chặn ở tầng điều hướng (không xác thực chữ ký) - bảo vệ dữ liệu thật vẫn là JwtAuthGuard ở backend. */
export function middleware(request: NextRequest) {
  const session = request.cookies.get(SESSION_HINT_COOKIE)?.value;
  if (session) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
