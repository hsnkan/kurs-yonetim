import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Ogrenci from "@/models/Ogrenci";
import Yoklama from "@/models/Yoklama";

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { cardId } = body;

    if (!cardId) {
      return NextResponse.json(
        { success: false, error: "Kart ID'si gönderilmedi!" },
        { status: 400 },
      );
    }

    // Temizlenmiş Ham Kart ID (Boşluklar ve gizli karakterler kaldırılır)
    const temizCardId = String(cardId).trim();

    // 🔍 Esnek Arama: Büyük/Küçük harf duyarsız regex araması
    const ogrenci = await Ogrenci.findOne({
      $or: [
        { cardId: temizCardId },
        { nfcId: temizCardId },
        { cardId: { $regex: new RegExp(`^${temizCardId}$`, "i") } },
        { nfcId: { $regex: new RegExp(`^${temizCardId}$`, "i") } },
      ],
      $and: [
        {
          $or: [
            { durum: "aktif" },
            { durum: "AKTIF" },
            { durum: { $exists: false } },
          ],
        },
      ],
    });

    if (!ogrenci) {
      return NextResponse.json(
        {
          success: false,
          error: `Okunan Kart ID (${temizCardId}) sistemdeki aktif bir öğrenci ile eşleşmedi!`,
        },
        { status: 404 },
      );
    }

    // Bugün bu öğrenciye yoklama alınmış mı kontrol et
    const bugunBaslangic = new Date();
    bugunBaslangic.setHours(0, 0, 0, 0);

    const bugunBitis = new Date();
    bugunBitis.setHours(23, 59, 59, 999);

    const mevcutYoklama = await Yoklama.findOne({
      ogrenciId: ogrenci._id,
      tarih: { $gte: bugunBaslangic, $lte: bugunBitis },
    });

    if (mevcutYoklama) {
      return NextResponse.json({
        success: true,
        zatenVar: true,
        message: `${ogrenci.adSoyad} için bugün zaten yoklama kaydı mevcut.`,
        ogrenci: {
          _id: ogrenci._id,
          adSoyad: ogrenci.adSoyad,
          grup: ogrenci.grup || "Grup Yok",
        },
      });
    }

    // Yeni Yoklama Kaydı Oluştur
    const yeniYoklama = await Yoklama.create({
      ogrenciId: ogrenci._id,
      tarih: new Date(),
      durum: "geldi",
      yoklamaTipi: "nfc",
    });

    return NextResponse.json({
      success: true,
      ogrenci: {
        _id: ogrenci._id,
        adSoyad: ogrenci.adSoyad,
        grup: ogrenci.grup || "Grup Yok",
      },
      yoklama: yeniYoklama,
    });
  } catch (error) {
    console.error("🔴 NFC YOKLAMA API HATASI:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
