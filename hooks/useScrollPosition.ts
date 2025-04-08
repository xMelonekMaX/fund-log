import { usePathname } from "@/i18n/navigation";
import { TScrollPosition } from "@/types/scrollPosition";
import { useState, useEffect } from "react";

export function useScrollPosition(threshold: number = 0): TScrollPosition {
  const pathname = usePathname();
  const [scrollPosition, setScrollPosition] = useState<TScrollPosition>({
    isAtTop: true,
    isAtBottom: false,
  });

  useEffect(() => {
    const handleWindowScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;

      const isAtTop = scrollTop <= threshold;
      const isAtBottom =
        Math.ceil(scrollTop + windowHeight) >= documentHeight - threshold;

      setScrollPosition({ isAtTop, isAtBottom });
    };

    const resizeObserver = new ResizeObserver(handleWindowScroll);
    resizeObserver.observe(document.documentElement);

    handleWindowScroll();
    window.addEventListener("scroll", handleWindowScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleWindowScroll);
      resizeObserver.disconnect();
    };
  }, [threshold, pathname]);

  return scrollPosition;
}
