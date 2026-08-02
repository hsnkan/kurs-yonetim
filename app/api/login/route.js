import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { yoneticiAdi, sifre } = await request.json();

    // 🔒 BELİRLENEN GİRİŞ BİLGİLERİ (Küçük/büyük harf duyarlılığı için trim yapılır)
    const GECERLI_YONETICI = "admin";
    const GECERLI_SIFRE = "Balans2026!";

    if (
      yoneticiAdi &&
      yoneticiAdi.trim().toLowerCase() === GECERLI_YONETICI.toLowerCase() &&
      sifre &&
      sifre.trim() === GECERLI_SIFRE
    ) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: "Kullanıcı adı veya şifre hatalı!" },
        { status: 401 },
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Giriş işlemi sırasında hata oluştu." },
      { status: 500 },
    );
  }
}
