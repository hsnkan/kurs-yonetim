import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import AylikMuhasebe from "@/models/AylikMuhasebe";

export async function POST(request) {
  try {
    await dbConnect();
    const { yil, veriler } = await request.json(); // veriler: [{ aySira, kazanc, katilanOgrenci, ayrilanOgrenci, donduranOgrenci }]

    if (!Array.isArray(veriler) || veriler.length === 0) {
      return NextResponse.json(
        { success: false, error: "Yüklenecek veri bulunamadı." },
        { status: 400 },
      );
    }

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

    for (const item of veriler) {
      const aySira = Number(item.aySira);
      if (aySira >= 1 && aySira <= 12) {
        await AylikMuhasebe.findOneAndUpdate(
          { yil, aySira },
          {
            yil,
            ay: AYLAR[aySira - 1],
            aySira,
            kazanc: Number(item.kazanc || 0),
            katilanOgrenci: Number(item.katilanOgrenci || 0),
            ayrilanOgrenci: Number(item.ayrilanOgrenci || 0),
            donduranOgrenci: Number(item.donduranOgrenci || 0),
            notlar: item.notlar || "Excel ile yüklendi",
          },
          { upsert: true, new: true },
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Excel verileri başarıyla işlendi!",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
