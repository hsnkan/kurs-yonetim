import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { yoneticiAdi, sifre } = await request.json();

    // 🔒 GİRİŞ BİLGİLERİ (Büyük/küçük harf veya boşluk hatalarına karşı korumalı)
    const HEDEF_KULLANICI = "admin";
    const HEDEF_SIFRE = "Balans2026!";

    const girilenAd = (yoneticiAdi || "").trim().toLowerCase();
    const girilenSifre = (sifre || "").trim();

    if (girilenAd === HEDEF_KULLANICI && girilenSifre === HEDEF_SIFRE) {
      const response = NextResponse.json({
        success: true,
        message: "Giriş Başarılı",
      });

      // Oturum çerezini doğrudan güncelliyoruz
      response.cookies.set("admin_session", "true", {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24, // 1 Günlük Oturum
      });

      return response;
    } else {
      return NextResponse.json(
        { success: false, error: "Yönetici adı veya şifre hatalı!" },
        { status: 401 },
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Giriş sunucu hatası." },
      { status: 500 },
    );
  }
}
