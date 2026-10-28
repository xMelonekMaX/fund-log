"use server";

import Expense, { IExpense } from "@/models/Expense";
import { SYNC_BATCH_SIZE } from "@/lib/constants";
import { IExpenseLocal } from "@/models/Expense";
import Category, { ICategory, ICategoryLocal } from "@/models/Category";
import { getUserIfSessionValid } from "./userActions";
import { IPaginatedResponse } from "@/types/paginatedResponse";

export async function fetchModifiedCategoriesBatch(
	page: number,
	since: Date,
	afterId?: string,
	expectedUserId?: string
): Promise<IPaginatedResponse<ICategoryLocal[]>> {
	try {
		const user = await getUserIfSessionValid();
		if (!user || (expectedUserId && user.id !== expectedUserId)) throw new Error("Unauthorized");

		const skip = afterId === undefined ? (page - 1) * SYNC_BATCH_SIZE : 0;
		const [rawData, total] = await Promise.all([
			Category.find({
				userId: user.id,
				updatedAt: { $gt: since },
				...(afterId ? { _id: { $gt: afterId } } : {}),
			})
				.sort({ _id: 1 })
				.skip(skip)
				.limit(SYNC_BATCH_SIZE + 1)
				.select("-__v -userId")
				.lean<ICategory[]>(),
			Category.countDocuments({
				userId: user.id,
				updatedAt: { $gt: since },
				...(afterId ? { _id: { $gt: afterId } } : {}),
			}),
		]);

		const data = rawData.slice(0, SYNC_BATCH_SIZE).map((document) => ({
			...document,
			_id: document._id.toString(),
		}));

		return {
			data,
			hasMore: rawData.length > SYNC_BATCH_SIZE,
			total,
		};
	} catch (error) {
		console.error("Fetch modified categories failed:", error);
		throw error;
	}
}

export async function fetchModifiedExpensesBatch(
	page: number,
	since: Date,
	afterId?: string,
	expectedUserId?: string
): Promise<IPaginatedResponse<IExpenseLocal[]>> {
	try {
		const user = await getUserIfSessionValid();
		if (!user || (expectedUserId && user.id !== expectedUserId)) throw new Error("Unauthorized");

		const skip = afterId === undefined ? (page - 1) * SYNC_BATCH_SIZE : 0;
		const [rawData, total] = await Promise.all([
			Expense.find({
				userId: user.id,
				updatedAt: { $gt: since },
				...(afterId ? { _id: { $gt: afterId } } : {}),
			})
				.sort({ _id: 1 })
				.skip(skip)
				.limit(SYNC_BATCH_SIZE + 1)
				.select("-__v -userId")
				.lean<IExpense[]>(),
			Expense.countDocuments({
				userId: user.id,
				updatedAt: { $gt: since },
				...(afterId ? { _id: { $gt: afterId } } : {}),
			}),
		]);

		const data = rawData.slice(0, SYNC_BATCH_SIZE).map((document) => ({
			...document,
			_id: document._id.toString(),
			categoryId: document.categoryId.toString(),
			subcategoryId: document.subcategoryId?.toString(),
		}));

		return {
			data,
			hasMore: rawData.length > SYNC_BATCH_SIZE,
			total,
		};
	} catch (error) {
		console.error("Fetch modified expenses failed:", error);
		throw error;
	}
}

