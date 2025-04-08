export const CURRENCIES = {
  USD: { code: "USD", format: "${}" },
  EUR: { code: "EUR", format: "{}€" },
  PLN: { code: "PLN", format: "{} zł" },
  GBP: { code: "GBP", format: "£{}" },
  CHF: { code: "CHF", format: "{} CHF" },
  JPY: { code: "JPY", format: "¥{}" },
  AUD: { code: "AUD", format: "A${}" },
  CAD: { code: "CAD", format: "C${}" },
  CNY: { code: "CNY", format: "¥{}" },
  SEK: { code: "SEK", format: "{} kr" },
  NOK: { code: "NOK", format: "{} kr" },
  DKK: { code: "DKK", format: "{} kr" },
} as const;

export type TCurrency = keyof typeof CURRENCIES;

export const CURRENCY_CODES = Object.values(CURRENCIES).map(
  (currency) => currency.code
);
