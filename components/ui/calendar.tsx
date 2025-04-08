"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("bg-gray-medium rounded-lg text-base py-5 px-4", className)}
      classNames={{
        tbody: "flex flex-col flex-1 justify-between",
        months: "flex flex-col gap-2",
        month: "flex flex-col gap-4",
        caption:
          "flex relative items-center w-full ml-1 font-semibold capitalize",
        caption_label: "select-text",
        nav: "flex items-center gap-1",
        nav_button: "bg-transparent p-0",
        nav_button_previous: "absolute right-10",
        nav_button_next: "absolute right-0",
        table: "w-full h-72 md:h-96 border-collapse flex flex-col",
        head_row: "flex justify-between uppercase pb-3 md:pb-6 tracking-wide",
        head_cell:
          "text-gray-light rounded-full w-10 font-semibold text-xs select-text",
        row: "flex w-full justify-between",
        cell: cn(
          "group relative text-center focus-within:relative transition-colors [&:not(:has([aria-selected]))]:supports-hover:hover:bg-gray-semilight [&:has([aria-selected])]:bg-[#2e4630] [&:has([aria-selected].day-today)]:bg-primary rounded-full",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-full [&:has(>.day-range-start)]:rounded-full first:[&:has([aria-selected])]:rounded-full last:[&:has([aria-selected])]:rounded-full"
            : "[&:has([aria-selected])]:rounded-full",
          `focus-within:z-bump`
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "cursor-pointer size-10 text-xl aria-selected:opacity-100"
        ),
        day_range_start:
          "day-range-start aria-selected:bg-zinc-900 aria-selected:text-zinc-50",
        day_range_end:
          "day-range-end aria-selected:bg-zinc-900 aria-selected:text-zinc-50",
        day_selected:
          "text-white [&:not([aria-selected].day-today)]:text-primary",
        day_today: "day-today text-primary",
        day_outside:
          "day-outside transition-none opacity-0 text-primary [&:not(:has([aria-selected]))]:supports-hover:group-hover:opacity-100 [&:not(:has([aria-selected]))]:supports-hover:group-hover:text-white [&:has([aria-selected])]:text-primary",
        day_disabled: "text-zinc-500 opacity-50",
        day_range_middle:
          "aria-selected:bg-zinc-100 aria-selected:text-zinc-900",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft
            className={cn(
              "cursor-pointer size-7 stroke-2 transition-colors stroke-primary active:stroke-primary-highlighted supports-hover:hover:stroke-primary-highlighted",
              className
            )}
            {...props}
          />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight
            className={cn(
              "cursor-pointer size-7 stroke-2 transition-colors stroke-primary active:stroke-primary-highlighted supports-hover:hover:stroke-primary-highlighted",
              className
            )}
            {...props}
          />
        ),
      }}
      {...props}
    />
  );
}

export { Calendar };
