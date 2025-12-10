import { useLocalDatabaseContext } from "@/contexts/LocalDatabaseContext";
import { usePeriodContext } from "@/contexts/PeriodContext";
import { cn, formatDateRange, shouldCapitalizeMonths } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale } from "next-intl";

export function DateRangeSelector() {
  const locale = useLocale();
  const {
    currentDateRange,
    dataRanges,
    selectedDateRangeIndex,
    setSelectedDateRangeIndex,
  } = useLocalDatabaseContext();
  const { period } = usePeriodContext();

  function setDateRange(direction: "previous" | "next") {
    if (selectedDateRangeIndex === null) return;

    const modifier = direction === "previous" ? -1 : 1;
    let newDateRangeIndex = selectedDateRangeIndex + modifier;

    if (newDateRangeIndex < 0) newDateRangeIndex = 0;
    if (newDateRangeIndex >= dataRanges.length)
      newDateRangeIndex = dataRanges.length - 1;

    setSelectedDateRangeIndex(newDateRangeIndex);
  }

  function isRightArrowDisabled() {
    if (selectedDateRangeIndex === null) return true;
    if (selectedDateRangeIndex >= dataRanges.length - 1) return true;
    return false;
  }
  function isLeftArrowDisabled() {
    if (selectedDateRangeIndex === null) return true;
    if (selectedDateRangeIndex <= 0) return true;
    return false;
  }

  return (
    <div className="flex items-center justify-between">
      <ChevronLeft
        onClick={() => setDateRange("previous")}
        className={cn(
          "size-7 stroke-2 transition-colors -translate-x-1.5",
          isLeftArrowDisabled()
            ? "stroke-gray-light"
            : "cursor-pointer stroke-primary active:stroke-primary-highlighted supports-hover:hover:stroke-primary-highlighted"
        )}
      />
      <p
        className={cn(
          "font-semibold leading-none mt-1 select-text",
          shouldCapitalizeMonths(period, locale) && "capitalize"
        )}
      >
        {formatDateRange(currentDateRange, locale)}
      </p>
      <ChevronRight
        onClick={() => setDateRange("next")}
        className={cn(
          "size-7 stroke-2 transition-colors translate-x-1.5",
          isRightArrowDisabled()
            ? "stroke-gray-light"
            : "cursor-pointer stroke-primary active:stroke-primary-highlighted supports-hover:hover:stroke-primary-highlighted"
        )}
      />
    </div>
  );
}
