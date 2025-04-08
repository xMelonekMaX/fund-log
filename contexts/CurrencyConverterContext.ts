import { ICurrencyConverterContext } from "@/hooks/useCurrencyConverter";
import { createContext, use } from "react";

export const CurrencyConverterContext =
  createContext<ICurrencyConverterContext | null>(null);

export const useCurrencyConverterContext = () => {
  const currencyConverterContext = use(CurrencyConverterContext);

  if (currencyConverterContext === null) {
    throw new Error("useCurrencyConverterContext error");
  }

  return currencyConverterContext;
};
