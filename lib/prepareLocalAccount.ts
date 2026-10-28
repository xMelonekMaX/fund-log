import type { ISessionData } from "@/types/sessionData";
import { LOCAL_STORAGE_KEYS } from "./constants";
import { localDb } from "./indexedDb";

export async function prepareLocalAccount(session: ISessionData) {
  if (!session.isSessionValid) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.IS_SESSION_VALID, "false");
    return "session-required" as const;
  }
  const owner = localStorage.getItem(LOCAL_STORAGE_KEYS.USER_ID);
  if (owner !== session.userId) {
    const [expenses, categories] = await Promise.all([
      localDb.expenses.count(), localDb.categories.count(),
    ]);
    if (expenses || categories) {
      // Never delete or adopt another account's (or unclaimed) offline data.
      localStorage.setItem(LOCAL_STORAGE_KEYS.IS_SESSION_VALID, "false");
      return "account-mismatch" as const;
    }
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_UPDATED_AT);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.CATEGORIES_UPDATED_AT);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.EXPENSES_UPDATED_AT);
  }
  localStorage.setItem(LOCAL_STORAGE_KEYS.USER_ID, session.userId);
  localStorage.setItem(LOCAL_STORAGE_KEYS.EMAIL, session.email);
  localStorage.setItem(LOCAL_STORAGE_KEYS.IS_DEMO, "false");
  localStorage.setItem(LOCAL_STORAGE_KEYS.IS_SESSION_VALID, "true");
  return "active" as const;
}
