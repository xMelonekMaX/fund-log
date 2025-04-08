import withSerwistInit from "@serwist/next";
import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const revision = crypto.randomUUID();

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};
const withNextIntl = createNextIntlPlugin();
const withSerwist = withSerwistInit({
  // Note: This is only an example. If you use Pages Router,
  // use something else that works, such as "service-worker/index.ts".
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  additionalPrecacheEntries: [
    { url: "/", revision },
    { url: "/overview", revision },
    { url: "/analytics", revision },
    { url: "/settings", revision },
    { url: "/settings/categories", revision },
    { url: "/settings/main-currency", revision },

    { url: "/en", revision },
    { url: "/en/overview", revision },
    { url: "/en/analytics", revision },
    { url: "/en/settings", revision },
    { url: "/en/settings/categories", revision },
    { url: "/en/settings/main-currency", revision },

    // { url: "/pl", revision },
    // { url: "/pl/overview", revision },
    // { url: "/pl/analytics", revision },
    // { url: "/pl/settings", revision },
    // { url: "/pl/settings/categories", revision },
    // { url: "/pl/settings/main-currency", revision },

    { url: "/pl", revision },
    { url: "/pl/przegląd", revision },
    { url: "/pl/analiza", revision },
    { url: "/pl/ustawienia", revision },
    { url: "/pl/ustawienia/kategorie", revision },
    { url: "/pl/ustawienia/główna-waluta", revision },
  ],
  // exclude: [
  //   // https://github.com/shadowwalker/next-pwa/issues/424#issuecomment-1332258575
  //   ({ asset }) => {
  //     // Add here any file that fails pre-caching
  //     const excludeList = [
  //       // Default Serwist https://serwist.pages.dev/docs/next/configuring/exclude
  //       /\.map$/,
  //       /^manifest.*\.js$/,
  //       /^server\//,
  //       /^(((app-)?build-manifest|react-loadable-manifest|dynamic-css-manifest)\.json)$/,
  //     ];
  //     if (excludeList.some((r) => r.test(asset.name))) {
  //       return true;
  //     }
  //     return false;
  //   },
  // ],
});

export default withSerwist(withNextIntl(nextConfig));
