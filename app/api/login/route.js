import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const yoneticiAdi = (body.yoneticiAdi || "")
      .toString()
      .trim()
      .toLowerCase();
    const sifre = (body.sifre || "").toString().trim();

    // 🔒 GEÇERLİ GİRİŞ BİLGİLERİ (Büyük/Küçük Harf Esnekliği Eklendi)
    const HEDEF_KULLANICI = "admin";
    const HEDEF_SIFRE = "Balans2026!";

    if (yoneticiAdi === HEDEF_KULLANICI && sifre === HEDEF_SIFRE) {
      const response = NextResponse.json({
        success: true,
        message: "Giriş Başarılı",
      });

      // Tarayıcı kısıtlamalarına takılmaması için çerez tanımı
      response.cookies.set("admin_session", "true", {
        path: "/",
        maxAge: 86400,
        sameSite: "lax",
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: "Kullanıcı adı veya şifre hatalı!" },
      { status: 401 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Giriş işlemi esnasında hata oluştu." },
      { status: 500 },
    );
  }
}
