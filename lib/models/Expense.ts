import mongoose, { Schema, Document } from "mongoose";

export interface IExpense extends Document {
  amount: number;
  description: string;
  category: string;
  date: Date;
  createdAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["إيجار", "نقل", "فاتورة", "شراء بضاعة", "أخرى"],
      default: "أخرى",
    },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Expense ||
  mongoose.model<IExpense>("Expense", ExpenseSchema);
