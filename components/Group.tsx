import { cn } from "@/lib/utils";

type TGroupProps = {
  children: React.ReactNode;
  title?: string | boolean;
  className?: string;
  largeTitle?: boolean;
};

export function Group({ children, title, className, largeTitle }: TGroupProps) {
  return (
    <div className={className}>
      {title && (
        <h3
          className={cn(
            "mb-1 select-text w-fit",
            largeTitle
              ? "text-xl font-bold"
              : "text-sm text-[#8d8d93] mx-5 uppercase"
          )}
        >
          {title}
        </h3>
      )}
      <div>{children}</div>
    </div>
  );
}
