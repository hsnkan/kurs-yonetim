import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Ogrenci from "@/models/Ogrenci";
import Yoklama from "@/models/Yoklama";

export async function POST(request) {
  try {
    await dbConnect();
    const { nfcUid } = await request.json();

    if (!nfcUid) {
      return NextResponse.json(
        { success: false, error: "NFC UID bilgisi eksik." },
        { status: 400 },
      );
    }

    // 1. NFC UID'ye sahip aktif öğrenciyi bul
    const ogrenci = await Ogrenci.findOne({
      nfcUid: nfcUid.trim(),
      durum: "AKTIF",
    });

    if (!ogrenci) {
      return NextResponse.json(
        {
          success: false,
          error: "Bu NFC karta tanımlı aktif bir öğrenci bulunamadı!",
        },
        { status: 404 },
      );
    }

    // 2. Yoklama Kaydı Oluştur
    const yeniYoklama = await Yoklama.create({
      ogrenciId: ogrenci._id,
      tarih: new Date(),
    });

    return NextResponse.json({
      success: true,
      data: {
        yoklamaId: yeniYoklama._id,
        tarih: yeniYoklama.tarih,
        ogrenci: {
          adSoyad: ogrenci.adSoyad,
          veliAdSoyad: ogrenci.veliAdSoyad,
          veliTelefon: ogrenci.veliTelefon,
        },
      },
    });
  } catch (error) {
    console.error("Yoklama API Hatası:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Sunucu tarafında bir hata oluştu: " + error.message,
      },
      { status: 500 },
    );
  }
}
