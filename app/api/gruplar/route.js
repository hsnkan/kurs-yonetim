import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import mongoose from "mongoose";

// Mongoose Grup Şemasını ve Modelini Dinamik Tanımlıyoruz
const GrupSchema = new mongoose.Schema(
  {
    ad: { type: String, required: true },
    aciklama: { type: String, default: "" },
    antrenor: { type: String, default: "" },
  },
  { timestamps: true },
);

const Grup = mongoose.models.Grup || mongoose.model("Grup", GrupSchema);

// ==========================================
// GRUPLARI GETİR (GET)
// ==========================================
export async function GET() {
  try {
    await dbConnect();
    const gruplar = await Grup.find({}).sort({ ad: 1 });
    return NextResponse.json({ success: true, data: gruplar });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// ==========================================
// YENİ GRUP EKLE (POST)
// ==========================================
export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();

    if (!body.ad) {
      return NextResponse.json(
        { success: false, error: "Grup adı zorunludur!" },
        { status: 400 },
      );
    }

    const yeniGrup = await Grup.create(body);
    return NextResponse.json({ success: true, data: yeniGrup });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
