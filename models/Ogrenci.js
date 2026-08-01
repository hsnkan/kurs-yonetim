import mongoose from "mongoose";

const OgrenciSchema = new mongoose.Schema(
  {
    adSoyad: {
      type: String,
      required: [true, "Öğrenci adı soyadı zorunludur."],
    },
    // 1. VELİ (Ana Veli / Anne vb.)
    veliAdSoyad: {
      type: String,
      required: [true, "1. Veli adı soyadı zorunludur."],
    },
    veliTelefon: {
      type: String,
      required: [true, "1. Veli telefonu zorunludur."],
    },
    veliYakinlik: {
      type: String,
      default: "Anne",
    },

    // 2. VELİ (İkinci Veli / Baba vb. - Opsiyonel)
    ikinciVeliAdSoyad: {
      type: String,
      default: "",
    },
    ikinciVeliTelefon: {
      type: String,
      default: "",
    },
    ikinciVeliYakinlik: {
      type: String,
      default: "Baba",
    },

    nfcUid: {
      type: String,
      default: null,
      unique: true,
      sparse: true,
    },
    aylikUcret: {
      type: Number,
      required: true,
      default: 5000,
    },
    odemeGunu: {
      type: Number,
      default: 1,
    },
    durum: {
      type: String,
      enum: ["AKTIF", "PASIF"],
      default: "AKTIF",
    },
  },
  { timestamps: true },
);

export default mongoose.models.Ogrenci ||
  mongoose.model("Ogrenci", OgrenciSchema);
