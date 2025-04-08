import { useEffect, useState } from "react";
import { Button } from "./Button";
import { useTranslations } from "next-intl";

interface IBeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function InstallButton() {
  const t = useTranslations();
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () =>
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
  }, []);

  async function handleInstallClick() {
    if (deferredPrompt) {
      (deferredPrompt as IBeforeInstallPromptEvent).prompt();
      await (deferredPrompt as IBeforeInstallPromptEvent).userChoice;
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  }

  return (
    <>
      {isInstallable && (
        <Button onClick={handleInstallClick}>{t("installAsApp")}</Button>
      )}
    </>
  );
}
