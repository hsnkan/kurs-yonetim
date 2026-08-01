import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Ogrenci from "@/models/Ogrenci";
import Yoklama from "@/models/Yoklama";

export async function DELETE(request) {
  try {
    await dbConnect();
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID eksik" },
        { status: 400 },
      );
    }

    // Öğrenciyi ve bağlı tüm yoklama geçmişini sil
    await Ogrenci.findByIdAndDelete(id);
    await Yoklama.deleteMany({ ogrenciId: id });

    return NextResponse.json({
      success: true,
      message: "Öğrenci tamamen silindi.",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
