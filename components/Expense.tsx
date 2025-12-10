import { IExpenseLocal } from "@/models/Expense";
import { GroupItem } from "./GroupItem";
import { ICategoryLocal } from "@/models/Category";
import { formatPrice } from "@/lib/utils";
import { ArrowIcon } from "./ArrowIcon";
import { useLocale, useTranslations } from "next-intl";

type TExpenseProps = {
  expense: IExpenseLocal;
  category?: ICategoryLocal;
  groupSize: number;
  onClick: () => void;
};

export function Expense({
  expense,
  category,
  groupSize,
  onClick,
}: TExpenseProps) {
  const locale = useLocale();
  const subcategory = category?.subcategories.find(
    (subcategory) => subcategory._id === expense.subcategoryId
  );

  let description;
  if (expense.description) {
    description = expense.description;
  } else if (!subcategory?.name && groupSize > 1) {
    description = <>&nbsp;</>;
  }

  return (
    <GroupItem
      onClick={onClick}
      size="medium"
      icon={
        category && {
          id: category.icon,
          color: category.color,
        }
      }
    >
      <div className="flex flex-col w-full">
        <div className="flex justify-between">
          <div className="font-bold">{category?.name}</div>
          <div className="flex gap-1">
            {formatPrice(expense.amount, expense.currency, locale)}{" "}
            <ArrowIcon direction="up" larger />
          </div>
        </div>
        {
          <div className="flex items-center text-[15px] text-[#98989f] group-active:text-[#a4a4ab] supports-hover:group-hover:text-[#a4a4ab]">
            {subcategory?.name}
            {expense.subcategoryId && expense.description && (
              <svg
                className="size-4 stroke-1 fill-[#98989f] stroke-[#98989f] group-active:fill-[#a4a4ab] supports-hover:group-hover:fill-[#a4a4ab] group-active:stroke-[#a4a4ab] supports-hover:group-hover:stroke-[#a4a4ab]"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
              >
                <path d="M15.94 39.31a1.5 1.5 0 0 1 0-2.12l13.439-13.44-13.44-13.44a1.5 1.5 0 0 1 2.122-2.12l14.5 14.5a1.5 1.5 0 0 1 0 2.12l-14.5 14.5a1.5 1.5 0 0 1-2.122 0Z" />
              </svg>
            )}
            {description}
          </div>
        }
      </div>
    </GroupItem>
  );
}
