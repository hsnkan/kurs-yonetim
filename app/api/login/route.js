import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();

    // Kullanıcının formdan girdiği veriler (Boşluklar temizlenir)
    const girilenAd = (body.yoneticiAdi || "").toString().trim().toLowerCase();
    const girilenSifre = (body.sifre || "").toString().trim();

    // 🔒 SABİT YÖNETİCİ GİRİŞ BİLGİLERİ (Vercel ENV'ye gerek yok)
    const HEDEF_KULLANICI = "balans";
    const HEDEF_SIFRE = "B2026cimnastik!";

    if (girilenAd === HEDEF_KULLANICI && girilenSifre === HEDEF_SIFRE) {
      const response = NextResponse.json({
        success: true,
        message: "Giriş Başarılı",
      });

      // Oturum çerezini tanımlıyoruz (1 Günlük)
      response.cookies.set("admin_session", "true", {
        path: "/",
        maxAge: 86400,
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
