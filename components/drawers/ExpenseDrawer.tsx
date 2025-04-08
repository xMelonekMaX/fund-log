import { Drawer } from "@/components/ui/drawer";
import { DrawerClose, DrawerHeader, DrawerTitle } from "../ui/drawer";
import { DrawerContent } from "../ui/drawer";
import { TextButton } from "../TextButton";
import { Calendar } from "../ui/calendar";
import { cn } from "@/lib/utils";
import { useEffect, useState, useTransition } from "react";
import { Selector } from "../Selector";
import { CategoryIcon } from "../CategoryIcon";
import { TCurrency } from "@/types/currency";
import { useDefaultCurrencyContext } from "@/contexts/DefaultCurrencyContext";
import { ScrollableElement } from "../ScrollableElement";
import { TScrollPosition } from "@/types/scrollPosition";
import { CurrencySelector } from "../CurrencySelector";
import { NumberInput } from "../NumberInput";
import { LANGUAGES } from "@/lib/constants";
import { IExpenseLocal } from "@/models/Expense";
import { localDb } from "@/lib/indexedDb";
import { v4 as uuidv4 } from "uuid";
import { isDemoMode } from "@/lib/demoUtils";
import { syncExpenses } from "@/lib/sync/expensesSyncUtils";
import { useActiveDrawerContext } from "@/contexts/ActiveDrawerContext";
import { Button } from "../Button";
import { useLocalDatabaseContext } from "@/contexts/LocalDatabaseContext";
import { getSubcategoriesByCategoryId } from "@/lib/localDatabaseUtils";
import { useLocale, useTranslations } from "next-intl";

