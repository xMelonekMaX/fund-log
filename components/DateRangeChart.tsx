import { Bar, XAxis } from "recharts";
import { BarChart } from "recharts";
import { CartesianGrid } from "recharts";
import { ChartConfig, ChartContainer } from "./ui/chart";
import { useLocalDatabaseContext } from "@/contexts/LocalDatabaseContext";
import { useDefaultCurrencyContext } from "@/contexts/DefaultCurrencyContext";
import { useCurrencyConverterContext } from "@/contexts/CurrencyConverterContext";
import { TDataRange } from "@/types/dataRange";
import { cn, formatDateRange } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { DraggableContent } from "./DraggableContent";

const BAR_SIZE = 42;

const chartConfig = {
  amount: {
    label: "Amount",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export function DateRangeChart() {
  const locale = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  const {
    expenses,
    dataRanges,
    selectedDateRangeIndex,
    setSelectedDateRangeIndex,
  } = useLocalDatabaseContext();
  const [defaultCurrency] = useDefaultCurrencyContext();
  const { convert } = useCurrencyConverterContext();

  useEffect(() => {
    if (ref.current && selectedDateRangeIndex !== null)
      ref.current.scrollTo({
        left: selectedDateRangeIndex * BAR_SIZE,
        behavior: "smooth",
      });
  }, [selectedDateRangeIndex]);

  const chartData = dataRanges.map((dataRange, index) => {
    if (index === selectedDateRangeIndex)
      return {
        dateRangeIndex: index,
        period: formatDateRange(dataRange, locale, true),
        amount: getTotalInDateRange(dataRange),
        fill: "var(--primary)",
      };
    else
      return {
        dateRangeIndex: index,
        period: formatDateRange(dataRange, locale, true),
        amount: getTotalInDateRange(dataRange),
      };
  });

  function getTotalInDateRange({ from, to }: TDataRange) {
    return expenses
      ?.filter((expense) => expense.date >= from && expense.date <= to)
      .reduce((total, expense) => {
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

  return (
    <div className="overflow-hidden">
      <DraggableContent
        forwardedRef={ref}
        className="scrollbar-none font-semibold"
      >
        <ChartContainer
          config={chartConfig}
          className="h-52 min-w-full"
          style={{ width: chartData.length * BAR_SIZE + "px" }}
        >
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid
              stroke="#363637"
              horizontal={true}
              vertical={false}
              strokeWidth={0.5}
            />
            <XAxis
              dataKey="period"
              tickLine={false}
              tickMargin={12}
              interval={0}
              tick={({ x, y, payload }) => (
                <g
                  transform={`translate(${x},${y})`}
                  className={cn(
                    "transition-colors fill-[#464649] active:fill-[#888888] supports-hover:hover:fill-[#888888]",
                    payload.index === selectedDateRangeIndex && "fill-[#888888]"
                  )}
                >
                  <text x={0} y={0} dy={0}>
                    <tspan textAnchor="middle" x="0" className="capitalize">
                      {payload.value.split(" ")[0]}
                    </tspan>
                    <tspan textAnchor="middle" x="0" dy="14">
                      {payload.value.split(" ")[1]}
                    </tspan>
                  </text>
                </g>
              )}
              axisLine={false}
              className="text-sm cursor-pointer"
              onClick={(data) => setSelectedDateRangeIndex(data.index)}
            />
            <Bar
              dataKey="amount"
              fill="#00411b"
              radius={3}
              className="cursor-pointer"
              onClick={(data) => setSelectedDateRangeIndex(data.dateRangeIndex)}
            />
          </BarChart>
        </ChartContainer>
      </DraggableContent>
    </div>
  );
}
