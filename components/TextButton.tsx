import { cn } from "@/lib/utils";

export function TextButton({
  children,
  onClick,
  className = "",
  disabled = false,
  bold,
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
  bold?: boolean;
}) {
  return (
    <button
      className={cn(
        "flex items-center gap-[2px] transition-opacity",
        bold ? "font-semibold" : "font-normal",
        disabled
          ? "text-[#aaa]"
          : "text-primary active:opacity-50 supports-hover:hover:opacity-50",
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
