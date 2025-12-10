import { useLocalDatabaseContext } from "@/contexts/LocalDatabaseContext";
import { ChartContainer, ChartLegend, ChartLegendContent } from "./ui/chart";
import { Label, Pie, PieChart, Sector } from "recharts";
import {
  generateSubcategoryPieChartData,
  getCategoryById,
  getSubcategoriesByCategoryId,
} from "@/lib/localDatabaseUtils";
import { useDefaultCurrencyContext } from "@/contexts/DefaultCurrencyContext";
import { useCurrencyConverterContext } from "@/contexts/CurrencyConverterContext";
import { formatPrice } from "@/lib/utils";
import { PieSectorDataItem } from "recharts/types/polar/Pie";
import { useLocale, useTranslations } from "next-intl";

type TSubcategoryPieChartProps = {
  categoryId: string;
  selectedSubcategoryId: string | null;
  onSelect: (subcategoryId: string) => void;
};

export function SubcategoryPieChart({
  categoryId,
  selectedSubcategoryId,
  onSelect,
}: TSubcategoryPieChartProps) {
  const locale = useLocale();
  const t = useTranslations();
  const { categories, expenses, currentDateRange } = useLocalDatabaseContext();
  const [defaultCurrency] = useDefaultCurrencyContext();
  const currencyConverter = useCurrencyConverterContext();

  const category = getCategoryById(categories, categoryId);
  const subcategories = getSubcategoriesByCategoryId(categories, categoryId);
  const data = generateSubcategoryPieChartData(
    expenses,
    subcategories,
    currentDateRange,
    defaultCurrency,
    currencyConverter,
    category,
    t("uncategorized")
  );

  const selectedSubcategory =
    data &&
    selectedSubcategoryId &&
    data.subcategoryData[selectedSubcategoryId].amount > 0
      ? data.subcategoryData[selectedSubcategoryId]
      : null;

  if (!data || data.chartData.length === 0) {
    return;
  }

  return (
    <ChartContainer
      config={data.chartConfig}
      className="w-full max-h-[512px] aspect-square text-[#888888]"
    >
      <PieChart>
        <Pie
          data={data.chartData}
          blendStroke={true}
          dataKey="amount"
          onClick={({ id }) => onSelect(id)}
          innerRadius={selectedSubcategory ? "45%" : undefined}
          activeIndex={data.chartData.findIndex(
            (entry) => entry.id === selectedSubcategoryId && selectedSubcategory
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
                      {selectedSubcategory?.percentage}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 16}
                      className="fill-[#8b8b90] text-sm select-text"
                    >
                      {selectedSubcategory &&
                        formatPrice(
                          selectedSubcategory.amount,
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
              selectedId={selectedSubcategoryId}
            />
          }
          className="-translate-y-2 flex-wrap *:justify-center font-semibold"
        />
      </PieChart>
    </ChartContainer>
  );
}
