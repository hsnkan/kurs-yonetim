import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Ogrenci from "@/models/Ogrenci";

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const yil = Number(searchParams.get("yil")) || new Date().getFullYear();

    const aylar = [
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

    const tumOgrenciler = await Ogrenci.find({});

    const aylikRapor = aylar.map((ayAd, index) => {
      const ayBaslangic = new Date(yil, index, 1);
      const ayBitis = new Date(yil, index + 1, 0, 23, 59, 59);

      // O ay yeni kayıt olanlar
      const yeniKayitlar = tumOgrenciler.filter((o) => {
        const d = new Date(o.createdAt);
        return d >= ayBaslangic && d <= ayBitis;
      });

      // O ay ayrılanlar / pasife alınanlar
      const ayrilanlar = tumOgrenciler.filter((o) => {
        const d = new Date(o.updatedAt);
        return o.durum === "PASIF" && d >= ayBaslangic && d <= ayBitis;
      });

      // O ay aktif olan öğrencilerin toplam kazancı
      const aktifler = tumOgrenciler.filter((o) => o.durum === "AKTIF");
      const toplamKazanc = aktifler.reduce(
        (acc, curr) => acc + (curr.aylikUcret || 0),
        0,
      );

      return {
        ay: ayAd,
        yeniKayit: yeniKayitlar.length,
        ayrilan: ayrilanlar.length,
        toplamKazanc: toplamKazanc,
      };
    });

    return NextResponse.json({ success: true, yil, data: aylikRapor });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
