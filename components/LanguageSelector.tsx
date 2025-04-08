import { useSelectedLanguageContext } from "@/contexts/SelectedLanguageContext";
import { Group } from "./Group";
import { GroupItem } from "./GroupItem";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Locale, useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { LOCAL_STORAGE_KEYS } from "@/lib/constants";

export function LanguageSelector() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const [, setSelectedLanguage] = useSelectedLanguageContext();

  const handleLanguageChange = (newLanguage: Locale) => {
    if (newLanguage !== locale) {
      setSelectedLanguage(newLanguage);
      localStorage.setItem(LOCAL_STORAGE_KEYS.SELECTED_LANGUAGE, newLanguage);
      router.replace(
        // @ts-expect-error -- TypeScript will validate that only known `params`
        // are used in combination with a given `pathname`. Since the two will
        // always match for the current route, we can skip runtime checks.
        { pathname, params },
        { locale: newLanguage }
      );
    }
  };

  return (
    <Group title={t("language")}>
      <GroupItem onClick={() => handleLanguageChange("en")} size="medium">
        <div>
          <div>English</div>
          <div className="text-xs text-[#98989f] group-active:text-[#a4a4ab] supports-hover:group-hover:text-[#a4a4ab]">
            {t("english")}
          </div>
        </div>
        {locale === "en" && (
          <svg
            className="fill-primary size-6 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="-3.5 0 19 19"
          >
            <path d="M4.63 15.638a1.028 1.028 0 0 1-.79-.37L.36 11.09a1.03 1.03 0 1 1 1.58-1.316l2.535 3.043L9.958 3.32a1.029 1.029 0 0 1 1.783 1.03L5.52 15.122a1.03 1.03 0 0 1-.803.511.89.89 0 0 1-.088.004z" />
          </svg>
        )}
      </GroupItem>
      <GroupItem onClick={() => handleLanguageChange("pl")} size="medium">
        <div>
          <div>Polski</div>
          <div className="text-xs text-[#98989f] group-active:text-[#a4a4ab] supports-hover:group-hover:text-[#a4a4ab]">
            {t("polish")}
          </div>
        </div>
        {locale === "pl" && (
          <svg
            className="fill-primary size-6 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="-3.5 0 19 19"
          >
            <path d="M4.63 15.638a1.028 1.028 0 0 1-.79-.37L.36 11.09a1.03 1.03 0 1 1 1.58-1.316l2.535 3.043L9.958 3.32a1.029 1.029 0 0 1 1.783 1.03L5.52 15.122a1.03 1.03 0 0 1-.803.511.89.89 0 0 1-.088.004z" />
          </svg>
        )}
      </GroupItem>
    </Group>
  );
}
