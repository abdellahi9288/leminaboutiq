import mongoose, { Schema, Document } from "mongoose";

export interface IIncome extends Document {
  amount: number;
  description: string;
  category: string;
  date: Date;
  createdAt: Date;
}

const IncomeSchema = new Schema<IIncome>(
  {
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    category: { type: String, default: "بيع" },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Income ||
  mongoose.model<IIncome>("Income", IncomeSchema);
