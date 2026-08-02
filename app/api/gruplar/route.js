import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Grup from "@/models/Grup";

export async function GET() {
  try {
    await dbConnect();
    // Eğer veritabanında henüz hiç grup yoksa varsayılan başlangıç gruplarını otomatik ekleyelim
    let gruplar = await Grup.find({}).sort({ ad: 1 });
    if (gruplar.length === 0) {
      const varsayilanlar = [
        { ad: "Başlangıç Grubu" },
        { ad: "Orta Seviye Grubu" },
        { ad: "İleri Seviye Grubu" },
        { ad: "Yarışma Grubu" },
      ];
      await Grup.insertMany(varsayilanlar);
      gruplar = await Grup.find({}).sort({ ad: 1 });
    }
    return NextResponse.json({ success: true, data: gruplar });
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
    const { ad } = await request.json();
    if (!ad || !ad.trim()) {
      return NextResponse.json(
        { success: false, error: "Grup adı boş olamaz" },
        { status: 400 },
      );
    }
    const yeniGrup = await Grup.create({ ad: ad.trim() });
    return NextResponse.json({ success: true, data: yeniGrup });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}

export async function DELETE(request) {
  try {
    await dbConnect();
    const { id } = await request.json();
    await Grup.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}
