import mongoose from "mongoose";

const OgrenciSchema = new mongoose.Schema(
  {
    adSoyad: { type: String, required: true },
    grup: { type: String, default: "Genel Grup" }, // 👈 Grup Alanı Eklendi
    veliAdSoyad: { type: String, required: true },
    veliTelefon: { type: String, required: true },
    veliYakinlik: { type: String, default: "Anne" },
    ikinciVeliAdSoyad: { type: String, default: "" },
    ikinciVeliTelefon: { type: String, default: "" },
    ikinciVeliYakinlik: { type: String, default: "Baba" },
    nfcUid: { type: String, default: "" },
    aylikUcret: { type: Number, default: 5000 },
    odemeGunu: { type: Number, default: 1 },
    durum: { type: String, enum: ["AKTIF", "PASIF"], default: "AKTIF" },
  },
  { timestamps: true },
);

export default mongoose.models.Ogrenci ||
  mongoose.model("Ogrenci", OgrenciSchema);
