import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Ogrenci from "@/models/Ogrenci";

// 🗑️ ÖĞRENCİ SİLME (DELETE)
export async function DELETE(request, context) {
  try {
    await dbConnect();
    const { params } = context;
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const silinen = await Ogrenci.findByIdAndDelete(id);

    if (!silinen) {
      return NextResponse.json(
        { success: false, error: "Öğrenci bulunamadı" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, message: "Öğrenci silindi" });
  } catch (error) {
    console.error("Silme Hatası:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// ✏️ ÖĞRENCİ VE VELİ BİLGİLERİNİ GÜNCELLEME (PUT)
export async function PUT(request, context) {
  try {
    await dbConnect();
    const { params } = context;
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const body = await request.json();

    const guncellenen = await Ogrenci.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true },
    );

    if (!guncellenen) {
      return NextResponse.json(
        { success: false, error: "Öğrenci bulunamadı" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: guncellenen });
  } catch (error) {
    console.error("Güncelleme Hatası:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// ⏸️ ÖĞRENCİ DONDURMA (PASİFE ALMA - PATCH)
export async function PATCH(request, context) {
  try {
    await dbConnect();
    const { params } = context;
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const body = await request.json();

    const guncellenen = await Ogrenci.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true },
    );

    return NextResponse.json({ success: true, data: guncellenen });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
