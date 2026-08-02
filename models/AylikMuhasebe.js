import mongoose from "mongoose";

const AylikMuhasebeSchema = new mongoose.Schema(
  {
    yil: { type: Number, required: true },
    ay: { type: String, required: true }, // Örn: 'Ocak', 'Şubat'
    aySira: { type: Number, required: true }, // 1 - 12
    kazanc: { type: Number, default: 0 },
    katilanOgrenci: { type: Number, default: 0 },
    ayrilanOgrenci: { type: Number, default: 0 },
    donduranOgrenci: { type: Number, default: 0 },
    notlar: { type: String, default: "" },
  },
  { timestamps: true },
);

AylikMuhasebeSchema.index({ yil: 1, aySira: 1 }, { unique: true });

export default mongoose.models.AylikMuhasebe ||
  mongoose.model("AylikMuhasebe", AylikMuhasebeSchema);
