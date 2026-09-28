import { NextResponse, type NextRequest } from "next/server";

const AUTH_COOKIE = "aijob_token";

/** Chuyển hướng về /login khi vào /dashboard mà chưa có cookie đăng nhập. */
export function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (token) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
