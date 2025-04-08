"use client";

import { Group } from "@/components/Group";
import { GroupItem } from "@/components/GroupItem";
import { Header } from "@/components/Header";
import { localDb } from "@/lib/indexedDb";
import { useLiveQuery } from "dexie-react-hooks";
import { useActiveDrawerContext } from "@/contexts/ActiveDrawerContext";
import { ArrowIcon } from "@/components/ArrowIcon";
import { DraggableContent } from "@/components/DraggableContent";
import { useTranslations } from "next-intl";

export default function Categories() {
  const t = useTranslations();
  const { setActiveDrawer } = useActiveDrawerContext();
  const categories = useLiveQuery(async () => {
    return await localDb.categories
      .filter((category) => !category.deletedAt)
      .toArray();
  });

  return (
    <>
      <Header
        previousPage={{ href: "/settings", name: t("settings") }}
        rightButton={{
          name: t("add"),
          onClick: () => setActiveDrawer({ type: "category" }),
        }}
      >
        {t("categories")}
      </Header>

      <DraggableContent dragBody={true} className="max-w-4xl mx-auto">
        <Group className="flex flex-col px-5 mt-8 gap-7 mb-8">
          {categories?.map((category, index) => (
            <GroupItem
              key={index}
              onClick={() =>
                setActiveDrawer({ type: "category", editItemId: category._id })
              }
              icon={{ id: category.icon, color: category.color }}
            >
              {category.name}
              <ArrowIcon direction="up" />
            </GroupItem>
          ))}
        </Group>
      </DraggableContent>
    </>
  );
}
