import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();

    const girilenAd = (body.yoneticiAdi || "").toString().trim().toLowerCase();
    const girilenSifre = (body.sifre || "").toString().trim();

    // 🔒 SABİT BİLGİLER
    const HEDEF_KULLANICI = "balans";
    const HEDEF_SIFRE = "B2026cimnastik!";

    if (girilenAd === HEDEF_KULLANICI && girilenSifre === HEDEF_SIFRE) {
      const response = NextResponse.json({
        success: true,
        message: "Giriş Başarılı",
      });

      // Çerezi sadeleştirip her ortamda geçerli kılalım
      response.cookies.set("admin_session", "true", {
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 gün
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
      { success: false, error: "Sunucu hatası" },
      { status: 500 },
    );
  }
}
