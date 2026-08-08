import { NextResponse } from "next/server";

export function middleware(request) {
  return NextResponse.next();
}

// Hangi yollarda çalışacağını belirtiyoruz (API ve statik dosyaları teğet geçer)
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
