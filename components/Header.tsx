import { useScrollPosition } from "@/hooks/useScrollPosition";
import { TextButton } from "./TextButton";
import { cn } from "@/lib/utils";
import { useRouter } from "@/i18n/navigation";
import { Pathnames } from "@/i18n/routing";

type TPreviousPage = {
  name: string;
  href: Pathnames;
};

type TRightButton = {
  name: string;
  onClick: () => void;
};

export function Header({
  children,
  previousPage,
  rightButton,
}: {
  children?: React.ReactNode;
  previousPage?: TPreviousPage;
  rightButton?: TRightButton;
}) {
  const router = useRouter();
  const { isAtTop } = useScrollPosition(4);

  const scrollStyles = isAtTop
    ? ""
    : "bg-[#333334]/55 backdrop-blur-xl border-b-[1px]";

  return (
    <header
      className={cn(
        "fixed top-0 left-0 w-full pt-safe-t text-center text-lg font-bold border-b-white/4 transition-colors duration-300 z-header",
        scrollStyles
      )}
    >
      <div className="flex justify-center items-center h-10">
        <h2 className="select-text">{children}</h2>
        {previousPage && (
          <TextButton
            onClick={() => router.push(previousPage.href)}
            className="cursor-pointer absolute left-1"
          >
            <svg
              className="size-7 fill-primary stroke-primary"
              xmlns="http://www.w3.org/2000/svg"
              strokeWidth="1.2"
              viewBox="0 0 48 48"
            >
              <path d="M32.06 8.19a1.5 1.5 0 0 1 0 2.12L18.622 23.75l13.44 13.44a1.5 1.5 0 0 1-2.122 2.12l-14.5-14.5a1.5 1.5 0 0 1 0-2.12l14.5-14.5a1.5 1.5 0 0 1 2.122 0Z" />
            </svg>
            {previousPage.name}
          </TextButton>
        )}
        {rightButton && (
          <TextButton
            onClick={rightButton.onClick}
            className="cursor-pointer absolute right-4"
          >
            {rightButton.name}
          </TextButton>
        )}
      </div>
    </header>
  );
}
