import mongoose from "mongoose";

const YoklamaSchema = new mongoose.Schema(
  {
    ogrenciId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ogrenci",
      required: true,
    },
    tarih: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export default mongoose.models.Yoklama ||
  mongoose.model("Yoklama", YoklamaSchema);
