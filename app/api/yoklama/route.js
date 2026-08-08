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
        { success: false, error: "NFC Kart ID Okunamadı" },
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
        { success: false, error: "Kart Tanımlı Değil Veya Öğrenci Pasif!" },
        { status: 404 },
      );
    }

    // 2. MÜKERRER KAYIT KONTROLÜ: Bugün bu öğrenci zaten giriş yapmış mı?
    const bugunBaslangic = new Date();
    bugunBaslangic.setHours(0, 0, 0, 0);

    const bugunBitis = new Date();
    bugunBitis.setHours(23, 59, 59, 999);

    const mevcutGiris = await Yoklama.findOne({
      ogrenciId: ogrenci._id,
      tarih: { $gte: bugunBaslangic, $lte: bugunBitis },
    });

    if (mevcutGiris) {
      return NextResponse.json(
        {
          success: false,
          error: `⚠️ ${ogrenci.adSoyad} bugün zaten derse giriş yaptı!`,
        },
        { status: 400 },
      );
    }

    // 3. Bugün için ilk giriş kaydını oluştur
    const yeniGiris = await Yoklama.create({
      ogrenciId: ogrenci._id,
      ogrenciAdi: ogrenci.adSoyad,
      grup: ogrenci.grup,
      tarih: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: `${ogrenci.adSoyad} Derse Giriş Yaptı!`,
      ogrenci: ogrenci.adSoyad,
      data: {
        _id: yeniGiris._id,
        ogrenciId: {
          _id: ogrenci._id,
          adSoyad: ogrenci.adSoyad,
          grup: ogrenci.grup,
        },
        ogrenciAdi: ogrenci.adSoyad,
        grup: ogrenci.grup,
        saat: new Date().toLocaleTimeString("tr-TR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        tarih: new Date(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// Bugün veya Belirtilen Tarihte Derse Giriş Yapanları Getir
export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const tarihParam = searchParams.get("tarih");

    let baslangic = new Date();
    let bitis = new Date();

    if (tarihParam) {
      baslangic = new Date(tarihParam);
      bitis = new Date(tarihParam);
    }

    baslangic.setHours(0, 0, 0, 0);
    bitis.setHours(23, 59, 59, 999);

    const bugunkuGirisler = await Yoklama.find({
      tarih: { $gte: baslangic, $lte: bitis },
    })
      .populate("ogrenciId", "adSoyad grup")
      .sort({ tarih: -1 });

    return NextResponse.json({ success: true, data: bugunkuGirisler });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
