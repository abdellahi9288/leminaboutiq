import mongoose, { Schema, Document } from "mongoose";

export interface IInventory extends Document {
  name: string;
  quantity: number;
  unitPrice: number;
  category: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InventorySchema = new Schema<IInventory>(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true, default: 0 },
    unitPrice: { type: Number, required: true },
    category: { type: String, default: "عام" },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Inventory ||
  mongoose.model<IInventory>("Inventory", InventorySchema);
