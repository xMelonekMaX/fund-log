import { TPeriod } from "@/types/period";
import { TCurrency } from "./currency";

export interface ISessionData {
  userId: string;
  email: string;
  isSessionValid: boolean;
  defaultCurrencyCode: TCurrency;
  selectedPeriod?: TPeriod;
  userUpdatedAt: Date;
}
