import { ICategoryLocal } from "@/models/Category";
import { IExpenseLocal } from "@/models/Expense";
import { TDataRange, TDataRanges } from "@/types/dataRange";
import { createContext, Dispatch, SetStateAction, use } from "react";

export type TLocalDatabaseContext = {
  categories: ICategoryLocal[] | undefined;
  expenses: IExpenseLocal[] | undefined;
  dataRanges: TDataRanges;
  currentDateRange: TDataRange | null;
  selectedDateRangeIndex: number | null;
  setSelectedDateRangeIndex: Dispatch<SetStateAction<number | null>>;
};

export const LocalDatabaseContext = createContext<TLocalDatabaseContext | null>(
  null
);

export const useLocalDatabaseContext = () => {
  const localDatabaseContext = use(LocalDatabaseContext);

  if (localDatabaseContext === null) {
    throw new Error("useLocalDatabaseContext error");
  }

  return localDatabaseContext;
};
