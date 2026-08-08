import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Ogrenci from "@/models/Ogrenci";

export async function PATCH(request, context) {
  try {
    await dbConnect();
    const { params } = context;
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const body = await request.json();
    const { yeniGrup } = body;

    if (!yeniGrup) {
      return NextResponse.json(
        { success: false, error: "Yeni grup belirtilmedi." },
        { status: 400 },
      );
    }

    const ogrenci = await Ogrenci.findById(id);
    if (!ogrenci) {
      return NextResponse.json(
        { success: false, error: "Öğrenci bulunamadı." },
        { status: 404 },
      );
    }

    // Transfer geçmişine kayıt ekle
    if (!ogrenci.grupTransferGecmisi) ogrenci.grupTransferGecmisi = [];
    ogrenci.grupTransferGecmisi.push({
      eskiGrup: ogrenci.grup,
      yeniGrup: yeniGrup,
      tarih: new Date(),
    });

    ogrenci.grup = yeniGrup;
    await ogrenci.save();

    return NextResponse.json({ success: true, data: ogrenci });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
