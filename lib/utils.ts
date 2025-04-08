import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { COOKIE_KEYS, LANGUAGES, LOCAL_STORAGE_KEYS } from "./constants";
import { isDemoMode } from "./demoUtils";
import { CURRENCIES, CURRENCY_CODES, TCurrency } from "@/types/currency";
import {
  updateDefaultCurrency,
  updateSelectedPeriod,
} from "@/actions/userActions";
import { localDb } from "./indexedDb";
import { TPeriod } from "@/types/period";
import { TExchangeRates } from "@/types/exchangeRates";
import { IExpenseLocal } from "@/models/Expense";
import { TDataRange, TDataRanges } from "@/types/dataRange";
import { Locale, useTranslations } from "next-intl";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type TEmails = {
  email: string;
  primary: boolean;
}[];

export function getPrimaryEmail(emails: TEmails): string | undefined {
  const email = emails.find((email) => email.primary === true);
  return email?.email;
}

/*const emails = [
  {
    email: 'example@gmail.com',
    primary: true,
    verified: true,
    visibility: 'private'
  },
  {
    email: '66464733+example@users.noreply.github.com',
    primary: false,
    verified: true,
    visibility: null
  }
];*/

export async function clearIndexedDb() {
  await localDb.expenses.clear();
  await localDb.categories.clear();
}

export function setLastUserSyncTime(serverSyncTime: Date) {
  localStorage.setItem(
    LOCAL_STORAGE_KEYS.USER_UPDATED_AT,
    serverSyncTime.toISOString()
  );
}

type TUserSyncState = "SERVER_OUTDATED" | "CLIENT_OUTDATED" | "SYNCED";
export function getUserSyncState(serverSyncTime: Date): TUserSyncState {
  const localSyncTime = getDateFromLocalStorage(
    LOCAL_STORAGE_KEYS.USER_UPDATED_AT
  );

  if (localSyncTime == null || localSyncTime < serverSyncTime) {
    return "CLIENT_OUTDATED";
  } else if (localSyncTime > serverSyncTime) {
    return "SERVER_OUTDATED";
  } else {
    return "SYNCED";
  }
}

export function isUserSyncRequired(serverSyncTime: Date): boolean {
  const localSyncTime = getDateFromLocalStorage(
    LOCAL_STORAGE_KEYS.USER_UPDATED_AT
  );

  return localSyncTime == null || localSyncTime < serverSyncTime;
}

export function getDateFromLocalStorage(key: string) {
  const rawDate = localStorage.getItem(key);
  return rawDate === null ? null : new Date(rawDate);
}

export function getBooleanFromLocalStorage(key: string) {
  const rawBoolean = localStorage.getItem(key);

  if (rawBoolean === "true") return true;
  else if (rawBoolean === "false") return false;
  else return null;
}

export async function updateDefaultCurrencyAndSync(defaultCurrency: TCurrency) {
  let userUpdatedAt;
  try {
    userUpdatedAt = await updateDefaultCurrency(defaultCurrency);
  } catch (error) {
    console.error("❌ Error updating default currency:", error);
  }

  if (!userUpdatedAt) userUpdatedAt = new Date();
  setLastUserSyncTime(userUpdatedAt);
}

export async function updateSelectedPeriodAndSync(selectedPeriod: TPeriod) {
  let userUpdatedAt;
  try {
    userUpdatedAt = await updateSelectedPeriod(selectedPeriod);
  } catch (error) {
    console.error("❌ Error updating selected period:", error);
  }

  if (!userUpdatedAt) userUpdatedAt = new Date();
  setLastUserSyncTime(userUpdatedAt);
}

export function formatNumber(number: number, locale: Locale) {
  return number.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  });
}

export function formatPrice(
  price: number,
  currencyCode: TCurrency,
  locale: Locale
) {
  const formattedPrice = internationalizeNumber(price.toFixed(2), locale);
  return CURRENCIES[currencyCode].format.replace("{}", formattedPrice);
}

function getMonthName(date: Date, locale: Locale, fullName: boolean = false) {
  return date.toLocaleString(locale, {
    month: fullName ? "long" : "short",
  });
}

export function shouldCapitalizeMonths(
  selectedPeriod: TPeriod,
  locale: Locale
) {
  if (selectedPeriod === "month" || selectedPeriod === "halfYear") {
    return true;
  }

  const capitalizeMonths = LANGUAGES[locale].capitalizeMonths;
  if (!capitalizeMonths) return false;

  return true;
}

