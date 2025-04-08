import { TIcon } from "@/types/icon";
import { CategoryIcon } from "./CategoryIcon";
import { cn } from "@/lib/utils";

const sizeStyles = {
  small: "pr-5 items-center",
  medium: "pr-3 items-center",
  large: "pr-3 pt-2",
};

type TGroupItemIcon = {
  id: TIcon;
  color: string;
};

type TSize = "small" | "medium" | "large";

type TGroupItemProps = {
  children: React.ReactNode;
  onClick?: () => void;
  icon?: TGroupItemIcon;
  size?: TSize;
  lighter?: boolean;
};

export function GroupItem({
  children,
  onClick,
  icon,
  size = "small",
  lighter,
}: TGroupItemProps) {
  return (
    <button
      className={cn(
        "w-full text-base text-left group flex items-center first:rounded-t-lg last:rounded-b-lg transition-colors",
        onClick &&
          "cursor-pointer active:bg-gray-semilight supports-hover:hover:bg-gray-semilight",
        size === "large" ? "pl-3" : "pl-5",
        lighter ? "bg-gray-medium" : "bg-gray-dark",
        size === "medium" ? "h-14" : size === "large" ? "h-20" : "h-11"
      )}
      onClick={onClick}
    >
      {icon && (
        <div
          className={cn(
            "flex items-center justify-between *:size-7",
            size === "large" ? "mr-3" : "mr-4"
          )}
          style={{ fill: icon.color }}
        >
          <CategoryIcon iconId={icon.id} />
        </div>
      )}
      <div
        className={cn(
          "size-full flex justify-between [box-shadow:0px_-1px_0px_0px_theme(colors.separator)] group-first:shadow-none overflow-hidden",
          onClick &&
            "group-active:shadow-none supports-hover:group-hover:shadow-none",
          sizeStyles[size]
        )}
      >
        <div className="w-full flex justify-between items-center text-nowrap overflow-hidden">
          {children}
        </div>
      </div>
    </button>
  );
}
