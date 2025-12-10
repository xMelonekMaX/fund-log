import { ICONS, TIcon } from "@/types/icon";
import { CategoryIcon } from "./CategoryIcon";
import { cn } from "@/lib/utils";

type TIconSelectorProps = {
  selectedIcon: TIcon;
  selectedColor: string;
  onSelect: (icon: TIcon) => void;
};

export function IconSelector({
  selectedIcon,
  selectedColor,
  onSelect,
}: TIconSelectorProps) {
  return (
    <div className="flex justify-between flex-wrap bg-gray-medium p-4 rounded-lg gap-3 fill-nav-button">
      {ICONS.map((category, index) => (
        <div
          key={index}
          onClick={() => onSelect(category)}
          className={cn(
            "*:size-16 rounded-md cursor-pointer",
            selectedIcon === category ? "fill-gray-medium" : "fill-nav-button"
          )}
          style={{
            backgroundColor:
              selectedIcon === category ? selectedColor : "inherit",
          }}
        >
          <CategoryIcon iconId={category} />
        </div>
      ))}
    </div>
  );
}
