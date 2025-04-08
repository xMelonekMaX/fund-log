import { cn } from "@/lib/utils";

type TButtonProps = {
  children: React.ReactNode;
  onClick: () => void;
  important?: boolean;
  lighter?: boolean;
  disabled?: boolean;
};

export function Button({
  children,
  onClick,
  important,
  lighter,
  disabled,
}: TButtonProps) {
  return (
    <button
      className={cn(
        "text-base w-full min-h-11 h-11 rounded-lg transition-colors",
        important ? "text-[#ff453a]" : "text-primary",
        disabled
          ? "text-[#59595e]"
          : "cursor-pointer active:bg-gray-semilight supports-hover:hover:bg-gray-semilight",
        lighter ? "bg-gray-medium" : "bg-gray-dark"
      )}
      onClick={!disabled ? onClick : undefined}
    >
      {children}
    </button>
  );
}