export function formatDate(
  date: string,
  locale: Locale,
  t: ReturnType<typeof useTranslations>
): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  const differenceInDays = Math.round(
    (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  switch (differenceInDays) {
    case -1:
      return t("yesterday");
    case 0:
      return t("today");
    case 1:
      return t("tomorrow");
    default:
      return `${targetDate.getDate()} ${getMonthName(
        targetDate,
        locale
      )} ${targetDate.getFullYear()}`;
  }
}

export function formatDateRange(
  dateRange: TDataRange | null,
  locale: Locale,
  shortFormat = false
) {
  if (!dateRange) return;

  const from = dateRange.from;
  const to = dateRange.to;

  const fromMonth = getMonthName(from, locale);
  const toMonth = getMonthName(to, locale);
  const year = from.getFullYear();

  const isSameDay =
    from.getDate() === to.getDate() &&
    from.getMonth() === to.getMonth() &&
    from.getFullYear() === to.getFullYear();

  const isSameMonth =
    from.getMonth() === to.getMonth() &&
    from.getFullYear() === to.getFullYear();

  const isHalfYear = Math.abs(to.getMonth() - from.getMonth()) === 5;

  const isFullYear =
    from.getMonth() === 0 &&
    to.getMonth() === 11 &&
    from.getDate() === 1 &&
    to.getDate() === 31;

  if (isSameDay) {
    // 1 Jan 2025
    return shortFormat
      ? `${from.getDate()} ${fromMonth}`
      : `${from.getDate()} ${fromMonth} ${year}`;
  } else if (isSameMonth && to.getDate() - from.getDate() === 6) {
    // 1-7 Jan 2025
    return shortFormat
      ? `${from.getDate()}-${to.getDate()} ${fromMonth}`
      : `${from.getDate()}-${to.getDate()} ${fromMonth} ${year}`;
  } else if (isSameMonth) {
    // January 2025
    return shortFormat
      ? `${fromMonth} ${year}`
      : `${getMonthName(from, locale, true)} ${year}`;
  } else if (isHalfYear) {
    // Jan-Jun 2025
    return `${fromMonth}-${toMonth} ${year}`;
  } else if (isFullYear) {
    // 2025
    return `${year}`;
  }

  // 1 Jan - 21 Feb 2025
  return shortFormat
    ? `${from.getDate()}-${to.getDate()} ${fromMonth}`
    : `${from.getDate()} ${fromMonth} - ${to.getDate()} ${toMonth} ${year}`;
}

export function getDateRangeFromPeriod(period: TPeriod) {
  const now = new Date();
  const from = new Date(now);
  const to = new Date(now);

  switch (period) {
    case "week":
      from.setDate(now.getDate() - now.getDay());
      to.setDate(from.getDate() + 6);
      break;
    case "month":
      from.setDate(1);
      to.setMonth(from.getMonth() + 1, 0);
      break;
    case "halfYear":
      const currentMonth = now.getMonth();
      from.setMonth(currentMonth - (currentMonth % 6), 1);
      to.setMonth(from.getMonth() + 6, 0);
      break;
    case "year":
      from.setMonth(0, 1);
      to.setMonth(11, 31);
      break;
  }

  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);

  return { period, from, to };
}

export function createDateRanges(
  period: TPeriod,
  from: Date,
  to: Date
): { dateRanges: TDataRanges; defaultIndex: number | null } {
  const dateRanges: TDataRanges = [];
  let currentDate = from;

  let todayMatchIndex: number | null = null;
  let latestPastRangeIndex: number | null = null;
  const today = new Date();

  while (currentDate <= to) {
    let rangeStart: Date;
    let rangeEnd: Date;

    switch (period) {
      case "day":
        rangeStart = new Date(currentDate);
        rangeStart.setHours(0, 0, 0, 0);
        rangeEnd = new Date(currentDate);
        rangeEnd.setHours(23, 59, 59, 999);
        currentDate = new Date(rangeEnd.getTime() + 1);
        break;
      case "week":
        rangeStart = new Date(currentDate);
        rangeStart.setDate(rangeStart.getDate() - rangeStart.getDay());
        rangeStart.setHours(0, 0, 0, 0);
        rangeEnd = new Date(rangeStart);
        rangeEnd.setDate(rangeEnd.getDate() + 6);
        rangeEnd.setHours(23, 59, 59, 999);
        currentDate = new Date(rangeEnd.getTime() + 1);
        break;
      case "month":
        rangeStart = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth()
        );
        const nextMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1
        );
        rangeEnd = new Date(nextMonth.getTime() - 1);
        currentDate = nextMonth;
        break;
      case "halfYear":
        if (currentDate.getMonth() > 5) {
          rangeStart = new Date(currentDate.getFullYear(), 6);
          rangeEnd = new Date(
            currentDate.getFullYear(),
            11,
            31,
            23,
            59,
            59,
            999
          );
          currentDate = new Date(currentDate.getFullYear() + 1, 0);
        } else {
          rangeStart = new Date(currentDate.getFullYear(), 0);
          rangeEnd = new Date(
            currentDate.getFullYear(),
            5,
            30,
            23,
            59,
            59,
            999
          );
          currentDate = new Date(currentDate.getFullYear(), 6);
        }
        break;
      case "year":
        rangeStart = new Date(currentDate.getFullYear(), 0);
        rangeEnd = new Date(currentDate.getFullYear(), 11, 31, 23, 59, 59, 999);
        currentDate = new Date(currentDate.getFullYear() + 1, 0);
        break;
    }

    const index = dateRanges.length;
    dateRanges.push({ from: rangeStart, to: rangeEnd });

    if (today >= rangeStart && today <= rangeEnd) {
      todayMatchIndex = index;
    } else if (rangeStart <= today) {
      latestPastRangeIndex = index;
    }
  }

  const defaultIndex = todayMatchIndex ?? latestPastRangeIndex ?? 0;

  return { dateRanges, defaultIndex };
}

