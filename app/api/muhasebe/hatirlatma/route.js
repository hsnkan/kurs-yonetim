import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Odeme from "@/models/Odeme";

export async function POST(request) {
  try {
    await dbConnect();
    const { odemeId } = await request.json();

    // Ödeme kaydına hatirlatmaGonderildi: true ve gönderim tarihini ekle
    const guncelOdeme = await Odeme.findByIdAndUpdate(
      odemeId,
      {
        hatirlatmaGonderildi: true,
        hatirlatmaTarihi: new Date(),
      },
      { new: true },
    );

    // Burada entegre edilecek SMS/WhatsApp servisine istek atılabilir.

    return NextResponse.json({
      success: true,
      message: "Hatırlatma mesajı gönderildi olarak işaretlendi.",
      data: guncelOdeme,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}
