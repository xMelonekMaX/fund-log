"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { Pathnames } from "@/i18n/routing";

export default function NavLink({
  href,
  exact = false,
  children,
  className,
  ...props
}: {
  href: Pathnames;
  exact?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname?.startsWith(href);
  const newClassName = isActive ? `${className} active` : className;

  return (
    <Link href={href} className={newClassName} {...props}>
      {children}
    </Link>
  );
}
