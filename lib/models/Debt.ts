import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPayment {
  amount: number;
  date: Date;
}

export interface IDebt extends Document {
  customerName: string;
  customerPhone: string;
  description: string;
  totalAmount: number;
  remainingAmount: number;
  inventoryItemId?: Types.ObjectId;
  quantitySold?: number;
  payments: IPayment[];
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
  },
  { _id: true }
);

const DebtSchema = new Schema<IDebt>(
  {
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    description: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    remainingAmount: { type: Number, required: true },
    inventoryItemId: { type: Schema.Types.ObjectId, ref: "Inventory" },
    quantitySold: { type: Number },
    payments: [PaymentSchema],
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Debt ||
  mongoose.model<IDebt>("Debt", DebtSchema);
