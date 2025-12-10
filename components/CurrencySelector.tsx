import { CURRENCY_CODES, TCurrency } from "@/types/currency";
import { useEffect, useRef } from "react";

const SELECTOR_HEIGHT = 32;

type TCurrencySelectorProps = {
  selectedCurrency: TCurrency;
  onSelect: (currency: TCurrency) => void;
};

export function CurrencySelector({
  selectedCurrency,
  onSelect,
}: TCurrencySelectorProps) {
  const ref = useRef<HTMLDivElement>(null);

  function handleScroll(container: Element) {
    if (!container) return;

    const containerSectionIndex = Math.floor(
      container.scrollTop / SELECTOR_HEIGHT
    );

    if (container.scrollTop % SELECTOR_HEIGHT === 0)
      onSelect(CURRENCY_CODES[containerSectionIndex]);
  }

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const onScroll = () => handleScroll(container);
    container.addEventListener("scroll", onScroll);

    return () => {
      container.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const container = ref.current;

    container?.scrollTo({
      top:
        CURRENCY_CODES.findIndex((currency) => currency === selectedCurrency) *
        SELECTOR_HEIGHT,
      behavior: "instant",
    });
  }, [selectedCurrency]);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    let cursorStartY: number | null = null;
    let containerY: number | null = null;

    container.addEventListener("wheel", handleDragEnd, { passive: true });
    container.addEventListener("mousedown", handleMouseDown, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("dragstart", handleDragEnd, { passive: true });
    window.addEventListener("mouseleave", handleDragEnd, { passive: true });
    window.addEventListener("mouseup", handleDragEnd, { passive: true });

    function handleMouseDown(event: MouseEvent) {
      if (!container) return;

      const style =
        event.target instanceof Element &&
        window.getComputedStyle(event.target);

      if (style && style.userSelect !== "text") {
        cursorStartY = event.screenY;
        containerY = container.scrollTop;
        window.getSelection()?.removeAllRanges();

        container.classList.add("cursor-grabbing");
        container.classList.remove("cursor-grab");
      }
    }

    function handleMouseMove(event: MouseEvent) {
      if (cursorStartY !== null && containerY !== null && container) {
        const cursorY = event.screenY;
        let newContainerY = containerY - cursorY + cursorStartY;
        if (newContainerY > container.scrollHeight - container.clientHeight)
          newContainerY = container.scrollHeight;

        container.scrollTo({
          top: newContainerY,
          behavior: "smooth",
        });
      }
    }

    function handleDragEnd() {
      if (cursorStartY !== null && container) {
        cursorStartY = null;

        container.classList.remove("cursor-grabbing");
        container.classList.add("cursor-grab");
      }
    }

    return () => {
      container.removeEventListener("wheel", handleDragEnd);
      container.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("dragstart", handleDragEnd);
      window.removeEventListener("mouseleave", handleDragEnd);
      window.removeEventListener("mouseup", handleDragEnd);
    };
  }, []);

  return (
    <div
      ref={ref}
      tabIndex={1}
      onMouseDown={() => ref.current?.focus()}
      onTouchStart={() => ref.current?.focus()}
      className="text-center text-2xl h-8 mb-1 scrollbar-none overflow-y-scroll snap-y snap-mandatory rounded-lg focus:bg-gray-medium cursor-grab"
      data-vaul-no-drag
    >
      {CURRENCY_CODES.map((currency) => (
        <div
          key={currency}
          className="size-full snap-center"
          style={{
            height: `${SELECTOR_HEIGHT}px`,
          }}
        >
          {currency}
        </div>
      ))}
    </div>
  );
}
