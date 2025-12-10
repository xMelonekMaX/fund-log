import { LOCAL_STORAGE_KEYS } from "@/lib/constants";
import {
  fetchExchangeRates,
  getExchangeRatesFromLocalStorage,
  shouldUpdateExchangeRates,
} from "@/lib/utils";
import { TCurrency } from "@/types/currency";
import { TExchangeRates } from "@/types/exchangeRates";
import { useEffect, useState } from "react";

type ConvertFunction = (
  amount: number,
  from: TCurrency,
  to: TCurrency
) => number | null;

export interface ICurrencyConverterContext {
  convert: ConvertFunction;
  exchangeRates: TExchangeRates | null;
}

export function useCurrencyConverter(): ICurrencyConverterContext {
  const [exchangeRates, setExchangeRates] = useState<TExchangeRates | null>(
    null
  );

  useEffect(() => {
    const currentExchangeRates = getExchangeRatesFromLocalStorage();
    setExchangeRates(currentExchangeRates);

    if (shouldUpdateExchangeRates(currentExchangeRates)) {
      fetchExchangeRates().then((exchangeRates) => {
        if (exchangeRates) {
          setExchangeRates(exchangeRates);
          localStorage.setItem(
            LOCAL_STORAGE_KEYS.EXCHANGE_RATES,
            JSON.stringify(exchangeRates)
          );
        }
      });
    }
  }, []);

  function convert(amount: number, from: TCurrency, to: TCurrency) {
    const exchangeRate = exchangeRates?.rates[from]?.[to];
    if (!exchangeRate) return null;

    return amount * exchangeRate;
  }

  return { convert, exchangeRates };
}
