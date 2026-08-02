import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Ogrenci from "@/models/Ogrenci";

export async function GET() {
  try {
    await dbConnect();
    const bugün = new Date();
    const bugününGünü = bugün.getDate();

    // Sadece aktif öğrencileri alıyoruz
    const tumOgrenciler = await Ogrenci.find({ durum: "AKTIF" }).sort({
      odemeGunu: 1,
    });

    // Ödeme günü bugün veya geçmiş olanlar (Veya bu aya ait ödemesi yaklaşanlar)
    const odemesiGelenler = tumOgrenciler.map((o) => {
      const odemeGunu = o.odemeGunu || 1;
      const durumGecikme = bugününGünü >= odemeGunu;
      const kalanGun = odemeGunu - bugününGünü;

      return {
        ...o.toObject(),
        odemesiGeldimi: durumGecikme,
        kalanGun: kalanGun,
      };
    });

    return NextResponse.json({
      success: true,
      data: odemesiGelenler,
      bugününGünü,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
