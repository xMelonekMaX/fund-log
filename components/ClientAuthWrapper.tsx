"use client";

import { DefaultCurrencyContext } from "@/contexts/DefaultCurrencyContext";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { LANGUAGES, LOCAL_STORAGE_KEYS } from "@/lib/constants";
import { syncCategories } from "@/lib/sync/categoriesSyncUtils";
import { syncExpenses } from "@/lib/sync/expensesSyncUtils";
import {
  clearIndexedDb,
  getBooleanFromLocalStorage,
  getUserSyncState,
  setLastUserSyncTime,
  updateDefaultCurrencyAndSync,
  updateSelectedPeriodAndSync,
} from "@/lib/utils";
import { TCurrency } from "@/types/currency";
import { ISessionData } from "@/types/sessionData";
import { useEffect, useState } from "react";
import { TPeriod } from "@/types/period";
import { PeriodContext } from "@/contexts/PeriodContext";
import { isDemoMode } from "@/lib/demoUtils";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Locale, useLocale } from "next-intl";
import { SelectedLanguageContext } from "@/contexts/SelectedLanguageContext";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useParams } from "next/navigation";

type TSessionDataProviderProps = {
  children: React.ReactNode;
  sessionData?: ISessionData;
};

export function ClientAuthWrapper({
  children,
  sessionData,
}: TSessionDataProviderProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const isOnline = useOnlineStatus();
  const [isLoading, setIsLoading] = useState(true);
  const [defaultCurrency, setDefaultCurrency] = useLocalStorage<TCurrency>(
    LOCAL_STORAGE_KEYS.DEFAULT_CURRENCY_CODE,
    LANGUAGES[locale].currency
  );
  const [period, setPeriod] = useState<TPeriod>("month");
  const [selectedLanguage, setSelectedLanguage] = useState<Locale | null>(null);

  async function handlePeriodChange(newPeriod: TPeriod) {
    const previousPeriod = localStorage.getItem(
      LOCAL_STORAGE_KEYS.SELECTED_PERIOD
    );

    localStorage.setItem(LOCAL_STORAGE_KEYS.SELECTED_PERIOD, newPeriod);

    setPeriod(newPeriod);

    if (!isDemoMode() && newPeriod !== previousPeriod) {
      await updateSelectedPeriodAndSync(newPeriod);
    }
  }

  //Read and write language from localStorage because NEXT_LOCALE cookie doesn't work offline
  useEffect(() => {
    if (isOnline !== null && selectedLanguage === null) {
      const offlineLanguage = localStorage.getItem(
        LOCAL_STORAGE_KEYS.SELECTED_LANGUAGE
      );

      if (offlineLanguage === null || isOnline) {
        setSelectedLanguage(locale);
        localStorage.setItem(LOCAL_STORAGE_KEYS.SELECTED_LANGUAGE, locale);
      } else if (locale !== offlineLanguage && !isOnline) {
        router.replace(
          // @ts-expect-error -- TypeScript will validate that only known `params`
          // are used in combination with a given `pathname`. Since the two will
          // always match for the current route, we can skip runtime checks.
          { pathname, params },
          { locale: offlineLanguage }
        );
      }
    }
  }, [isOnline, selectedLanguage]);

  useEffect(() => {
    const savedPeriod = localStorage.getItem(
      LOCAL_STORAGE_KEYS.SELECTED_PERIOD
    ) as TPeriod | null;

    if (savedPeriod) {
      setPeriod(savedPeriod);
    }
  }, []);

  useEffect(() => {
    async function syncData(sessionData: ISessionData) {
      const userId = localStorage.getItem(LOCAL_STORAGE_KEYS.USER_ID);
      if (sessionData.userId !== userId) {
        localStorage.clear();
        await clearIndexedDb();
      }

      localStorage.setItem(
        LOCAL_STORAGE_KEYS.IS_SESSION_VALID,
        sessionData.isSessionValid.toString()
      );

      if (!sessionData.isSessionValid) return;

      localStorage.setItem(LOCAL_STORAGE_KEYS.USER_ID, sessionData.userId);
      localStorage.setItem(LOCAL_STORAGE_KEYS.EMAIL, sessionData.email);

      switch (getUserSyncState(sessionData.userUpdatedAt)) {
        case "CLIENT_OUTDATED":
          if (sessionData.defaultCurrencyCode)
            setDefaultCurrency(sessionData.defaultCurrencyCode);

          if (sessionData.selectedPeriod) setPeriod(sessionData.selectedPeriod);

          setLastUserSyncTime(sessionData.userUpdatedAt);
          break;
        case "SERVER_OUTDATED":
          if (defaultCurrency)
            await updateDefaultCurrencyAndSync(defaultCurrency);

          if (period) await updateSelectedPeriodAndSync(period);

          break;
      }

      await syncCategories();
      await syncExpenses();
    }

    if (sessionData) {
      syncData(sessionData);
    }
  }, []);

  useEffect(() => {
    const isSessionValid = getBooleanFromLocalStorage(
      LOCAL_STORAGE_KEYS.IS_SESSION_VALID
    );
    const loggedIn = isSessionValid || isDemoMode();

    if (loggedIn && pathname === "/") {
      router.push("/overview");
    } else if (!loggedIn && pathname !== "/") {
      router.push("/");
    } else {
      setIsLoading(false);
    }
  }, [pathname, router]);

  if (isLoading) {
    return;
  }

  return (
    <SelectedLanguageContext value={[selectedLanguage, setSelectedLanguage]}>
      <DefaultCurrencyContext value={[defaultCurrency, setDefaultCurrency]}>
        <PeriodContext value={{ period, onPeriodChange: handlePeriodChange }}>
          {children}
        </PeriodContext>
      </DefaultCurrencyContext>
    </SelectedLanguageContext>
  );
}
