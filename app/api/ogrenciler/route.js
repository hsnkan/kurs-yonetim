import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Ogrenci from "@/models/Ogrenci";

// GET: Tüm öğrencileri (veya duruma göre süzerek) getirir
export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const durum = searchParams.get("durum") || "AKTIF";

    const ogrenciler = await Ogrenci.find({ durum }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: ogrenciler });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Öğrenciler getirilemedi: " + error.message },
      { status: 500 },
    );
  }
}

// POST: Yeni Öğrenci Ekle
export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();

    const yeniOgrenci = await Ogrenci.create(body);
    return NextResponse.json(
      { success: true, data: yeniOgrenci },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Öğrenci eklenemedi: " + error.message },
      { status: 400 },
    );
  }
}

// PUT: Öğrenci Durumunu Güncelle (Arşivle / Aktif Et)
export async function PUT(req) {
  try {
    await dbConnect();
    const { id, durum } = await req.json();

    const guncelOgrenci = await Ogrenci.findByIdAndUpdate(
      id,
      { durum },
      { new: true },
    );

    if (!guncelOgrenci) {
      return NextResponse.json(
        { success: false, error: "Öğrenci bulunamadı." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: `Öğrenci durumu '${durum}' olarak güncellendi.`,
      data: guncelOgrenci,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Güncelleme başarısız: " + error.message },
      { status: 500 },
    );
  }
}
