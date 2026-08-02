import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();

    // Kullanıcının formdan girdiği veriler
    const girilenAd = (body.yoneticiAdi || "").toString().trim().toLowerCase();
    const girilenSifre = (body.sifre || "").toString().trim();

    // 🔒 Vercel / .env Üzerinden Gelen Yeni Değişkenleriniz
    const HEDEF_KULLANICI = (process.env.ADMIN_USER || "Balans")
      .toString()
      .trim()
      .toLowerCase();
    const HEDEF_SIFRE = (process.env.ADMIN_PASS || "B2026cimnastik!")
      .toString()
      .trim();

    if (girilenAd === HEDEF_KULLANICI && girilenSifre === HEDEF_SIFRE) {
      const response = NextResponse.json({
        success: true,
        message: "Giriş Başarılı",
      });

      // Oturum çerezini tanımlıyoruz
      response.cookies.set("admin_session", "true", {
        path: "/",
        maxAge: 86400, // 24 Saat
        sameSite: "lax",
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: "Yönetici adı veya şifre hatalı!" },
      { status: 401 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Giriş işlemi esnasında sunucu hatası." },
      { status: 500 },
    );
  }
}
