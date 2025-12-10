"use client";

import { cn } from "@/lib/utils";
import { ReactNode, RefObject, useEffect, useRef, useState } from "react";

const DRAGGABLE_CLASS = "draggable";
const BOUNCE_FRICTION = 0.04;
const DRAG_OVERFLOW_FRICTION = 0.16;

type TDraggableContentProps = {
  children: ReactNode;
  forwardedRef?: RefObject<HTMLDivElement | null>;
  className?: string;
  dragBody?: boolean;
};

export function DraggableContent({
  children,
  forwardedRef,
  className,
  dragBody,
}: TDraggableContentProps) {
  const localRef = useRef<HTMLDivElement>(null);
  const ref = forwardedRef || localRef;

  const [isDragging, setIsDragging] = useState(false);
  const [bounceDistance, setBounceDistance] = useState({
    x: 0,
    y: 0,
    extraX: 0,
    extraY: 0,
  });

  useEffect(() => {
    let isBouncing = false;

    function bounce() {
      if (!isBouncing) return;

      setBounceDistance((previousBounceDistance) => {
        if (previousBounceDistance.x !== 0) {
          let friction = BOUNCE_FRICTION * previousBounceDistance.x;

          if (previousBounceDistance.x > 0) {
            if (friction < BOUNCE_FRICTION) friction = previousBounceDistance.x;
            previousBounceDistance.x -= friction;
          } else if (previousBounceDistance.x < 0) {
            if (-friction < BOUNCE_FRICTION)
              friction = previousBounceDistance.x;
            previousBounceDistance.x -= friction;
          }
        }

        if (previousBounceDistance.y !== 0) {
          let friction = BOUNCE_FRICTION * previousBounceDistance.y;

          if (previousBounceDistance.y > 0) {
            if (friction < BOUNCE_FRICTION) friction = previousBounceDistance.y;
            previousBounceDistance.y -= friction;
          } else if (previousBounceDistance.y < 0) {
            if (-friction < BOUNCE_FRICTION)
              friction = previousBounceDistance.y;
            previousBounceDistance.y -= friction;
          }
        }

        return { ...previousBounceDistance };
      });

      requestAnimationFrame(bounce);
    }

    if (!isDragging) {
      isBouncing = true;
      requestAnimationFrame(bounce);
    }

    return () => {
      isBouncing = false;
    };
  }, [isDragging]);

  useEffect(() => {
    const container = dragBody ? document.documentElement : ref.current;
    if (!container) return;

    let cursorStartPosition: { x: number; y: number } | null = null;
    let containerScroll: { x: number; y: number } | null = null;

    container.addEventListener("wheel", handleDragEnd, { passive: true });
    container.addEventListener("mousedown", handleMouseDown, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("dragstart", handleDragEnd, { passive: true });
    window.addEventListener("mouseleave", handleDragEnd, { passive: true });
    window.addEventListener("mouseup", handleDragEnd, { passive: true });

    function handleMouseDown(event: MouseEvent) {
      if (!container) return;

      const cancel =
        !(event.target instanceof Element) ||
        (dragBody && event.target.closest(`.${DRAGGABLE_CLASS}`) !== null);

      const style =
        event.target instanceof Element &&
        window.getComputedStyle(event.target);
      if (style && style.userSelect !== "text" && !cancel) {
        cursorStartPosition = { x: event.screenX, y: event.screenY };
        containerScroll = { x: container.scrollLeft, y: container.scrollTop };
        setIsDragging(true);
        window.getSelection()?.removeAllRanges();
      }
    }

    function handleMouseMove(event: MouseEvent) {
      if (cursorStartPosition && containerScroll && container) {
        const currentCursorPosition = { x: event.screenX, y: event.screenY };
        const newContainerScroll = {
          x:
            containerScroll.x - currentCursorPosition.x + cursorStartPosition.x,
          y:
            containerScroll.y - currentCursorPosition.y + cursorStartPosition.y,
        };

        const bounceDistanceModifier = { x: 0, y: 0 };

        if (newContainerScroll.y < 0) {
          bounceDistanceModifier.y =
            -newContainerScroll.y * DRAG_OVERFLOW_FRICTION;
        } else if (
          newContainerScroll.y >
          container.scrollHeight - container.clientHeight
        ) {
          bounceDistanceModifier.y =
            (container.scrollHeight -
              container.clientHeight -
              newContainerScroll.y) *
            DRAG_OVERFLOW_FRICTION;
        }

        if (newContainerScroll.x < 0) {
          bounceDistanceModifier.x =
            -newContainerScroll.x * DRAG_OVERFLOW_FRICTION;
        } else if (
          newContainerScroll.x >
          container.scrollWidth - container.clientWidth
        ) {
          bounceDistanceModifier.x =
            (container.scrollWidth -
              container.clientWidth -
              newContainerScroll.x) *
            DRAG_OVERFLOW_FRICTION;
        }

        container.scrollTo({
          left: newContainerScroll.x,
          top: newContainerScroll.y,
          behavior: "instant",
        });

        setBounceDistance((previousBounceDistance) => {
          return {
            x: previousBounceDistance.x,
            y: previousBounceDistance.y,
            extraX: bounceDistanceModifier.x,
            extraY: bounceDistanceModifier.y,
          };
        });
      }
    }

    function handleDragEnd() {
      if (cursorStartPosition) {
        cursorStartPosition = null;
        setBounceDistance((previousBounceDistance) => {
          return {
            x: previousBounceDistance.x + previousBounceDistance.extraX,
            y: previousBounceDistance.y + previousBounceDistance.extraY,
            extraX: 0,
            extraY: 0,
          };
        });
        setIsDragging(false);
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
  }, [dragBody]);

  return (
    <div
      ref={ref}
      style={{
        transform: `translateX(${
          bounceDistance.x + bounceDistance.extraX
        }px) translateY(${bounceDistance.y + bounceDistance.extraY}px)`,
      }}
      className={cn("overflow-auto", !dragBody && DRAGGABLE_CLASS, className)}
    >
      {children}
    </div>
  );
}
