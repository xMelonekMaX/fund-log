"use client";

import { DateRangeChart } from "@/components/DateRangeChart";
import { Header } from "@/components/Header";
import { PeriodFilter } from "@/components/PeriodFilter";
import { localDb } from "@/lib/indexedDb";
import { formatDate, groupExpensesByDay } from "@/lib/utils";
import { useLiveQuery } from "dexie-react-hooks";
import { useActiveDrawerContext } from "@/contexts/ActiveDrawerContext";
import { ExpenseList } from "@/components/ExpenseList";
import { useLocalDatabaseContext } from "@/contexts/LocalDatabaseContext";
import { usePeriodContext } from "@/contexts/PeriodContext";
import { DateRangeSummary } from "@/components/DateRangeSummary";
import { DraggableContent } from "@/components/DraggableContent";
import { useLocale, useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations();
  const locale = useLocale();
  const { period } = usePeriodContext();
  const { currentDateRange } = useLocalDatabaseContext();
  const { onAddExpenseClick } = useActiveDrawerContext();

  const expenses = useLiveQuery(async () => {
    if (!currentDateRange) return [];

    return await localDb.expenses
      .where("date")
      .between(currentDateRange.from, currentDateRange.to, true, true)
      .filter((expense) => !expense.deletedAt)
      .toArray();
  }, [currentDateRange]);

  const groupedExpenses = groupExpensesByDay(expenses);

  return (
    <>
      <Header
        rightButton={{
          name: t("add"),
          onClick: onAddExpenseClick,
        }}
      />

      <DraggableContent
        className="flex flex-col gap-8 pt-2 mb-8 w-full mx-auto px-5 max-w-4xl"
        dragBody={true}
      >
        <div className="flex flex-col gap-2">
          <PeriodFilter />
          <div>
            <DateRangeSummary expenses={expenses} />
            <DateRangeChart />
          </div>
        </div>

        {Object.entries(groupedExpenses).map(([date, dailyExpenses]) => (
          <ExpenseList
            key={date}
            title={period !== "day" && formatDate(date, locale, t)}
            expenses={dailyExpenses}
          />
        ))}
      </DraggableContent>
    </>
  );
}
