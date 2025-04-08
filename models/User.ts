import { TCurrency } from "@/types/currency";
import { TPeriod } from "@/types/period";
import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  defaultCurrencyCode: TCurrency;
  selectedPeriod?: TPeriod;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    defaultCurrencyCode: { type: String },
    selectedPeriod: { type: String },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
