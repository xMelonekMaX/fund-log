import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

const SELECTOR_HEIGHT = 80;

type TOptionId = string | undefined;

type TOption = {
  id: TOptionId;
  content: React.ReactNode;
};

type TSelectorProps = {
  options: TOption[];
  selectedOption: TOptionId;
  onSelect: (option: TOptionId) => void;
};

export function Selector({
  options,
  selectedOption,
  onSelect,
}: TSelectorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [animationIndex, setAnimationIndex] = useState(0);
  const [animationStep, setAnimationStep] = useState(0);

  function getItem(index: number) {
    if (!options[index]) {
      return null;
    }

    return options[index];
  }

  function handleScroll(container: Element) {
    if (!container) return;

    const containerSectionIndex = Math.floor(
      container.scrollTop / SELECTOR_HEIGHT
    );
    const item = getItem(containerSectionIndex);
    if (!item) return;

    setAnimationIndex(containerSectionIndex);
    setAnimationStep((container.scrollTop % SELECTOR_HEIGHT) / SELECTOR_HEIGHT);
    if (container.scrollTop % SELECTOR_HEIGHT === 0) {
      onSelect(item.id);
    }
  }

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    let scrolled = false;

    if (selectedOption) {
      const defaultIndex = options.findIndex(
        (option) => option.id === selectedOption
      );
      if (defaultIndex !== -1) {
        container.scrollTo({
          top: defaultIndex * SELECTOR_HEIGHT,
          behavior: "instant",
        });
        scrolled = true;
      }
    }

    if (!scrolled) {
      container.scrollTo({
        top: 0,
        behavior: "instant",
      });
    }
  }, [selectedOption, options]);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const onScroll = () => handleScroll(container);
    container.addEventListener("scroll", onScroll);

    return () => {
      container.removeEventListener("scroll", () => onScroll);
    };
  }, [options]);

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

    if (options.length <= 1) {
      container.classList.remove("cursor-grab");
      container.classList.remove("cursor-grabbing");
    }

    function handleMouseDown(event: MouseEvent) {
      if (!container) return;

      const style =
        event.target instanceof Element &&
        window.getComputedStyle(event.target);

      if (style && style.userSelect !== "text") {
        cursorStartY = event.screenY;
        containerY = container.scrollTop;
        window.getSelection()?.removeAllRanges();

        if (options.length <= 1) {
          container.classList.remove("cursor-grab");
          container.classList.remove("cursor-grabbing");
        } else {
          container.classList.add("cursor-grabbing");
          container.classList.remove("cursor-grab");
        }
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
          behavior: "instant",
        });

        const containerSectionIndex = Math.floor(
          newContainerY / SELECTOR_HEIGHT
        );

        const item = getItem(containerSectionIndex);
        if (!item) {
          return;
        }

        setAnimationStep((newContainerY % SELECTOR_HEIGHT) / SELECTOR_HEIGHT);
        setAnimationIndex(containerSectionIndex);
        if (newContainerY % SELECTOR_HEIGHT === 0) {
          onSelect(item.id);
        }
      }
    }

    function handleDragEnd() {
      if (cursorStartY && container) {
        cursorStartY = null;

        if (options.length <= 1) {
          container.classList.remove("cursor-grab");
          container.classList.remove("cursor-grabbing");
        } else {
          container.classList.remove("cursor-grabbing");
          container.classList.add("cursor-grab");
        }

        handleScroll(container);
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
  }, [options]);

  return (
    <div
      className={cn("relative", options.length > 1 && "cursor-grab")}
      data-vaul-no-drag={options.length > 1 || undefined}
    >
      <div className="absolute top-0 left-0 size-full flex flex-col justify-center pointer-events-none">
        {animationIndex !== 0 && (
          <div
            className="absolute w-full h-11 flex items-center justify-center rounded-lg bg-[#212123]"
            style={{
              transform: `translateY(${-16 + animationStep * 16}px) scale(${
                0.95 + animationStep * 0.05
              })`,
            }}
          >
            {getItem(animationIndex - 1)?.content}
          </div>
        )}
        <div
          className="absolute w-full h-11 flex items-center justify-center rounded-lg"
          style={{
            transform: `translateY(${animationStep * -16}px) scale(${
              1.0 - animationStep * 0.05
            }`,
            zIndex: animationStep < 0.5 ? "var(--z-index-bump)" : 0,
            backgroundColor: `rgb(${44 - animationStep * 11}, ${
              44 - animationStep * 11
            }, ${46 - animationStep * 11})`,
          }}
        >
          {getItem(animationIndex)?.content}
        </div>
        {animationIndex !== options.length - 2 &&
          getItem(animationIndex + 2) && ( // Prevents display on mobile where scrolling may exceed the page height
            <div
              className="absolute w-full h-11 flex items-center justify-center rounded-lg bg-[#212123]"
              style={{
                transform: `translateY(${animationStep * 16}px) scale(0.95)`,
              }}
            >
              {getItem(animationIndex + 2)?.content}
            </div>
          )}
        {animationIndex !== options.length - 1 && (
          <div
            className="absolute w-full h-11 flex items-center justify-center rounded-lg"
            style={{
              transform: `translateY(${16 - animationStep * 16}px) scale(${
                0.95 + animationStep * 0.05
              }`,
              backgroundColor: `rgb(${animationStep * 11 + 33}, ${
                animationStep * 11 + 33
              }, ${animationStep * 11 + 35})`,
            }}
          >
            {getItem(animationIndex + 1)?.content}
          </div>
        )}
      </div>
      <div
        ref={ref}
        className={`text-center scrollbar-none overflow-y-scroll snap-y snap-mandatory`}
        style={{
          height: `${SELECTOR_HEIGHT}px`,
        }}
      >
        {options.map((_, i) => (
          <div key={i} className="size-full snap-center"></div>
        ))}
      </div>
    </div>
  );
}