export function internationalizeNumber(number: string, locale: Locale) {
  const decimalSeparator = LANGUAGES[locale].decimalSeparator;
  return number.replace(".", decimalSeparator).replace(",", decimalSeparator);
}

export function getExchangeRatesFromLocalStorage() {
  const rawExchangeRates = localStorage.getItem(
    LOCAL_STORAGE_KEYS.EXCHANGE_RATES
  );
  if (!rawExchangeRates) return null;

  const exchangeRates: TExchangeRates = JSON.parse(rawExchangeRates);
  return exchangeRates;
}

export function shouldUpdateExchangeRates(
  exchangeRates: TExchangeRates | null
) {
  if (!exchangeRates) return true;

  const now = new Date();
  const lastUpdate = new Date(exchangeRates.updatedAt);
  if (now.getTime() - lastUpdate.getTime() >= 24 * 60 * 60 * 1000) {
    return true;
  }

  return false;
}

export async function fetchExchangeRates(): Promise<TExchangeRates | null> {
  try {
    const requests = CURRENCY_CODES.map((currency) =>
      fetch(`https://open.er-api.com/v6/latest/${currency}`).then(
        (response) => {
          if (!response.ok || response.status === 429)
            throw new Error(`Failed to fetch exchange rates for ${currency}`);
          return response.json();
        }
      )
    );

    const responses = await Promise.all(requests);

    const rates = Object.fromEntries(
      CURRENCY_CODES.map((baseCurrency, index) => [
        baseCurrency,
        Object.fromEntries(
          CURRENCY_CODES.map((targetCurrency) => [
            targetCurrency,
            responses[index].rates[targetCurrency] || 1,
          ])
        ),
      ])
    ) as TExchangeRates["rates"];

    return {
      updatedAt: new Date(),
      rates,
    };
  } catch (error) {
    return null;
  }
}

export function groupExpensesByDay(
  expenses: IExpenseLocal[] | undefined
): Record<string, IExpenseLocal[]> {
  if (expenses === undefined) return {};

  return expenses
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .reduce((acc, expense) => {
      expense.date.setHours(0, 0, 0, 0);
      const dateKey = expense.date.toISOString();

      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }

      acc[dateKey].push(expense);
      return acc;
    }, {} as Record<string, IExpenseLocal[]>);
}

export function generateColorPalette(
  color: string,
  totalColors: number
): string[] {
  function hexToRgb(hex: string): TRGB {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  }

  function rgbToHex({ r, g, b }: TRGB): string {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b)
      .toString(16)
      .slice(1)
      .toUpperCase()}`;
  }

  function adjustBrightness(
    r: number,
    g: number,
    b: number,
    factor: number
  ): TRGB {
    return {
      r: Math.min(255, Math.max(0, Math.round(r * factor))),
      g: Math.min(255, Math.max(0, Math.round(g * factor))),
      b: Math.min(255, Math.max(0, Math.round(b * factor))),
    };
  }

  function getLuminance(r: number, g: number, b: number): number {
    return 0.299 * r + 0.587 * g + 0.114 * b;
  }

  if (totalColors <= 1) return [color];

  const baseColor = hexToRgb(color);
  const palette: { hex: string; luminance: number }[] = [];

  const isVeryLight =
    baseColor.r > 195 && baseColor.g > 195 && baseColor.b > 195;
  const isVeryDark = baseColor.r < 60 && baseColor.g < 60 && baseColor.b < 60;

  for (let i = 0; i < totalColors; i++) {
    let newColor: TRGB;
    let factor: number;

    if (isVeryLight) {
      factor = Math.max(0.05, 1 - (i / (totalColors - 1)) * 0.6);
      newColor = adjustBrightness(
        baseColor.r,
        baseColor.g,
        baseColor.b,
        factor
      );
    } else if (isVeryDark) {
      const step = Math.round((i / (totalColors - 1)) * 200);
      newColor = {
        r: Math.min(255, baseColor.r + step),
        g: Math.min(255, baseColor.g + step),
        b: Math.min(255, baseColor.b + step),
      };
    } else {
      factor = Math.max(0.05, 0.3 + (i / (totalColors - 1)) * 1.5);
      newColor = adjustBrightness(
        baseColor.r,
        baseColor.g,
        baseColor.b,
        factor
      );
    }

    const hexColor = rgbToHex({ r: newColor.r, g: newColor.g, b: newColor.b });
    const luminance = getLuminance(newColor.r, newColor.g, newColor.b);

    palette.push({ hex: hexColor, luminance });
  }

  palette.sort((a, b) => a.luminance - b.luminance);

  return palette.map((color) => color.hex);
}
