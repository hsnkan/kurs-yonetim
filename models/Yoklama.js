import mongoose from "mongoose";

const YoklamaSchema = new mongoose.Schema({
  tarih: {
    type: String,
    required: true,
    unique: true,
  },
  katilanlar: [
    {
      ogrenciId: { type: mongoose.Schema.Types.ObjectId, ref: "Ogrenci" },
      saat: { type: String },
    },
  ],
});

// Next.js hot-reload süreçlerinde modelin tekrar tanımlanmasını önleyen güvenli dışa aktarım
const Yoklama =
  mongoose.models.Yoklama || mongoose.model("Yoklama", YoklamaSchema);

export default Yoklama;
