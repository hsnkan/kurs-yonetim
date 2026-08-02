import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Ogrenci from "@/models/Ogrenci";
import Yoklama from "@/models/Yoklama";

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    const ogrenci = await Ogrenci.findById(id);
    if (!ogrenci) {
      return NextResponse.json(
        { success: false, error: "Öğrenci bulunamadı" },
        { status: 404 },
      );
    }

    // Öğrencinin tüm yoklama (geliş) geçmişini getir
    const yoklamalar = await Yoklama.find({ ogrenciId: id }).sort({
      tarih: -1,
    });

    return NextResponse.json({
      success: true,
      data: {
        ogrenci,
        yoklamalar,
        toplamGelis: yoklamalar.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
