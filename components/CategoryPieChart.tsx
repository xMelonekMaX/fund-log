"use client";

import { ChartContainer, ChartLegend, ChartLegendContent } from "./ui/chart";
import { Label, Pie, PieChart, Sector } from "recharts";
import { useDefaultCurrencyContext } from "@/contexts/DefaultCurrencyContext";
import { useLocalDatabaseContext } from "@/contexts/LocalDatabaseContext";
import { useCurrencyConverterContext } from "@/contexts/CurrencyConverterContext";
import { PieSectorDataItem } from "recharts/types/polar/Pie";
import { formatPrice } from "@/lib/utils";
import { generateCategoryPieChartData } from "@/lib/localDatabaseUtils";
import { useLocale, useTranslations } from "next-intl";

type TCategoryPieChartProps = {
  selectedCategoryId: string | null;
  onSelect: (categoryId: string) => void;
};

export function CategoryPieChart({
  selectedCategoryId,
  onSelect,
}: TCategoryPieChartProps) {
  const locale = useLocale();
  const t = useTranslations();
  const { categories, expenses, currentDateRange } = useLocalDatabaseContext();
  const [defaultCurrency] = useDefaultCurrencyContext();
  const currencyConverter = useCurrencyConverterContext();

  const data = generateCategoryPieChartData(
    expenses,
    categories,
    currentDateRange,
    defaultCurrency,
    currencyConverter
  );

  const selectedCategory =
    data &&
    selectedCategoryId &&
    data.categoryData[selectedCategoryId].amount > 0
      ? data.categoryData[selectedCategoryId]
      : null;

  if (!data) {
    return (
      <ChartContainer
        config={{
          amount: {
            label: "Amount",
          },
        }}
        className="w-full max-h-[512px] aspect-square text-[#888888]"
      >
        <div className="size-full text-base text-center flex items-center justify-center"></div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer
      config={data.chartConfig}
      className="w-full max-h-[512px] aspect-square text-[#888888]"
    >
      {data.chartData.length > 0 ? (
        <PieChart>
          <Pie
            data={data.chartData}
            blendStroke={true}
            dataKey="amount"
            onClick={({ id }) => onSelect(id)}
            innerRadius={selectedCategory ? "45%" : undefined}
            activeIndex={data.chartData.findIndex(
              (entry) => entry.id === selectedCategoryId && selectedCategory
            )}
            activeShape={({
              outerRadius = 0,
              cornerRadius = 0,
              ...props
            }: PieSectorDataItem) => (
              <Sector
                {...props}
                outerRadius={outerRadius + 12}
                cornerRadius={cornerRadius + 2}
              />
            )}
            className="cursor-pointer"
          >
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) - 6}
                        className="fill-white text-3xl font-semibold select-text"
                      >
                        {selectedCategory?.percentage}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 16}
                        className="fill-[#8b8b90] text-sm select-text"
                      >
                        {selectedCategory &&
                          formatPrice(
                            selectedCategory.amount,
                            defaultCurrency,
                            locale
                          )}
                      </tspan>
                    </text>
                  );
                }
              }}
            />
          </Pie>
          <ChartLegend
            content={
              <ChartLegendContent
                nameKey="id"
                onItemClick={(itemId) => onSelect(itemId)}
                selectedId={selectedCategoryId}
              />
            }
            className="-translate-y-2 flex-wrap *:justify-center font-semibold"
          />
        </PieChart>
      ) : (
        <div className="size-full text-base text-center flex items-center justify-center">
          <p className="select-text">{t("noExpenses")}</p>
        </div>
      )}
    </ChartContainer>
  );
}
