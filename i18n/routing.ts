import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ["en", "pl"],

  // Used when no locale matches
  defaultLocale: "en",

  pathnames: {
    "/": "/",
    "/overview": {
      en: "/overview",
      pl: "/przegląd",
    },
    "/analytics": {
      en: "/analytics",
      pl: "/analiza",
    },
    "/settings": {
      en: "/settings",
      pl: "/ustawienia",
    },
    "/settings/main-currency": {
      en: "/settings/main-currency",
      pl: "/ustawienia/główna-waluta",
    },
    "/settings/categories": {
      en: "/settings/categories",
      pl: "/ustawienia/kategorie",
    },
  },
});

export type Pathnames = keyof typeof routing.pathnames;
