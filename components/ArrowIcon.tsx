import { cn } from "@/lib/utils";

const ARROWS = {
  up: (
    <path d="M39.634 31.884a1.25 1.25 0 0 1-1.768 0L24 18.018 10.134 31.884a1.25 1.25 0 0 1-1.768-1.768l14.75-14.75a1.25 1.25 0 0 1 1.768 0l14.75 14.75a1.25 1.25 0 0 1 0 1.768Z" />
  ),
  right: (
    <path d="M15.94 39.31a1.5 1.5 0 0 1 0-2.12l13.439-13.44-13.44-13.44a1.5 1.5 0 0 1 2.122-2.12l14.5 14.5a1.5 1.5 0 0 1 0 2.12l-14.5 14.5a1.5 1.5 0 0 1-2.122 0Z" />
  ),
};

type TArrowIconDirection = "up" | "right";

type TArrowIconProps = {
  direction: TArrowIconDirection;
  larger?: boolean;
};

export function ArrowIcon({ direction, larger }: TArrowIconProps) {
  return (
    <svg
      className={cn(
        "fill-[#59595e] stroke-[#59595e] group-active:fill-[#6f6f73] supports-hover:group-hover:fill-[#6f6f73] group-active:stroke-[#6f6f73] supports-hover:group-hover:stroke-[#6f6f73]",
        larger ? "size-[22px] stroke-1 mt-px" : "size-4 stroke-[2.64]"
      )}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
    >
      {ARROWS[direction]}
    </svg>
  );
}
