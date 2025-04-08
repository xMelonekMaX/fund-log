import { Drawer } from "@/components/ui/drawer";
import { DrawerClose, DrawerHeader, DrawerTitle } from "../ui/drawer";
import { DrawerContent } from "../ui/drawer";
import { TextButton } from "../TextButton";
import { cn } from "@/lib/utils";
import { ScrollableElement } from "../ScrollableElement";
import { TScrollPosition } from "@/types/scrollPosition";
import { localDb } from "@/lib/indexedDb";
import { v4 as uuidv4 } from "uuid";
import { isDemoMode } from "@/lib/demoUtils";
import { useActiveDrawerContext } from "@/contexts/ActiveDrawerContext";
import { TIcon } from "@/types/icon";
import { ICategoryLocal } from "@/models/Category";
import { syncCategories } from "@/lib/sync/categoriesSyncUtils";
import { Group } from "../Group";
import { GroupItem } from "../GroupItem";
import { useEffect, useState } from "react";
import { IconSelector } from "../IconSelector";
import ColorPicker from "../ui/colorpicker";
import { Button } from "../Button";
import { useLocalDatabaseContext } from "@/contexts/LocalDatabaseContext";
import {
  getUnusedSubcategories,
  isCategoryUsed,
} from "@/lib/localDatabaseUtils";
import { DEFAULT_CATEGORY_COLOR, DEFAULT_CATEGORY_ICON } from "@/lib/constants";
import { useTranslations } from "next-intl";

type TSubcategories = {
  id?: string;
  previousName?: string;
  name: string;
}[];

export function CategoryDrawer({ children }: { children: React.ReactNode }) {
  const t = useTranslations();
  const { activeDrawer, setActiveDrawer } = useActiveDrawerContext();
  const { expenses } = useLocalDatabaseContext();
  const [scrollPosition, setScrollPosition] = useState<TScrollPosition>({
    isAtTop: true,
    isAtBottom: false,
  });
  const scrollStyles = scrollPosition.isAtTop
    ? ""
    : "bg-drawer-header/55 backdrop-blur-xl border-b-[1px]";

  const [name, setName] = useState("");
  const [icon, setIcon] = useState<TIcon>(DEFAULT_CATEGORY_ICON);
  const [color, setColor] = useState<string>(DEFAULT_CATEGORY_COLOR);
  const [subcategories, setSubcategories] = useState<TSubcategories>([
    { name: "" },
  ]);

  const [createdAt, setCreatedAt] = useState<Date | null>(null);
  const [isRemovable, setIsRemovable] = useState(false);

  useEffect(() => {
    if (activeDrawer?.type === "category") {
      setCategoryData(activeDrawer.editItemId);
    }
  }, [activeDrawer]);

  async function setCategoryData(categoryId: string | undefined) {
    if (categoryId) {
      const category = await localDb.categories.get(categoryId);
      if (!category) return;

      setName(category.name);
      setIcon(category.icon);
      setColor(category.color);

      const unusedSubcategories = getUnusedSubcategories(
        expenses,
        category.subcategories
      );
      const subcategories = category.subcategories.map((subcategory) => {
        if (unusedSubcategories.has(subcategory._id)) {
          return { name: subcategory.name };
        } else {
          return {
            id: subcategory._id,
            name: subcategory.name,
            previousName: subcategory.name,
          };
        }
      });
      subcategories.push({ name: "" });
      setSubcategories(subcategories);

      if (
        subcategories.filter((subcategory) => subcategory.id).length === 0 &&
        !isCategoryUsed(expenses, categoryId)
      ) {
        setIsRemovable(true);
      } else setIsRemovable(false);

      setCreatedAt(category.createdAt);
    } else {
      setName("");
      setIcon(DEFAULT_CATEGORY_ICON);
      setColor(DEFAULT_CATEGORY_COLOR);
      setSubcategories([{ name: "" }]);

      setIsRemovable(false);
      setCreatedAt(null);
    }
  }

  function canSaveCategory() {
    if (name === "") return false;

    const unnamedSubcategories = subcategories.filter(
      (subcategory) => subcategory.id && subcategory.name === ""
    );
    return unnamedSubcategories.length === 0;
  }

  async function handleSaveCategory() {
    if (!canSaveCategory()) return;

    const id = activeDrawer?.editItemId || uuidv4();
    const now = new Date();

    const category: ICategoryLocal = {
      _id: id,
      name,
      icon,
      color,
      subcategories: subcategories
        .filter((subcategory) => subcategory.name !== "")
        .map((subcategory) => ({
          _id: subcategory.id || uuidv4(),
          name: subcategory.name,
        })),
      createdAt: createdAt || now,
      updatedAt: now,
    };

    setActiveDrawer(null);

    await localDb.categories.put(category);
    if (!isDemoMode()) await syncCategories();
  }

  async function handleDeleteCategory() {
    if (!activeDrawer?.editItemId) return;

    setActiveDrawer(null);

    await localDb.categories.update(activeDrawer.editItemId, {
      updatedAt: new Date(),
      deletedAt: new Date(),
    });
    if (!isDemoMode()) await syncCategories();
  }

  function handleSubcategoryChange(index: number, newName: string) {
    setSubcategories((prevSubcategories) => {
      const newSubcategories = [...prevSubcategories];
      newSubcategories[index].name = newName;

      if (
        newName === "" &&
        !newSubcategories[index].id &&
        newSubcategories.length > 1
      ) {
        newSubcategories.splice(index, 1);
      }

      const emptySlots = newSubcategories.filter(
        (subcategory) => subcategory.name === "" && !subcategory.id
      );
      if (emptySlots.length === 0) {
        newSubcategories.push({ name: "" });
      }

      return newSubcategories;
    });
  }

  return (
    <Drawer
      repositionInputs={false}
      open={activeDrawer?.type === "category"}
      onOpenChange={(open) =>
        setActiveDrawer(open ? { type: "category" } : null)
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
              {activeDrawer?.editItemId ? t("editCategory") : t("addCategory")}
            </DrawerTitle>
            <TextButton
              onClick={handleSaveCategory}
              bold
              disabled={!canSaveCategory()}
              className={cn(
                "absolute right-4 leading-tight",
                canSaveCategory() && "cursor-pointer"
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
          <Group title={t("categoryName")}>
            <GroupItem icon={{ id: icon, color: color }} lighter>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={t("required")}
                className="size-full font-normal placeholder-gray-light field-sizing-content select-text"
              />
            </GroupItem>
          </Group>

          <Group title={t("subcategories")}>
            {subcategories.map((subcategory, index) => (
              <GroupItem key={index} lighter>
                <input
                  value={subcategory.name}
                  onChange={(event) =>
                    handleSubcategoryChange(index, event.target.value)
                  }
                  placeholder={
                    subcategory.id ? subcategory.previousName : t("optional")
                  }
                  className="size-full font-normal placeholder-gray-light select-text"
                />
              </GroupItem>
            ))}
          </Group>

          <ColorPicker pickedColor={color} onPick={setColor} />

          <IconSelector
            selectedIcon={icon}
            selectedColor={color}
            onSelect={setIcon}
          />

          {isRemovable && (
            <Button onClick={handleDeleteCategory} important lighter>
              {t("deleteText")}
            </Button>
          )}
        </ScrollableElement>
      </DrawerContent>
    </Drawer>
  );
}
