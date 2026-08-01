import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    const validUser = process.env.ADMIN_USER || "admin";
    const validPass = process.env.ADMIN_PASS || "Balans2026!";

    if (username === validUser && password === validPass) {
      const response = NextResponse.json({ success: true });

      // Güvenli Oturum Çerezi (Cookie) Tanımla
      response.cookies.set("balans_session", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 gün geçerli
        path: "/",
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: "Kullanıcı adı veya şifre hatalı!" },
      { status: 401 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Sunucu hatası" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("balans_session");
  return response;
}
