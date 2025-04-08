import { TCurrency } from "@/types/currency";
import { createContext, use } from "react";

export type TDefaultCurrencyContext = [
  TCurrency,
  React.Dispatch<React.SetStateAction<TCurrency>>
];

export const DefaultCurrencyContext =
  createContext<TDefaultCurrencyContext | null>(null);

export const useDefaultCurrencyContext = () => {
  const defaultCurrencyContext = use(DefaultCurrencyContext);

  if (defaultCurrencyContext === null) {
    throw new Error("useDefaultCurrencyContext error");
  }

  return defaultCurrencyContext;
};
