"use client";

import { Nav } from "@/components/Nav";
import { CategoryDrawer } from "@/components/drawers/CategoryDrawer";
import { ExpenseDrawer } from "@/components/drawers/ExpenseDrawer";
import { ActiveDrawerContext } from "@/contexts/ActiveDrawerContext";
import { CurrencyConverterContext } from "@/contexts/CurrencyConverterContext";
import { usePeriodContext } from "@/contexts/PeriodContext";
import { LocalDatabaseContext } from "@/contexts/LocalDatabaseContext";
import { useCurrencyConverter } from "@/hooks/useCurrencyConverter";
import { localDb } from "@/lib/indexedDb";
import { getNewestExpense, getOldestExpense } from "@/lib/localDatabaseUtils";
import { createDateRanges } from "@/lib/utils";
import { TActiveDrawer } from "@/types/activeDrawer";
import { TDataRanges } from "@/types/dataRange";
import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";

export default function LoggedInLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { period } = usePeriodContext();
  const currencyConverter = useCurrencyConverter();
  const [activeDrawer, setActiveDrawer] = useState<TActiveDrawer>(null);

  const expenses = useLiveQuery(async () => {
    return localDb.expenses.filter((expense) => !expense.deletedAt).toArray();
  });
  const categories = useLiveQuery(async () => {
    return localDb.categories
      .filter((category) => !category.deletedAt)
      .toArray();
  });

  const [selectedDateRangeIndex, setSelectedDateRangeIndex] = useState<
    number | null
  >(null);
  let dataRanges: TDataRanges = [];
  const oldestExpense = getOldestExpense(expenses);
  const newestExpense = getNewestExpense(expenses);
  if (oldestExpense && newestExpense) {
    const data = createDateRanges(
      period,
      oldestExpense.date,
      newestExpense.date
    );

    dataRanges = data.dateRanges;

    if (
      selectedDateRangeIndex === null ||
      !data.dateRanges.at(selectedDateRangeIndex)
    )
      setSelectedDateRangeIndex(data.defaultIndex);
  }
  const currentDateRange =
    selectedDateRangeIndex !== null ? dataRanges[selectedDateRangeIndex] : null;

  function handleAddExpenseClick() {
    if (categories === undefined) return;

    if (categories.length === 0) {
      router.push("/settings/categories");
    } else {
      setActiveDrawer({ type: "expense" });
    }
  }

  return (
    <CurrencyConverterContext value={currencyConverter}>
      <LocalDatabaseContext
        value={{
          categories,
          expenses,
          dataRanges,
          currentDateRange,
          selectedDateRangeIndex,
          setSelectedDateRangeIndex,
        }}
      >
        <ActiveDrawerContext
          value={{
            activeDrawer,
            setActiveDrawer,
            onAddExpenseClick: handleAddExpenseClick,
          }}
        >
          <ExpenseDrawer>
            <CategoryDrawer>
              <main className="pt-safe-t-10 pb-safe-b-12 min-h-screen">
                {children}
              </main>
              <Nav />
            </CategoryDrawer>
          </ExpenseDrawer>
        </ActiveDrawerContext>
      </LocalDatabaseContext>
    </CurrencyConverterContext>
  );
}
