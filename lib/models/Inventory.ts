import mongoose, { Schema, Document } from "mongoose";

export interface IInventory extends Document {
  name: string;
  quantity: number;
  unitPrice: number;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

const InventorySchema = new Schema<IInventory>(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true, default: 0 },
    unitPrice: { type: Number, required: true },
    category: { type: String, default: "عام" },
  },
  { timestamps: true }
);

export default mongoose.models.Inventory ||
  mongoose.model<IInventory>("Inventory", InventorySchema);
