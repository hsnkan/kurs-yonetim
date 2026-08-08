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

    // Kart ID'yi temizle (boşlukları sil)
    const hamCardId = String(cardId).trim();
    // Başındaki sıfırları silinmiş temiz versiyonu
    const temizzCardId = hamCardId.replace(/^0+/, "");

    // 🔍 GELİŞMİŞ VE ESNEK ÖĞRENCİ ARAMASI
    const ogrenci = await Ogrenci.findOne({
      $or: [
        { cardId: hamCardId },
        { nfcId: hamCardId },
        { cardId: temizzCardId },
        { nfcId: temizzCardId },
        { cardId: { $regex: new RegExp(`^${hamCardId}$`, "i") } },
        { nfcId: { $regex: new RegExp(`^${hamCardId}$`, "i") } },
      ],
    });

    if (!ogrenci) {
      return NextResponse.json(
        {
          success: false,
          error: `Okunan Kart ID (${hamCardId}) sistemde hiçbir öğrenci ile eşleşmedi. Lütfen Öğrenci Düzenle ekranından bu kart ID'sini öğrenciye tanımlayınız.`,
        },
        { status: 404 },
      );
    }

    // 🗓️ BUGÜN İÇİN MÜKERRER YOKLAMA KONTROLÜ
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
        message: `⚠️ ${ogrenci.adSoyad} için bugün zaten yoklama kaydı alınmış!`,
        ogrenci: {
          _id: ogrenci._id,
          adSoyad: ogrenci.adSoyad,
          grup: ogrenci.grup || "Grup Yok",
        },
      });
    }

    // 📝 YENİ YOKLAMA KAYDI OLUŞTURMA
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
