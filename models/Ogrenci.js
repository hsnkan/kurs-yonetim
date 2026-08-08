import mongoose from "mongoose";

const OgrenciSchema = new mongoose.Schema(
  {
    adSoyad: { type: String, required: true },
    resimUrl: { type: String, default: "/default-avatar.png" },
    kanGrubu: { type: String, default: "Belirtilmedi" },
    lisansliMi: { type: Boolean, default: false },
    katilimGunleri: [{ type: String }],

    // 👨‍👩‍👧‍👦 ÇOKLU VELİ DİZİSİ (Required esnetildi)
    veliListesi: [
      {
        adSoyad: { type: String },
        yakinlikDerecesi: { type: String, default: "Anne" },
        telefon: { type: String },
      },
    ],

    grup: { type: String, required: true },
    grupTransferGecmisi: [
      {
        eskiGrup: String,
        yeniGrup: String,
        tarih: { type: Date, default: Date.now },
      },
    ],

    aylikUcret: { type: Number, default: 2000 },
    odemeGunu: { type: Number, default: 1 },
    nfcKartId: { type: String, sparse: true },
    durum: { type: String, enum: ["aktif", "pasif"], default: "aktif" },
    kayitTarihi: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export default mongoose.models.Ogrenci ||
  mongoose.model("Ogrenci", OgrenciSchema);
