import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Публичные роуты — всегда доступны
  if (pathname === "/login" || pathname.startsWith("/api/") || pathname.startsWith("/_next") || pathname.startsWith("/media")) {
    return NextResponse.next();
  }

  // Проверяем cookie доступа
  const access = request.cookies.get("adonis_access")?.value;
  if (access === "granted") return NextResponse.next();

  // Нет доступа → на страницу входа
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|media|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
