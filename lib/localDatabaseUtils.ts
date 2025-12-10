import { ChartConfig } from "./../components/ui/chart";
import { IExpenseLocal } from "@/models/Expense";
import { ICategoryLocal, ISubcategory } from "@/models/Category";
import { ICurrencyConverterContext } from "@/hooks/useCurrencyConverter";
import { TDataRange } from "@/types/dataRange";
import { TCurrency } from "@/types/currency";
import { UNCATEGORIZED_ID } from "./constants";
import { generateColorPalette } from "./utils";

export function getUnusedSubcategories(
  expenses: IExpenseLocal[] | undefined,
  subcategories: ISubcategory[]
) {
  const unusedSubcategoryIds = new Set(
    subcategories.map((subcategory) => subcategory._id)
  );

  expenses?.forEach((expense) => {
    if (expense.subcategoryId) {
      unusedSubcategoryIds.delete(expense.subcategoryId);
    }
    if (unusedSubcategoryIds.size === 0) {
      return;
    }
  });

  return unusedSubcategoryIds;
}

export function isCategoryUsed(
  expenses: IExpenseLocal[] | undefined,
  categoryId: string
) {
  for (const expense of expenses ?? []) {
    if (expense.categoryId === categoryId) {
      return true;
    }
  }
  return false;
}

export function getOldestExpense(expenses: IExpenseLocal[] | undefined) {
  if (expenses) {
    const sortedExpenses = [...expenses].sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );
    return sortedExpenses[0];
  }
  return null;
}

export function getNewestExpense(expenses: IExpenseLocal[] | undefined) {
  if (expenses) {
    const sortedExpenses = [...expenses].sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );
    return sortedExpenses[0];
  }
  return null;
}

export function getCategoryById(
  categories: ICategoryLocal[] | undefined,
  categoryId: string
): ICategoryLocal | undefined {
  return categories?.find((category) => category._id === categoryId);
}

export function getSubcategoriesByCategoryId(
  categories: ICategoryLocal[] | undefined,
  categoryId: string | undefined
) {
  if (!categories) return [];

  const category = categories?.find((cat) => cat._id === categoryId);
  const subcategories = category?.subcategories;

  return subcategories || [];
}

export function generateCategoryPieChartData(
  expenses: IExpenseLocal[] | undefined,
  categories: ICategoryLocal[] | undefined,
  currentDateRange: TDataRange | null,
  defaultCurrency: TCurrency,
  currencyConverter: ICurrencyConverterContext
) {
  if (
    expenses === undefined ||
    categories === undefined ||
    !currencyConverter.exchangeRates
  ) {
    return null;
  }

  let chartConfig = {
    amount: {
      label: "Amount",
    },
  } satisfies ChartConfig;

  let chartData: {
    id: string;
    name: string;
    amount: number;
    fill: string;
  }[] = [];

  const categoryData: Record<string, { amount: number; percentage: string }> =
    {};

  if (categories.length === 0 || expenses.length === 0) {
    return {
      chartConfig: chartConfig,
      chartData: chartData,
      categoryData: categoryData,
    };
  }

  let totalAmount = 0;

  categories.forEach(
    (category) => (categoryData[category._id] = { amount: 0, percentage: "" })
  );

  expenses.forEach((expense) => {
    if (
      currentDateRange &&
      expense.date >= currentDateRange.from &&
      expense.date <= currentDateRange.to
    ) {
      const convertedAmount = currencyConverter.convert(
        expense.amount,
        expense.currency,
        defaultCurrency
      );
      if (convertedAmount) {
        categoryData[expense.categoryId].amount += convertedAmount;
        totalAmount += convertedAmount;
      }
    }
  });

  const percentages = calculatePercentages(categoryData, totalAmount);
  Object.keys(categoryData).forEach((category, index) => {
    categoryData[category].percentage = percentages[index];
  });

  chartData = categories
    .filter((category) => categoryData[category._id].amount > 0)
    .map((category) => ({
      id: category._id,
      name: category.name,
      amount: categoryData[category._id].amount,
      fill: category.color,
    }));

  chartConfig = {
    ...chartConfig,
    ...Object.fromEntries(
      categories.map((category) => [
        category._id,
        {
          label: category.name,
          color: category.color,
        },
      ])
    ),
  };

  return {
    chartConfig: chartConfig,
    chartData: chartData,
    categoryData: categoryData,
  };
}

