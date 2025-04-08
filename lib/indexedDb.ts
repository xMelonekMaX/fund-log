import Dexie, { EntityTable } from "dexie";
import { APP_NAME } from "./constants";
import { IExpenseLocal } from "@/models/Expense";
import { ICategoryLocal } from "@/models/Category";

const localDb = new Dexie(APP_NAME.toLowerCase()) as Dexie & {
  expenses: EntityTable<IExpenseLocal, "_id">;
  categories: EntityTable<ICategoryLocal, "_id">;
};

localDb.version(1).stores({
  expenses:
    "_id, categoryId, subcategoryId, amount, currency, description, date, createdAt, updatedAt",
  categories: "_id, name, icon, color, subcategories, createdAt, updatedAt",
});

export { localDb };
