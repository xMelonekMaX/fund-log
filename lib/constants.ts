import { enUS, pl } from "date-fns/locale";

export const APP_NAME = "FundLog";
export const TOTAL_AMOUNT_PLACEHOLDER = "---";
export const SYNC_BATCH_SIZE = 128;
export const UNCATEGORIZED_ID = "uncategorized";
export const DEFAULT_CATEGORY_COLOR = "#008236";
export const DEFAULT_CATEGORY_ICON = "CIRCLE";

export const AUTH_COOKIE_MAX_AGE_IN_S = 60 * 12;

export const AUTH_COOKIE = {
  MAX_AGE_IN_S: 60 * 60 * 24 * 180,
  REFRESH_THRESHOLD_IN_MS: 1000 * 60 * 60 * 24 * 90,
};

export const COOKIE_KEYS = {
  STATE: "state",
  CODE_VERIFIER: "code-verifier",
  AUTH_TOKEN: "auth-token",
  LOCALE: "NEXT_LOCALE",
};

export const LOCAL_STORAGE_KEYS = {
  USER_ID: "userId",
  IS_DEMO: "isDemo",
  IS_SESSION_VALID: "isSessionValid",
  EMAIL: "email",
  DEFAULT_CURRENCY_CODE: "defaultCurrencyCode",
  SELECTED_PERIOD: "selectedPeriod",
  SELECTED_LANGUAGE: "selectedLanguage",
  USER_UPDATED_AT: "userUpdatedAt",
  CATEGORIES_UPDATED_AT: "categoriesUpdatedAt",
  EXPENSES_UPDATED_AT: "expensesUpdatedAt",
  EXCHANGE_RATES: "exchangeRates",
};

export const LANGUAGES = {
  pl: {
    currency: "PLN",
    decimalSeparator: ",",
    customDayNames: pl,
    capitalizeMonths: false,
  },
  en: {
    currency: "USD",
    decimalSeparator: ".",
    customDayNames: {
      ...enUS,
      localize: {
        ...enUS.localize,
        day: (value: number) =>
          ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][value],
      },
    },
    capitalizeMonths: true,
  },
} as const;
