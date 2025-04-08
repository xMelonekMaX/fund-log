import { useScrollPosition } from "@/hooks/useScrollPosition";
import { NavButton } from "./NavButton";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export function Nav() {
  const t = useTranslations();
  const { isAtBottom } = useScrollPosition(4);

  const navScrollStyles = isAtBottom
    ? ""
    : "bg-[#333334]/55 backdrop-blur-xl border-t-[1px]";

  return (
    <nav
      className={cn(
        "text-nav-button text-center text-[0.63rem] font-bold border-t-white/4 transition-colors duration-300 fixed bottom-0 left-0 w-full pb-safe-b",
        navScrollStyles
      )}
    >
      <div className="group h-12 grid grid-cols-3">
        <NavButton href="/overview">
          <svg
            className="size-[1.7rem]"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path
              fillRule="nonzero"
              d="M15.25 13c.966 0 1.75.784 1.75 1.75v4.503a1.75 1.75 0 0 1-1.75 1.75H3.75A1.75 1.75 0 0 1 2 19.253V14.75c0-.966.783-1.75 1.75-1.75h11.5ZM21 14.896v5.354a.75.75 0 0 1-1.493.102l-.007-.102v-5.344a3.006 3.006 0 0 0 1.5-.01Zm-.75-4.804a1.908 1.908 0 1 1 0 3.816 1.908 1.908 0 0 1 0-3.816Zm-5.005-7.095c.967 0 1.75.783 1.75 1.75V9.25a1.75 1.75 0 0 1-1.75 1.75h-11.5a1.75 1.75 0 0 1-1.75-1.75V4.747a1.75 1.75 0 0 1 1.607-1.744l.143-.006h11.5ZM20.25 3a.75.75 0 0 1 .743.648L21 3.75v5.346a3.004 3.004 0 0 0-1.5-.011V3.75a.75.75 0 0 1 .75-.75Z"
            />
          </svg>
          {t("overview")}
        </NavButton>
        <NavButton href="/analytics">
          <svg
            className="size-[1.7rem]"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path
              fillRule="nonzero"
              d="M10.25 4.25A.75.75 0 0 1 11 5v8h8a.75.75 0 0 1 .743.648l.007.102c0 4.97-4.03 8.5-9 8.5a9 9 0 0 1-9-9c0-4.97 3.53-9 8.5-9Zm3-2.5a9 9 0 0 1 9 9 .75.75 0 0 1-.75.75h-8.25a.75.75 0 0 1-.75-.75V2.5a.75.75 0 0 1 .75-.75Z"
            />
          </svg>
          {t("analytics")}
        </NavButton>
        <NavButton href="/settings">
          <svg
            className="size-[1.7rem]"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path d="M8.75 13.5a3.251 3.251 0 0 1 3.163 2.5h9.337a.75.75 0 0 1 .102 1.493l-.102.007h-9.337a3.251 3.251 0 0 1-6.326 0H2.75a.75.75 0 0 1-.102-1.493L2.75 16h2.837a3.251 3.251 0 0 1 3.163-2.5Zm6.5-9.5a3.251 3.251 0 0 1 3.163 2.5h2.837a.75.75 0 0 1 .102 1.493L21.25 8h-2.837a3.251 3.251 0 0 1-6.326 0H2.75a.75.75 0 0 1-.102-1.493L2.75 6.5h9.337A3.251 3.251 0 0 1 15.25 4Z" />
          </svg>
          {t("settings")}
        </NavButton>
      </div>
    </nav>
  );
}
