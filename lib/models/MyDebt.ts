import mongoose, { Schema, Document } from "mongoose";

export interface IMyPayment {
  amount: number;
  date: Date;
}

export interface IMyDebt extends Document {
  creditorName: string;
  creditorPhone: string;
  debtName: string;
  totalAmount: number;
  remainingAmount: number;
  payments: IMyPayment[];
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MyPaymentSchema = new Schema<IMyPayment>(
  {
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
  },
  { _id: true }
);

const MyDebtSchema = new Schema<IMyDebt>(
  {
    creditorName: { type: String, required: true },
    creditorPhone: { type: String, default: "" },
    debtName: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    remainingAmount: { type: Number, required: true },
    payments: [MyPaymentSchema],
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.MyDebt ||
  mongoose.model<IMyDebt>("MyDebt", MyDebtSchema);
