"use server";

import Expense, { IExpense } from "@/models/Expense";
import { SYNC_BATCH_SIZE } from "@/lib/constants";
import { IExpenseLocal } from "@/models/Expense";
import Category, { ICategory, ICategoryLocal } from "@/models/Category";
import { getUserIfSessionValid } from "./userActions";
import { IPaginatedResponse } from "@/types/paginatedResponse";

export async function fetchModifiedCategoriesBatch(
  page: number,
  since: Date
): Promise<IPaginatedResponse<ICategoryLocal[]>> {
  try {
    const user = await getUserIfSessionValid();
    if (!user) throw new Error("Unauthorized");

    const skip = (page - 1) * SYNC_BATCH_SIZE;
    const [rawData, total] = await Promise.all([
      Category.find({
        userId: user.id,
        updatedAt: { $gt: since },
      })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(SYNC_BATCH_SIZE)
        .lean<ICategory[]>(),
      Category.countDocuments({
        userId: user.id,
        updatedAt: { $gt: since },
      }),
    ]);

    const data = rawData.map(({ userId, ...document }) => ({
      ...document,
      _id: document._id.toString(),
    }));

    return {
      data,
      hasMore: skip + SYNC_BATCH_SIZE < total,
      total,
    };
  } catch (error) {
    console.error("Fetch modified categories failed:", error);
    throw error;
  }
}

export async function fetchModifiedExpensesBatch(
  page: number,
  since: Date
): Promise<IPaginatedResponse<IExpenseLocal[]>> {
  try {
    const user = await getUserIfSessionValid();
    if (!user) throw new Error("Unauthorized");

    const skip = (page - 1) * SYNC_BATCH_SIZE;
    const [rawData, total] = await Promise.all([
      Expense.find({
        userId: user.id,
        updatedAt: { $gt: since },
      })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(SYNC_BATCH_SIZE)
        .lean<IExpense[]>(),
      Expense.countDocuments({
        userId: user.id,
        updatedAt: { $gt: since },
      }),
    ]);

    const data = rawData.map(({ userId, ...document }) => ({
      ...document,
      _id: document._id.toString(),
      categoryId: document.categoryId.toString(),
      subcategoryId: document.subcategoryId?.toString(),
    }));

    return {
      data,
      hasMore: skip + SYNC_BATCH_SIZE < total,
      total,
    };
  } catch (error) {
    console.error("Fetch modified expenses failed:", error);
    throw error;
  }
}

export async function uploadCategoriesBatch(categories: ICategoryLocal[]) {
  try {
    const user = await getUserIfSessionValid();
    if (!user) throw new Error("Unauthorized");

    const existingCategories = await Category.find({
      _id: { $in: categories.map((category) => category._id) },
    })
      .select("_id userId")
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
        },
        update: {
          $set: {
            userId: user.id,
            name: category.name,
            icon: category.icon,
            color: category.color,
            subcategories: category.subcategories,
            deletedAt: category.deletedAt,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt,
          },
        },
        upsert: true,
      },
    }));

    await Category.bulkWrite(operations, {
      ordered: false,
      timestamps: false,
    });
  } catch (error) {
    console.error("Upload categories batch failed:", error);
    throw error;
  }
}

export async function uploadExpensesBatch(expenses: IExpenseLocal[]) {
  try {
    const user = await getUserIfSessionValid();
    if (!user) throw new Error("Unauthorized");

    const existingExpenses = await Expense.find({
      _id: { $in: expenses.map((expense) => expense._id) },
    })
      .select("_id userId")
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
        },
        update: {
          $set: {
            userId: user.id,
            categoryId: expense.categoryId,
            subcategoryId: expense.subcategoryId,
            amount: expense.amount,
            currency: expense.currency,
            description: expense.description,
            date: expense.date,
            deletedAt: expense.deletedAt,
            createdAt: expense.createdAt,
            updatedAt: expense.updatedAt,
          },
        },
        upsert: true,
      },
    }));

    await Expense.bulkWrite(operations, {
      ordered: false,
      timestamps: false,
    });
  } catch (error) {
    console.error("Upload expenses batch failed:", error);
    throw error;
  }
}
