"use client";

import { DraggableContent } from "@/components/DraggableContent";
import { Group } from "@/components/Group";
import { GroupItem } from "@/components/GroupItem";
import { Header } from "@/components/Header";
import { useDefaultCurrencyContext } from "@/contexts/DefaultCurrencyContext";
import { isDemoMode } from "@/lib/demoUtils";
import { updateDefaultCurrencyAndSync } from "@/lib/utils";
import { CURRENCIES, TCurrency } from "@/types/currency";
import { useTranslations } from "next-intl";

export default function MainCurrency() {
  const t = useTranslations();
  const [defaultCurrency, setDefaultCurrency] = useDefaultCurrencyContext();

  async function handleChange(newDefaultCurrency: TCurrency) {
    setDefaultCurrency(newDefaultCurrency);

    if (!isDemoMode()) {
      await updateDefaultCurrencyAndSync(newDefaultCurrency);
    }
  }

  return (
    <>
      <Header previousPage={{ href: "/settings", name: t("settings") }}>
        {t("mainCurrency")}
      </Header>

      <DraggableContent dragBody={true} className="max-w-4xl mx-auto">
        <Group className="flex flex-col px-5 mt-8 gap-7 mb-8">
          {Object.values(CURRENCIES).map((currency) => (
            <GroupItem
              key={currency.code}
              onClick={() => handleChange(currency.code)}
            >
              {currency.code}
              {currency.code === defaultCurrency && (
                <svg
                  className="fill-primary size-6"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="-3.5 0 19 19"
                >
                  <path d="M4.63 15.638a1.028 1.028 0 0 1-.79-.37L.36 11.09a1.03 1.03 0 1 1 1.58-1.316l2.535 3.043L9.958 3.32a1.029 1.029 0 0 1 1.783 1.03L5.52 15.122a1.03 1.03 0 0 1-.803.511.89.89 0 0 1-.088.004z" />
                </svg>
              )}
            </GroupItem>
          ))}
        </Group>
      </DraggableContent>
    </>
  );
}
