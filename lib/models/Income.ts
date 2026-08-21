import mongoose, { Schema, Document, Types } from "mongoose";

export interface IIncome extends Document {
  amount: number;
  description: string;
  category: string;
  date: Date;
  inventoryItemId?: Types.ObjectId;
  quantitySold?: number;
  createdAt: Date;
}

const IncomeSchema = new Schema<IIncome>(
  {
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    category: { type: String, default: "بيع" },
    date: { type: Date, default: Date.now },
    inventoryItemId: { type: Schema.Types.ObjectId, ref: "Inventory" },
    quantitySold: { type: Number },
  },
  { timestamps: true }
);

export default mongoose.models.Income ||
  mongoose.model<IIncome>("Income", IncomeSchema);
