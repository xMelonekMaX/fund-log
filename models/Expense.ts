import { TCurrency } from "@/types/currency";
import mongoose, { Document, ObjectId, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface IExpenseLocal {
	_id: string;
	categoryId: string;
	subcategoryId?: string;
	amount: number;
	currency: TCurrency;
	description: string;
	date: Date;
	createdAt: Date;
	updatedAt: Date;
	deletedAt?: Date;
}

export interface IExpense extends IExpenseLocal, Document<string> {
	userId: ObjectId;
}

const ExpenseSchema = new mongoose.Schema(
	{
		_id: { type: String, default: uuidv4 },
		userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
		categoryId: {
			type: String,
			required: true,
			ref: "Category",
		},
		subcategoryId: {
			type: String,
			ref: "Category.subcategories",
		},
		amount: { type: Number, required: true },
		currency: { type: String, required: true },
		description: { type: String, required: true },
		date: { type: Date, required: true },
		deletedAt: { type: Date },
		createdAt: { type: Date, required: true },
		updatedAt: { type: Date, required: true },
	},
	{ timestamps: false }
);

ExpenseSchema.index({ userId: 1 });
ExpenseSchema.index({ categoryId: 1 });
ExpenseSchema.index({ date: -1 });
ExpenseSchema.index({ updatedAt: -1 });

const Expense =
	mongoose.models.Expense || mongoose.model<IExpense>("Expense", ExpenseSchema);

export default Expense;
