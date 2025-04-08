import type { Metadata, Viewport } from "next";
import "../globals.css";
import { verifySession } from "@/actions/userActions";
import { ClientAuthWrapper } from "@/components/ClientAuthWrapper";
import { APP_NAME } from "@/lib/constants";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

const APP_TITLE_TEMPLATE = `%s - ${APP_NAME}`;

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_NAME,
    template: APP_TITLE_TEMPLATE,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#000000",
  viewportFit: "cover",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const t = await getTranslations();
  const sessionData = await verifySession();

  return (
    <html lang={locale}>
      <head>
        <title>{APP_NAME}</title>
        <meta name="description" content={t("description")} />
        <link rel="apple-touch-icon" href="/icons/touch-icon-iphone.png" />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/touch-icon-ipad.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/touch-icon-iphone-retina.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="167x167"
          href="/touch-icon-ipad-retina.png"
        />
      </head>
      <body className="antialiased">
        <NextIntlClientProvider>
          <ClientAuthWrapper sessionData={sessionData}>
            {children}
          </ClientAuthWrapper>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
