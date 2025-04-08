import { TIcon } from "@/types/icon";
import mongoose, { Document, ObjectId, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface ICategoryLocal {
  _id: string;
  name: string;
  icon: TIcon;
  color: string;
  subcategories: ISubcategory[];
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategory extends ICategoryLocal, Document {
  _id: string;
  userId: ObjectId;
}

export interface ISubcategory {
  _id: string;
  name: string;
}

const SubcategorySchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    default: uuidv4,
  },
  name: { type: String, required: true },
});

const CategorySchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    name: { type: String, required: true },
    icon: { type: String, required: true },
    color: { type: String, required: true },
    subcategories: [SubcategorySchema],
    deletedAt: { type: Date },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
  },
  { timestamps: false }
);

CategorySchema.index({ userId: 1 });
CategorySchema.index({ updatedAt: -1 });

const Category =
  mongoose.models.Category ||
  mongoose.model<ICategory>("Category", CategorySchema);

export default Category;
