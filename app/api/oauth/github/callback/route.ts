import { createSession } from "@/actions/userActions";
import { getOrCreateUser } from "@/actions/userActions";
import { routing } from "@/i18n/routing";
import { COOKIE_KEYS } from "@/lib/constants";
import { github } from "@/lib/oauth";
import { getPrimaryEmail } from "@/lib/utils";
import { Locale } from "next-intl";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const codeVerifier = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");

  const cookieStore = await cookies();
  const stateCookie = cookieStore.get(COOKIE_KEYS.STATE)?.value;

  const localeCookie = (cookieStore.get(COOKIE_KEYS.LOCALE)?.value ||
    routing.defaultLocale) as Locale;

  if (!codeVerifier || !state || !stateCookie) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  if (state !== stateCookie) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  const tokens = await github.validateAuthorizationCode(codeVerifier);
  const accessToken = tokens.accessToken();
  cookieStore.get(COOKIE_KEYS.LOCALE)?.value || routing.defaultLocale;
  const response = await fetch("https://api.github.com/user/emails", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const emails = await response.json();
  const email = getPrimaryEmail(emails);

  if (!email) {
    return NextResponse.json(
      { message: "Primary email is missing" },
      { status: 400 }
    );
  }

  const user = await getOrCreateUser(email, localeCookie);
  await createSession(user.id);

  redirect("/overview");
}
