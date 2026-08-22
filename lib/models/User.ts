import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  phone: string;
  password: string;
  storeName: string;
  failedAttempts: number;
  lockUntil: Date | null;
  isActive: boolean;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    storeName: { type: String, default: "متجري" },
    failedAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

UserSchema.methods.isLocked = function (): boolean {
  if (this.lockUntil && this.lockUntil > new Date()) {
    return true;
  }
  if (this.lockUntil && this.lockUntil <= new Date()) {
    this.failedAttempts = 0;
    this.lockUntil = null;
  }
  return false;
};

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
