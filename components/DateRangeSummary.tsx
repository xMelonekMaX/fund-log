import { useDefaultCurrencyContext } from "@/contexts/DefaultCurrencyContext";
import { usePeriodContext } from "@/contexts/PeriodContext";
import { TOTAL_AMOUNT_PLACEHOLDER } from "@/lib/constants";
import {
  cn,
  formatDateRange,
  formatNumber,
  shouldCapitalizeMonths,
} from "@/lib/utils";
import { CURRENCIES } from "@/types/currency";
import { useCurrencyConverterContext } from "@/contexts/CurrencyConverterContext";
import { useLocalDatabaseContext } from "@/contexts/LocalDatabaseContext";
import { IExpenseLocal } from "@/models/Expense";
import { useLocale, useTranslations } from "next-intl";

type TDateRangeSummaryProps = {
  expenses: IExpenseLocal[] | undefined;
};

export function DateRangeSummary({ expenses }: TDateRangeSummaryProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [defaultCurrency] = useDefaultCurrencyContext();
  const { period } = usePeriodContext();
  const { convert } = useCurrencyConverterContext();
  const { currentDateRange } = useLocalDatabaseContext();

  const totalInDateRange = expenses?.reduce((total, expense) => {
    const convertedAmount =
      expense.currency === defaultCurrency
        ? expense.amount
        : convert(expense.amount, expense.currency, defaultCurrency);

    if (convertedAmount === null) {
      return total;
    }

    return total + convertedAmount;
  }, 0);

  return (
    <div className="font-semibold text-base text-[#8b8b90]">
      <p className="text-sm w-fit select-text">{t("total")}</p>
      <p className="flex items-end gap-2 w-fit select-text">
        <span className="text-white text-3xl select-text">
          {totalInDateRange !== undefined
            ? formatNumber(totalInDateRange, locale)
            : TOTAL_AMOUNT_PLACEHOLDER}
        </span>
        {CURRENCIES[defaultCurrency].code}
      </p>
      <p
        className={cn(
          "w-fit select-text",
          shouldCapitalizeMonths(period, locale) && "capitalize"
        )}
      >
        {formatDateRange(currentDateRange, locale)}
      </p>
    </div>
  );
}
