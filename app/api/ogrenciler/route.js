import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Ogrenci from "@/models/Ogrenci";

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const durum = searchParams.get("durum") || "AKTIF";
    const grup = searchParams.get("grup");

    const filtre = { durum };
    if (grup && grup !== "TUMU") {
      filtre.grup = grup;
    }

    const ogrenciler = await Ogrenci.find(filtre).sort({ adSoyad: 1 });
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
    return NextResponse.json({ success: true, data: yeniOgrenci });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}

export async function PUT(request) {
  try {
    await dbConnect();
    const { id, ...guncelVeri } = await request.json();
    const ogrenci = await Ogrenci.findByIdAndUpdate(id, guncelVeri, {
      new: true,
    });
    return NextResponse.json({ success: true, data: ogrenci });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}
