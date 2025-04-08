import { ICategory, ICategoryLocal } from "@/models/Category";
import { IExpense, IExpenseLocal } from "@/models/Expense";

export type TDocuments = (IExpense | ICategory)[];
export type TDocumentsLocal = (IExpenseLocal | ICategoryLocal)[];
