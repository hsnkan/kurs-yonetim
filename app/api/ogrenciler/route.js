import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Ogrenci from "@/models/Ogrenci";

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const durum = searchParams.get("durum") || "aktif";

    const ogrenciler = await Ogrenci.find({ durum }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: ogrenciler });
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
    const body = await request.json();

    const yeniOgrenci = await Ogrenci.create(body);
    return NextResponse.json(
      { success: true, data: yeniOgrenci },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}
