import { TPeriod } from "@/types/period";
import { createContext, use } from "react";

export type TPeriodContext = {
  period: TPeriod;
  onPeriodChange: (newPeriod: TPeriod) => Promise<void>;
};

export const PeriodContext = createContext<TPeriodContext | null>(null);

export const usePeriodContext = () => {
  const periodContext = use(PeriodContext);

  if (periodContext === null) {
    throw new Error("usePeriodContext error");
  }

  return periodContext;
};
