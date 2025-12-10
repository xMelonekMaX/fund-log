import { Locale } from "next-intl";
import { createContext, use } from "react";

export type TSelectedLanguageContext = [
  Locale | null,
  React.Dispatch<React.SetStateAction<Locale | null>>
];

export const SelectedLanguageContext =
  createContext<TSelectedLanguageContext | null>(null);

export const useSelectedLanguageContext = () => {
  const selectedLanguageContext = use(SelectedLanguageContext);

  if (selectedLanguageContext === null) {
    throw new Error("useSelectedLanguageContext error");
  }

  return selectedLanguageContext;
};
