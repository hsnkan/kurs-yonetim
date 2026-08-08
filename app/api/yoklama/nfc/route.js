import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Ogrenci from "@/models/Ogrenci";
import Yoklama from "@/models/Yoklama";

export async function POST(request) {
  try {
    await dbConnect();
    const { nfcKartId } = await request.json();

    if (!nfcKartId) {
      return NextResponse.json(
        { success: false, error: "NFC Kart ID okunamadı!" },
        { status: 400 },
      );
    }

    // 1. Kart ID'sine ait aktif öğrenciyi bul
    const ogrenci = await Ogrenci.findOne({
      nfcKartId: nfcKartId.trim(),
      durum: "aktif",
    });

    if (!ogrenci) {
      return NextResponse.json(
        {
          success: false,
          error: "Bu NFC kartına tanımlı aktif öğrenci bulunamadı!",
        },
        { status: 404 },
      );
    }

    // 2. MÜKERRER KAYIT KONTROLÜ (Bugün zaten giriş yapıldı mı?)
    const bugunBaslangic = new Date();
    bugunBaslangic.setHours(0, 0, 0, 0);

    const bugunBitis = new Date();
    bugunBitis.setHours(23, 59, 59, 999);

    const mevcutGiris = await Yoklama.findOne({
      ogrenciId: ogrenci._id,
      tarih: { $gte: bugunBaslangic, $lte: bugunBitis },
    });

    // Eğer bugün zaten kaydı varsa hata döndür ve 2. kaydı ENGELLE
    if (mevcutGiris) {
      return NextResponse.json(
        {
          success: false,
          error: `${ogrenci.adSoyad} bugün zaten derse giriş yaptı!`,
        },
        { status: 400 },
      );
    }

    // 3. Bugün ilk defa okutuluyorsa kaydı oluştur
    const yeniYoklama = await Yoklama.create({
      ogrenciId: ogrenci._id,
      ogrenciAdi: ogrenci.adSoyad,
      grup: ogrenci.grup,
      durum: "geldi",
      yöntem: "nfc",
      tarih: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: `${ogrenci.adSoyad} için yoklama alındı.`,
      ogrenci: ogrenci.adSoyad,
      data: yeniYoklama,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}
