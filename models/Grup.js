import mongoose from "mongoose";

const GrupSchema = new mongoose.Schema(
  {
    ad: { type: String, required: true, unique: true, trim: true },
    aciklama: { type: String, default: "" },
  },
  { timestamps: true },
);

export default mongoose.models.Grup || mongoose.model("Grup", GrupSchema);
