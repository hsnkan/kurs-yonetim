import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Ogrenci from "@/models/Ogrenci";
import Yoklama from "@/models/Yoklama";

// SILME İŞLEMLERİ
export async function DELETE(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const islem = searchParams.get("islem"); // 'bugun_yoklama', 'tum_yoklama', 'tum_ogrenciler'

    if (islem === "bugun_yoklama") {
      const bugunBaslangic = new Date();
      bugunBaslangic.setHours(0, 0, 0, 0);

      const bugunBitis = new Date();
      bugunBitis.setHours(23, 59, 59, 999);

      const sonuc = await Yoklama.deleteMany({
        tarih: { $gte: bugunBaslangic, $lte: bugunBitis },
      });

      return NextResponse.json({
        success: true,
        message: `Bugüne ait ${sonuc.deletedCount} yoklama kaydı temizlendi.`,
      });
    }

    if (islem === "tum_yoklama") {
      const sonuc = await Yoklama.deleteMany({});
      return NextResponse.json({
        success: true,
        message: `Sistemdeki toplam ${sonuc.deletedCount} yoklama kaydı tamamen temizlendi.`,
      });
    }

    if (islem === "tum_ogrenciler") {
      const sonuc = await Ogrenci.deleteMany({});
      return NextResponse.json({
        success: true,
        message: `Sistemdeki toplam ${sonuc.deletedCount} öğrenci kaydı tamamen silindi.`,
      });
    }

    return NextResponse.json(
      { success: false, error: "Geçersiz işlem parametresi!" },
      { status: 400 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// TOPLU ÖĞRENCİ YÜKLEME
export async function POST(request) {
  try {
    await dbConnect();
    const { yuklenecekler } = await request.json();

    if (
      !yuklenecekler ||
      !Array.isArray(yuklenecekler) ||
      yuklenecekler.length === 0
    ) {
      return NextResponse.json(
        { success: false, error: "Yüklenecek veri bulunamadı!" },
        { status: 400 },
      );
    }

    let eklendi = 0;
    for (const ogrenci of yuklenecekler) {
      if (ogrenci.adSoyad) {
        await Ogrenci.create(ogrenci);
        eklendi++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Toplam ${eklendi} öğrenci başarıyla veritabanına aktarıldı.`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
