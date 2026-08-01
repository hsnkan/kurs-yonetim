import { NextResponse } from "next/server";

export function middleware(request) {
  const session = request.cookies.get("balans_session");
  const { pathname } = request.nextUrl;

  // Giriş sayfasında veya API login ucundaysa müdahale etme
  if (pathname.startsWith("/login") || pathname.startsWith("/api/login")) {
    return NextResponse.next();
  }

  // Oturum yoksa doğrudan giriş sayfasına yönlendir
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
