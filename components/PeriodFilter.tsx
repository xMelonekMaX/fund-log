import { useLocalDatabaseContext } from "@/contexts/LocalDatabaseContext";
import { usePeriodContext } from "@/contexts/PeriodContext";
import { useTranslations } from "next-intl";

export function PeriodFilter() {
  const t = useTranslations();
  const { period, onPeriodChange } = usePeriodContext();
  const { setSelectedDateRangeIndex } = useLocalDatabaseContext();

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative bg-gray-dark h-[30px] grid grid-cols-5 text-xs text-center font-semibold rounded-lg leading-none overflow-hidden">
        <input
          type="radio"
          name="period"
          id="dayPeriod"
          className="peer/day hidden"
          defaultChecked={period === "day"}
          onChange={() => {
            onPeriodChange("day");
            setSelectedDateRangeIndex(null);
          }}
        />
        <label htmlFor="dayPeriod" className="cursor-pointer py-2 z-bump">
          {t("daySymbol")}
        </label>

        <input
          type="radio"
          name="period"
          id="weekPeriod"
          className="peer/week hidden"
          defaultChecked={period === "week"}
          onChange={() => {
            onPeriodChange("week");
            setSelectedDateRangeIndex(null);
          }}
        />
        <label htmlFor="weekPeriod" className="cursor-pointer py-2 z-bump">
          {t("weekSymbol")}
        </label>

        <input
          type="radio"
          name="period"
          id="monthPeriod"
          className="peer/month hidden"
          defaultChecked={period === "month"}
          onChange={() => {
            onPeriodChange("month");
            setSelectedDateRangeIndex(null);
          }}
        />
        <label htmlFor="monthPeriod" className="cursor-pointer py-2 z-bump">
          {t("monthSymbol")}
        </label>

        <input
          type="radio"
          name="period"
          id="halfYearPeriod"
          className="peer/halfyear hidden"
          defaultChecked={period === "halfYear"}
          onChange={() => {
            onPeriodChange("halfYear");
            setSelectedDateRangeIndex(null);
          }}
        />
        <label htmlFor="halfYearPeriod" className="cursor-pointer py-2 z-bump">
          {t("halfYearSymbol")}
        </label>

        <input
          type="radio"
          name="period"
          id="yearPeriod"
          className="peer/year hidden"
          defaultChecked={period === "year"}
          onChange={() => {
            onPeriodChange("year");
            setSelectedDateRangeIndex(null);
          }}
        />
        <label htmlFor="yearPeriod" className="cursor-pointer py-2 z-bump">
          {t("yearSymbol")}
        </label>

        <div className="absolute size-full grid grid-cols-5">
          <div></div>
          <div className="my-2 border-l border-l-separator"></div>
          <div className="my-2 border-l border-l-separator"></div>
          <div className="my-2 border-l border-l-separator"></div>
          <div className="my-2 border-l border-l-separator"></div>
        </div>

        <div className="absolute top-[2px] bg-gray-dark w-[calc(20%+1px)] h-[calc(100%-4px)] transition-all duration-300 left-0 peer-checked/week:left-[20%] peer-checked/month:left-[40%] peer-checked/halfyear:left-[60%] peer-checked/year:left-[80%] peer-checked/year:w-[20%]">
          <div className="bg-[#5a5a5f] mx-auto rounded-md h-full w-11/12"></div>
        </div>
      </div>
    </div>
  );
}
