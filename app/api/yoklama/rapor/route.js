import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Yoklama from "@/models/Yoklama";
import Ogrenci from "@/models/Ogrenci";

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const tarihStr = searchParams.get("tarih");

    const baslangic = new Date(tarihStr);
    baslangic.setHours(0, 0, 0, 0);

    const bitis = new Date(tarihStr);
    bitis.setHours(23, 59, 59, 999);

    const yoklamalar = await Yoklama.find({
      tarih: { $gte: baslangic, $lte: bitis },
    })
      .populate("ogrenciId", "adSoyad veliAdSoyad veliTelefon")
      .sort({ tarih: 1 });

    return NextResponse.json({ success: true, data: yoklamalar });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
