import { Pathnames } from "@/i18n/routing";
import NavLink from "./NavLink";

export type TNavButtonProps = {
  children: React.ReactNode;
  href: Pathnames;
};

export function NavButton({ children, href }: TNavButtonProps) {
  return (
    <NavLink
      href={href}
      className="cursor-pointer h-12 fill-nav-button [&.active]:fill-primary [&.active]:text-primary opacity-60 [&.active]:opacity-100 active:opacity-75 supports-hover:hover:opacity-75"
    >
      <div className="h-full flex flex-col justify-center items-center">
        {children}
      </div>
    </NavLink>
  );
}
