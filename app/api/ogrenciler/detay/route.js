import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Ogrenci from "@/models/Ogrenci";

// ==========================================
// 1. ÖĞRENCİ LİSTELEME SERVİSİ (GET)
// ==========================================
export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const durum = searchParams.get("durum") || "AKTIF";

    const ogrenciler = await Ogrenci.find({ durum }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: ogrenciler });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// ==========================================
// 2. TEKLİ VE EXCEL TOPLU ÖĞRENCİ EKLEME (POST)
// ==========================================
export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();

    // 📊 KONTROL: Eğer gelen veri bir DİZİ (Array) ise Excel Toplu Yüklemesidir
    if (Array.isArray(body.liste)) {
      const eklenenler = [];
      for (const item of body.liste) {
        if (item.adSoyad && item.adSoyad.trim()) {
          const yeni = await Ogrenci.create({
            adSoyad: item.adSoyad.trim(),
            veliAdSoyad: item.veliAdSoyad?.trim() || "",
            veliTelefon: item.veliTelefon?.trim() || "",
            grup: item.grup?.trim() || "Genel Kadro",
            aylikUcret: Number(item.aylikUcret || 0),
            odemeGunu: Number(item.odemeGunu || 1),
            durum: "AKTIF",
            kayitTarihi: new Date(),
          });
          eklenenler.push(yeni);
        }
      }
      return NextResponse.json({
        success: true,
        message: `${eklenenler.length} adet öğrenci Excel ile başarıyla eklendi!`,
      });
    }

    // 👤 TEKLİ ÖĞRENCİ EKLEME İŞLEMİ
    const yeniOgrenci = await Ogrenci.create({
      adSoyad: body.adSoyad,
      veliAdSoyad: body.veliAdSoyad || "",
      veliTelefon: body.veliTelefon || "",
      babaAdSoyad: body.babaAdSoyad || "",
      babaTelefon: body.babaTelefon || "",
      grup: body.grup || "Genel Kadro",
      aylikUcret: Number(body.aylikUcret || 0),
      odemeGunu: Number(body.odemeGunu || 1),
      durum: "AKTIF",
      kayitTarihi: new Date(),
    });

    return NextResponse.json({ success: true, data: yeniOgrenci });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// ==========================================
// 3. ÖĞRENCİ DURUMU DONDURMA / GÜNCELLEME (PUT)
// ==========================================
export async function PUT(request) {
  try {
    await dbConnect();
    const { id, durum } = await request.json();

    const guncelOgrenci = await Ogrenci.findByIdAndUpdate(
      id,
      { durum },
      { new: true },
    );

    return NextResponse.json({ success: true, data: guncelOgrenci });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// ==========================================
// 4. ÖĞRENCİ TAMAMEN SİLME İŞLEMİ (DELETE)
// ==========================================
export async function DELETE(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Öğrenci ID bulunamadı." },
        { status: 400 },
      );
    }

    await Ogrenci.findByIdAndDelete(id);
    return NextResponse.json({
      success: true,
      message: "Öğrenci başarıyla silindi.",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
