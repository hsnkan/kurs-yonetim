import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Ogrenci from "@/models/Ogrenci";
import Odeme from "@/models/Odeme";

export async function GET() {
  try {
    await dbConnect();

    const bugun = new Date();
    const buAy = bugun.getMonth() + 1;
    const buYil = bugun.getFullYear();

    // Tüm aktif öğrencileri çek (Soru işareti ile güvenli kontrol)
    const tumOgrenciler = (await Ogrenci.find({ durum: "AKTIF" })) || [];

    // Bu ay ödemesi yapılan kayıtları çek
    let buAykiOdemeler = [];
    try {
      buAykiOdemeler =
        (await Odeme.find({ donemAy: buAy, donemYil: buYil })) || [];
    } catch (e) {
      console.warn(
        "Odeme koleksiyonu henüz boş olabilir veya veri bulunamadı.",
      );
    }

    const odemeYapanOgrenciIdleri = buAykiOdemeler.map((o) =>
      o.ogrenciId?.toString(),
    );

    // Bu ay henüz ödeme yapmamış olanlar
    const odemesiBekleyenler = tumOgrenciler.filter(
      (o) => !odemeYapanOgrenciIdleri.includes(o._id.toString()),
    );

    // Toplam Bu Ay Tahsil Edilen Gelir
    const buAyToplamGelir = buAykiOdemeler.reduce(
      (acc, curr) => acc + (curr.tutar || 0),
      0,
    );

    return NextResponse.json({
      success: true,
      data: {
        odemesiBekleyenler,
        buAyToplamGelir,
        toplamAktifOgrenci: tumOgrenciler.length,
      },
    });
  } catch (error) {
    console.error("Muhasebe API Hatarı:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Muhasebe verileri alınamadı: " + error.message,
      },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const { ogrenciId, tutar, islemTipi } = await req.json();

    const ogrenci = await Ogrenci.findById(ogrenciId);
    if (!ogrenci) {
      return NextResponse.json(
        { success: false, error: "Öğrenci bulunamadı." },
        { status: 404 },
      );
    }

    const bugun = new Date();

    if (islemTipi === "ODEME_AL") {
      const yeniOdeme = await Odeme.create({
        ogrenciId: ogrenci._id,
        tutar: tutar || ogrenci.aylikUcret,
        donemAy: bugun.getMonth() + 1,
        donemYil: bugun.getFullYear(),
        whatsappBildirim: {
          gonderildiMi: true,
          gonderimTarihi: new Date(),
          durumMesaji: "Ödeme Alındı",
        },
      });

      return NextResponse.json({
        success: true,
        message: `${ogrenci.adSoyad} için ${tutar || ogrenci.aylikUcret} ₺ ödeme alındı!`,
        data: yeniOdeme,
      });
    }

    return NextResponse.json(
      { success: false, error: "Geçersiz işlem tipi." },
      { status: 400 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "İşlem başarısız: " + error.message },
      { status: 500 },
    );
  }
}