export function ExpenseDrawer({ children }: { children: React.ReactNode }) {
  const t = useTranslations();
  const locale = useLocale();
  const { activeDrawer, setActiveDrawer } = useActiveDrawerContext();
  const [scrollPosition, setScrollPosition] = useState<TScrollPosition>({
    isAtTop: true,
    isAtBottom: false,
  });
  const scrollStyles = scrollPosition.isAtTop
    ? ""
    : "bg-drawer-header/55 backdrop-blur-xl border-b-[1px]";
  const [defaultCurrency] = useDefaultCurrencyContext();
  const { categories } = useLocalDatabaseContext();

  const [amount, setAmount] = useState<number>(0);
  const [currency, setCurrency] = useState<TCurrency>(defaultCurrency);
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [subcategory, setSubcategory] = useState<string | undefined>(undefined);
  const [note, setNote] = useState<string>("");
  const [date, setDate] = useState<Date | undefined>(new Date());

  const [forcedMonth, setForcedMonth] = useState<Date | undefined>(date);
  const [createdAt, setCreatedAt] = useState<Date | null>(null);

  useEffect(() => {
    if (activeDrawer?.type === "expense") {
      setExpenseData(activeDrawer.editItemId);
    }
  }, [activeDrawer]);

  async function setExpenseData(expenseId: string | undefined) {
    if (expenseId) {
      const expense = await localDb.expenses.get(expenseId);
      if (!expense) return;

      setAmount(expense.amount);
      setCurrency(expense.currency);
      setCategory(expense.categoryId);
      setSubcategory(expense.subcategoryId);
      setNote(expense.description);

      setDate(expense.date);
      setForcedMonth(expense.date);
      setCreatedAt(expense.createdAt);
    } else {
      setAmount(0);
      setCurrency(defaultCurrency);
      setCategory(undefined);
      setSubcategory(undefined);
      setNote("");

      const now = new Date();
      setDate(now);
      setForcedMonth(now);
      setCreatedAt(null);
    }
  }

  async function handleSaveExpense() {
    if (!category || !date || !currency) return;

    const id = activeDrawer?.editItemId || uuidv4();
    const now = new Date();

    const expense: IExpenseLocal = {
      _id: id,
      categoryId: category,
      subcategoryId: subcategory,
      amount,
      currency,
      description: note,
      date,
      createdAt: createdAt || now,
      updatedAt: now,
    };

    setActiveDrawer(null);

    await localDb.expenses.put(expense);
    if (!isDemoMode()) await syncExpenses();
  }

  async function handleDeleteExpense() {
    if (!activeDrawer?.editItemId) return;

    setActiveDrawer(null);

    await localDb.expenses.update(activeDrawer.editItemId, {
      updatedAt: new Date(),
      deletedAt: new Date(),
    });
    if (!isDemoMode()) await syncExpenses();
  }

  function canSaveExpense() {
    return amount > 0 && category && date;
  }

  return (
    <Drawer
      repositionInputs={false}
      open={activeDrawer?.type === "expense"}
      onOpenChange={(open) =>
        setActiveDrawer(open ? { type: "expense" } : null)
      }
    >
      {children}
      <DrawerContent className="text-base overflow-hidden mx-auto max-w-4xl draggable">
        <DrawerHeader
          className={cn(
            "absolute top-0 left-0 right-0 border-b-white/4 transition-colors duration-300 z-drawer-header",
            scrollStyles
          )}
        >
          <div className="flex items-center justify-center">
            <DrawerClose className="cursor-pointer absolute left-4 leading-tight transition-opacity text-primary active:opacity-50 supports-hover:hover:opacity-50">
              {/* <svg
                className="size-6 fill-primary stroke-primary"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.6"
                  d="M19 5 5 19M5 5l14 14"
                />
              </svg> */}
              {t("cancel")}
            </DrawerClose>
            <DrawerTitle className="font-semibold select-text">
              {activeDrawer?.editItemId ? t("editExpense") : t("addExpense")}
            </DrawerTitle>
            <TextButton
              onClick={handleSaveExpense}
              bold
              disabled={!canSaveExpense()}
              className={cn(
                "absolute right-4 leading-tight",
                canSaveExpense() && "cursor-pointer"
              )}
            >
              {t("save")}
            </TextButton>
          </div>
        </DrawerHeader>
        <ScrollableElement
          scrollPositionState={[scrollPosition, setScrollPosition]}
          threshold={32}
          className="px-4 pt-20 pb-safe-b-4 flex flex-col gap-7 max-h-[86vh]"
        >
          <div className="flex justify-center gap-2 items-end font-semibold">
            <NumberInput defaultValue={amount} onChange={setAmount} />
            <CurrencySelector
              selectedCurrency={currency}
              onSelect={setCurrency}
            />
          </div>

          <Selector
            selectedOption={category}
            options={[
              {
                id: undefined,
                content: (
                  <p className="text-gray-light">{t("selectCategory")}</p>
                ),
              },
              ...(categories || []).map((category) => ({
                id: category._id,
                content: (
                  <div className="flex items-center gap-3">
                    <div
                      className={`*:size-7`}
                      style={{ fill: category.color }}
                    >
                      <CategoryIcon iconId={category.icon} />
                    </div>
                    {category.name}
                  </div>
                ),
              })),
            ]}
            onSelect={setCategory}
          />

          <Selector
            selectedOption={subcategory}
            options={[
              {
                id: undefined,
                content: (
                  <p className="text-gray-light">{t("noSubcategory")}</p>
                ),
              },
              ...getSubcategoriesByCategoryId(categories, category).map(
                (subcategory) => ({
                  id: subcategory._id,
                  content: subcategory.name,
                })
              ),
            ]}
            onSelect={setSubcategory}
          />

          <div>
            <h3
              className={`mb-1 text-sm text-[#8d8d93] mx-5 uppercase w-fit select-text`}
            >
              {t("note")}
            </h3>
            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={t("optional")}
              className="w-full h-11 px-5 bg-gray-medium text-white font-normal placeholder-gray-light rounded-lg field-sizing-content select-text"
            />
          </div>

          <Calendar
            mode="single"
            selected={date}
            month={forcedMonth}
            onMonthChange={() => {
              setForcedMonth(undefined);
            }}
            onSelect={setDate}
            locale={LANGUAGES[locale].customDayNames}
          />

          {activeDrawer?.editItemId && (
            <Button onClick={handleDeleteExpense} important lighter>
              {t("deleteText")}
            </Button>
          )}
        </ScrollableElement>
      </DrawerContent>
    </Drawer>
  );
}
