"use client";

import { Header } from "@/components/Header";
import { PeriodFilter } from "@/components/PeriodFilter";
import { formatNumber } from "@/lib/utils";
import { CURRENCIES, TCurrency } from "@/types/currency";
import { useActiveDrawerContext } from "@/contexts/ActiveDrawerContext";
import { useDefaultCurrencyContext } from "@/contexts/DefaultCurrencyContext";
import { ExpenseList } from "@/components/ExpenseList";
import { TOTAL_AMOUNT_PLACEHOLDER } from "@/lib/constants";
import { DateRangeSelector } from "@/components/DateRangeSelector";
import { useLocalDatabaseContext } from "@/contexts/LocalDatabaseContext";
import { useCurrencyConverterContext } from "@/contexts/CurrencyConverterContext";
import { useState } from "react";
import { CategoryPieChart } from "@/components/CategoryPieChart";
import { SubcategoryPieChart } from "@/components/SubcategoryPieChart";
import { DraggableContent } from "@/components/DraggableContent";
import { useLocale, useTranslations } from "next-intl";

export default function Analytics() {
  const locale = useLocale();
  const t = useTranslations();
  const { onAddExpenseClick } = useActiveDrawerContext();
  const { expenses } = useLocalDatabaseContext();
  const { convert, exchangeRates } = useCurrencyConverterContext();
  const [defaultCurrency] = useDefaultCurrencyContext();
  const totalAmount = getTotalAmount(defaultCurrency);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<
    string | null
  >(null);

  function getTotalAmount(defaultCurrency: TCurrency) {
    if (!expenses) return 0;
    if (!exchangeRates) return null;

    return expenses.reduce((total, expense) => {
      const convertedAmount =
        expense.currency === defaultCurrency
          ? expense.amount
          : convert(expense.amount, expense.currency, defaultCurrency);

      if (convertedAmount === null) {
        return total;
      }

      return total + convertedAmount;
    }, 0);
  }

  function getTopExpenses(limit: number) {
    if (!expenses || !exchangeRates) return [];

    const sortedExpenses = expenses.sort(
      (a, b) =>
        (convert(b.amount, b.currency, "USD") || 0) -
        (convert(a.amount, a.currency, "USD") || 0)
    );

    return sortedExpenses.slice(0, limit);
  }

  function handleSelectCategory(categoryId: string) {
    setSelectedCategoryId(categoryId);
    setSelectedSubcategoryId(null);
  }

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
          <DateRangeSelector />
          <div className="flex flex-col md:flex-row">
            <CategoryPieChart
              selectedCategoryId={selectedCategoryId}
              onSelect={handleSelectCategory}
            />
            {selectedCategoryId && (
              <SubcategoryPieChart
                categoryId={selectedCategoryId}
                selectedSubcategoryId={selectedSubcategoryId}
                onSelect={setSelectedSubcategoryId}
              />
            )}
          </div>
        </div>

        <ExpenseList title={t("topExpenses")} expenses={getTopExpenses(5)} />

        <div className="flex flex-col items-center font-semibold text-base text-[#8b8b90] text-center">
          <p className="flex items-end justify-center gap-2 w-fit select-text">
            <span className="text-white text-3xl select-text">
              {totalAmount !== null
                ? formatNumber(totalAmount, locale)
                : TOTAL_AMOUNT_PLACEHOLDER}
            </span>
            {CURRENCIES[defaultCurrency].code}
          </p>
          <p className="text-sm w-fit select-text">
            {t("expensesFromAllYears")}
          </p>
        </div>
      </DraggableContent>
    </>
  );
}
