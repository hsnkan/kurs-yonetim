import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import AylikMuhasebe from "@/models/AylikMuhasebe";

const AYLAR = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const yil = Number(searchParams.get("yil")) || new Date().getFullYear();

    let kayitlar = await AylikMuhasebe.find({ yil }).sort({ aySira: 1 });

    // Eğer o yıla ait aylar henüz veritabanında yoksa boş taslaklar oluşturalım
    if (kayitlar.length === 0) {
      const taslaklar = AYLAR.map((ayAd, index) => ({
        yil,
        ay: ayAd,
        aySira: index + 1,
        kazanc: 0,
        katilanOgrenci: 0,
        ayrilanOgrenci: 0,
        donduranOgrenci: 0,
      }));
      await AylikMuhasebe.insertMany(taslaklar);
      kayitlar = await AylikMuhasebe.find({ yil }).sort({ aySira: 1 });
    }

    return NextResponse.json({ success: true, yil, data: kayitlar });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const {
      yil,
      aySira,
      kazanc,
      katilanOgrenci,
      ayrilanOgrenci,
      donduranOgrenci,
      notlar,
    } = body;

    const guncelKayit = await AylikMuhasebe.findOneAndUpdate(
      { yil, aySira },
      { kazanc, katilanOgrenci, ayrilanOgrenci, donduranOgrenci, notlar },
      { new: true, upsert: true },
    );

    return NextResponse.json({ success: true, data: guncelKayit });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}
