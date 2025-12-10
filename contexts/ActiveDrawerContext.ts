import { TActiveDrawer } from "@/types/activeDrawer";
import { createContext, use } from "react";

export type TActiveDrawerContext = {
  activeDrawer: TActiveDrawer;
  setActiveDrawer: React.Dispatch<React.SetStateAction<TActiveDrawer>>;
  onAddExpenseClick: () => void;
};

export const ActiveDrawerContext = createContext<TActiveDrawerContext | null>(
  null
);

export const useActiveDrawerContext = () => {
  const activeDrawerContext = use(ActiveDrawerContext);

  if (activeDrawerContext === null) {
    throw new Error("useActiveDrawerContext error");
  }

  return activeDrawerContext;
};
