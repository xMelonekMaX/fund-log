import { Dispatch, SetStateAction, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useRef } from "react";
import { TScrollPosition } from "@/types/scrollPosition";
import { usePathname } from "@/i18n/navigation";

type TScrollableElementProps = {
  children: React.ReactNode;
  scrollPositionState: [
    TScrollPosition,
    Dispatch<SetStateAction<TScrollPosition>>
  ];
  threshold?: number;
  className?: string;
};

export function ScrollableElement({
  children,
  scrollPositionState,
  threshold = 0,
  className,
}: TScrollableElementProps) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const [, setScrollPosition] = scrollPositionState;

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const handleContainerScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;

      const isAtTop = scrollTop <= threshold;
      const isAtBottom =
        Math.ceil(scrollTop + clientHeight) >= scrollHeight - threshold;

      setScrollPosition({ isAtTop, isAtBottom });
    };

    const resizeObserver = new ResizeObserver(handleContainerScroll);
    resizeObserver.observe(container);

    handleContainerScroll();
    container.addEventListener("scroll", handleContainerScroll, {
      passive: true,
    });

    return () => {
      container.removeEventListener("scroll", handleContainerScroll);
      resizeObserver.disconnect();
    };
  }, [pathname, ref]);

  return (
    <div ref={ref} className={cn("overflow-y-auto scrollbar-none", className)}>
      {children}
    </div>
  );
}
