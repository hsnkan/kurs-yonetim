import mongoose from "mongoose";

const OdemeSchema = new mongoose.Schema(
  {
    ogrenciId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ogrenci",
      required: true,
    },
    tutar: { type: Number, required: true },
    odemeTarihi: { type: Date, default: Date.now },
    sonOdemeTarihi: { type: Date, required: true },
    durum: {
      type: String,
      enum: ["odendi", "bekliyor", "gecikti"],
      default: "bekliyor",
    },
    hatirlatmaGonderildi: { type: Boolean, default: false },
    hatirlatmaTarihi: { type: Date, default: null },
  },
  { timestamps: true },
);

export default mongoose.models.Odeme || mongoose.model("Odeme", OdemeSchema);
