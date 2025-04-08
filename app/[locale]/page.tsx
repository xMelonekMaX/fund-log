"use client";

import { initializeDemoMode } from "@/lib/demoUtils";
import {
  createGithubAuthURL,
  createGoogleAuthURL,
} from "@/actions/createAuthURL";
import { Group } from "@/components/Group";
import { GroupItem } from "@/components/GroupItem";
import { APP_NAME } from "@/lib/constants";
import Image from "next/image";
import LOGO from "@/assets/icon-original.png";
import { InstallButton } from "@/components/InstallButton";
import { DraggableContent } from "@/components/DraggableContent";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

export default function Login() {
  const router = useRouter();
  const t = useTranslations();

  async function handleGoogleClick() {
    await createGoogleAuthURL();
  }

  async function handleGitHubClick() {
    await createGithubAuthURL();
  }

  function handleDemoModeClick() {
    initializeDemoMode();
    router.push("/overview");
  }

  return (
    <main className="min-h-screen flex flex-col justify-center px-5 py-8 mx-auto max-w-4xl">
      <DraggableContent
        dragBody={true}
        className="flex flex-col justify-center gap-12"
      >
        <div className="flex flex-col items-center">
          <Image
            src={LOGO}
            width={100}
            height={100}
            alt="logo"
            draggable="false"
            className="mx-auto rounded-3xl shadow-[0_0_32px_0_rgba(255,255,255,0.08)]"
          />
          <h1 className="text-7xl font-bold text-center mt-6 mb-3 w-fit select-text">
            {APP_NAME}
          </h1>
          <p className="text-xl font-bold text-center w-fit select-text">
            {t("description")}
          </p>
        </div>

        <Group title={t("signInMethods")}>
          <GroupItem
            onClick={handleGoogleClick}
            icon={{ id: "GOOGLE", color: "#bebebe" }}
          >
            Google
          </GroupItem>
          <GroupItem
            onClick={handleGitHubClick}
            icon={{ id: "GITHUB", color: "#bebebe" }}
          >
            GitHub
          </GroupItem>
          <GroupItem onClick={handleDemoModeClick}>
            {t("tryInDemoMode")}
          </GroupItem>
        </Group>

        <InstallButton />
      </DraggableContent>
    </main>
  );
}
