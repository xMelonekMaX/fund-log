"use client";

import { deleteAuthCookie } from "@/actions/cookieActions";
import { LOCAL_STORAGE_KEYS } from "@/lib/constants";
import { Button } from "@/components/Button";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Header } from "@/components/Header";
import { GroupItem } from "@/components/GroupItem";
import { Group } from "@/components/Group";
import { useDefaultCurrencyContext } from "@/contexts/DefaultCurrencyContext";
import { localDb } from "@/lib/indexedDb";
import { useLiveQuery } from "dexie-react-hooks";
import { exitDemoMode, isDemoMode } from "@/lib/demoUtils";
import { ArrowIcon } from "@/components/ArrowIcon";
import { DraggableContent } from "@/components/DraggableContent";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function Settings() {
  const t = useTranslations();
  const router = useRouter();
  const isOnline = useOnlineStatus();
  const [defaultCurrency] = useDefaultCurrencyContext();
  const categoriesCount = useLiveQuery(async () => {
    return await localDb.categories
      .filter((category) => !category.deletedAt)
      .count();
  });

  const email = !isDemoMode() && localStorage.getItem(LOCAL_STORAGE_KEYS.EMAIL);
  const headerText = email || t("demoMode");
  const canLogout = isOnline || isDemoMode();

  async function handleLogout() {
    localStorage.setItem(LOCAL_STORAGE_KEYS.IS_SESSION_VALID, "false");

    if (isDemoMode()) {
      exitDemoMode();
    } else {
      await deleteAuthCookie();
    }

    router.push("/");
  }

  return (
    <>
      <Header>{headerText}</Header>

      <DraggableContent
        className="flex flex-col px-5 mt-8 gap-7 mb-8 mx-auto max-w-4xl"
        dragBody={true}
      >
        <LanguageSelector />
        <Group>
          <GroupItem onClick={() => router.push("/settings/main-currency")}>
            <div>{t("mainCurrency")}</div>
            <div className="flex items-center gap-1 text-[#98989f] group-active:text-[#a4a4ab] supports-hover:group-hover:text-[#a4a4ab]">
              {defaultCurrency}
              <ArrowIcon direction="right" />
            </div>
          </GroupItem>
          <GroupItem onClick={() => router.push("/settings/categories")}>
            <div>{t("categories")}</div>
            <div className="flex items-center gap-1 text-[#98989f] group-active:text-[#a4a4ab] supports-hover:group-hover:text-[#a4a4ab]">
              {categoriesCount}
              <ArrowIcon direction="right" />
            </div>
          </GroupItem>
        </Group>
        <div>
          <Button onClick={handleLogout} important disabled={!canLogout}>
            {t("signOut")}
          </Button>
          <p className="mt-1 mx-5 text-sm text-[#8d8d93] w-fit select-text">
            {isDemoMode() ? t("demoModeMessage") : t("normalModeMessage")}
          </p>
        </div>
      </DraggableContent>
    </>
  );
}