export async function uploadCategoriesBatch(categories: ICategoryLocal[], expectedUserId?: string): Promise<ICategoryLocal[]> {
	if (categories.length === 0) return [];
	try {
		const user = await getUserIfSessionValid();
		if (!user || (expectedUserId && user.id !== expectedUserId)) throw new Error("Unauthorized");

		const existingCategories = await Category.find({
			_id: { $in: categories.map((category) => category._id) },
		})
			.select("_id userId updatedAt")
			.lean();

		const unauthorizedAccess = existingCategories.some(
			(category) => category.userId.toString() !== user.id
		);
		if (unauthorizedAccess) {
			throw new Error(
				"Unauthorized: Attempt to modify another user's category"
			);
		}

		const operations = categories.map((category) => ({
			updateOne: {
				filter: {
					_id: category._id,
					userId: user.id,
					$or: [{ updatedAt: { $lte: category.updatedAt } }, { updatedAt: { $exists: false } }],
				},
				update: {
					$set: {
						userId: user.id,
						name: category.name,
						icon: category.icon,
						color: category.color,
						subcategories: category.subcategories,
						...(category.deletedAt ? { deletedAt: category.deletedAt } : {}),
						createdAt: category.createdAt,
						updatedAt: category.updatedAt,
					},
					...(!category.deletedAt ? { $unset: { deletedAt: 1 } } : {}),
				},
				upsert: !existingCategories.some((existing) => existing._id === category._id),
			},
		}));

		await Category.bulkWrite(operations, {
			ordered: false,
			timestamps: false,
		});

		// Return the authoritative version, including a concurrent newer write.
		return await Category.find({
			_id: { $in: categories.map((document) => document._id) },
			userId: user.id,
		}).select("-userId -__v").lean<ICategoryLocal[]>();
	} catch (error) {
		console.error("Upload categories batch failed:", error);
		throw error;
	}
}

export async function uploadExpensesBatch(expenses: IExpenseLocal[], expectedUserId?: string): Promise<IExpenseLocal[]> {
	if (expenses.length === 0) return [];
	try {
		const user = await getUserIfSessionValid();
		if (!user || (expectedUserId && user.id !== expectedUserId)) throw new Error("Unauthorized");

		const existingExpenses = await Expense.find({
			_id: { $in: expenses.map((expense) => expense._id) },
		})
			.select("_id userId updatedAt")
			.lean();

		const unauthorizedAccess = existingExpenses.some(
			(expense) => expense.userId.toString() !== user.id
		);
		if (unauthorizedAccess) {
			throw new Error("Unauthorized: Attempt to modify another user's expense");
		}

		const operations = expenses.map((expense) => ({
			updateOne: {
				filter: {
					_id: expense._id,
					userId: user.id,
					$or: [{ updatedAt: { $lte: expense.updatedAt } }, { updatedAt: { $exists: false } }],
				},
				update: {
					$set: {
						userId: user.id,
						categoryId: expense.categoryId,
						...(expense.subcategoryId ? { subcategoryId: expense.subcategoryId } : {}),
						amount: expense.amount,
						currency: expense.currency,
						description: expense.description,
						date: expense.date,
						...(expense.deletedAt ? { deletedAt: expense.deletedAt } : {}),
						createdAt: expense.createdAt,
						updatedAt: expense.updatedAt,
					},
					$unset: {
						...(!expense.deletedAt ? { deletedAt: 1 } : {}),
						...(!expense.subcategoryId ? { subcategoryId: 1 } : {}),
					},
				},
				upsert: !existingExpenses.some((existing) => existing._id === expense._id),
			},
		}));

		await Expense.bulkWrite(operations, {
			ordered: false,
			timestamps: false,
		});

		// Return the authoritative version, including a concurrent newer write.
		return await Expense.find({
			_id: { $in: expenses.map((document) => document._id) },
			userId: user.id,
		}).select("-userId -__v").lean<IExpenseLocal[]>();
	} catch (error) {
		console.error("Upload expenses batch failed:", error);
		throw error;
	}
}

export async function fetchCategoriesCount(): Promise<number> {
	try {
		const user = await getUserIfSessionValid();
		if (!user) throw new Error("Unauthorized");

		const count = await Category.countDocuments({
			userId: user.id,
		});

		return count;
	} catch (error) {
		console.error("Fetch categories count failed:", error);
		throw error;
	}
}

export async function fetchExpensesCount(): Promise<number> {
	try {
		const user = await getUserIfSessionValid();
		if (!user) throw new Error("Unauthorized");

		const count = await Expense.countDocuments({
			userId: user.id,
		});

		return count;
	} catch (error) {
		console.error("Fetch expenses count failed:", error);
		throw error;
	}
}