export function generateSubcategoryPieChartData(
  expenses: IExpenseLocal[] | undefined,
  subcategories: ISubcategory[] | undefined,
  currentDateRange: TDataRange | null,
  defaultCurrency: TCurrency,
  currencyConverter: ICurrencyConverterContext,
  category: ICategoryLocal | undefined,
  uncategorizedLabel: string
) {
  if (
    expenses === undefined ||
    subcategories === undefined ||
    !currencyConverter.exchangeRates ||
    currentDateRange === null ||
    category === undefined
  ) {
    return null;
  }

  let chartConfig = {
    amount: {
      label: "Amount",
    },
    [UNCATEGORIZED_ID]: {
      label: uncategorizedLabel,
    },
  } satisfies ChartConfig;

  let chartData: {
    id: string;
    name: string;
    amount: number;
    fill: string;
  }[] = [];

  const subcategoryData: Record<
    string,
    { amount: number; percentage: string }
  > = {};

  if (expenses.length === 0) {
    return {
      chartConfig: chartConfig,
      chartData: chartData,
      subcategoryData: subcategoryData,
    };
  }

  let totalAmount = 0;

  subcategories.forEach(
    (subcategory) =>
      (subcategoryData[subcategory._id] = { amount: 0, percentage: "" })
  );
  subcategoryData[UNCATEGORIZED_ID] = { amount: 0, percentage: "" };

  expenses.forEach((expense) => {
    if (
      expense.date >= currentDateRange.from &&
      expense.date <= currentDateRange.to &&
      expense.categoryId === category._id
    ) {
      const convertedAmount = currencyConverter.convert(
        expense.amount,
        expense.currency,
        defaultCurrency
      );
      if (convertedAmount) {
        const subcategoryId = expense.subcategoryId || UNCATEGORIZED_ID;
        subcategoryData[subcategoryId].amount += convertedAmount;
        totalAmount += convertedAmount;
      }
    }
  });

  const percentages = calculatePercentages(subcategoryData, totalAmount);
  Object.keys(subcategoryData).forEach((subcategory, index) => {
    subcategoryData[subcategory].percentage = percentages[index];
  });

  const colorPalette = generateColorPalette(
    category.color,
    subcategories.length + 1
  );

  chartData = subcategories
    .filter((subcategory) => subcategoryData[subcategory._id].amount > 0)
    .map((subcategory, index) => ({
      id: subcategory._id,
      name: subcategory.name,
      amount: subcategoryData[subcategory._id].amount,
      fill: colorPalette[index],
    }));
  if (subcategoryData[UNCATEGORIZED_ID].amount > 0)
    chartData.push({
      id: UNCATEGORIZED_ID,
      name: uncategorizedLabel,
      amount: subcategoryData[UNCATEGORIZED_ID].amount,
      fill: colorPalette[chartData.length],
    });

  chartConfig = {
    ...chartConfig,
    ...Object.fromEntries(
      subcategories.map((subcategory) => [
        subcategory._id,
        {
          label: subcategory.name,
        },
      ])
    ),
  };

  return {
    chartConfig: chartConfig,
    chartData: chartData,
    subcategoryData: subcategoryData,
  };
}

function calculatePercentages(
  data: Record<string, { amount: number; percentage: string }>,
  totalAmount: number
) {
  const rawPercentages = Object.values(data).map(
    (data) => (data.amount / totalAmount) * 100
  );
  const roundedPercentages = rawPercentages.map((p) => Math.round(p));
  const sum = roundedPercentages.reduce((acc, val) => acc + val, 0);
  let difference = 100 - sum;

  const remainingDifferences = rawPercentages.map((value, index) => {
    return {
      index: index,
      difference: Math.abs(value - roundedPercentages[index]),
    };
  });

  remainingDifferences.sort((a, b) => b.difference - a.difference);

  for (let i = 0; difference !== 0 && i < remainingDifferences.length; i++) {
    const index = remainingDifferences[i].index;
    if (difference > 0) {
      roundedPercentages[index]++;
      difference--;
    } else if (difference < 0) {
      roundedPercentages[index]--;
      difference++;
    }
  }

  return roundedPercentages.map((p) => `${p}%`);
}
