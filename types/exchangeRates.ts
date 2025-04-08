import { TCurrency } from "./currency";

export interface TExchangeRates {
  updatedAt: Date;
  rates: {
    [K in TCurrency]: {
      [K2 in TCurrency]: number;
    };
  };
}
