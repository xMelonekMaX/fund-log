import { createSession, getOrCreateUser } from "@/actions/userActions";
import { routing } from "@/i18n/routing";
import { COOKIE_KEYS } from "@/lib/constants";
import { google } from "@/lib/oauth";
import { Locale } from "next-intl";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const codeVerifier = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");

  const cookieStore = await cookies();
  const codeVerifierCookie = cookieStore.get(COOKIE_KEYS.CODE_VERIFIER)?.value;
  const stateCookie = cookieStore.get(COOKIE_KEYS.STATE)?.value;

  const localeCookie = (cookieStore.get(COOKIE_KEYS.LOCALE)?.value ||
    routing.defaultLocale) as Locale;

  if (!codeVerifier || !codeVerifierCookie || !state || !stateCookie) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  if (state !== stateCookie) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  const tokens = await google.validateAuthorizationCode(
    codeVerifier,
    codeVerifierCookie
  );
  const accessToken = tokens.accessToken();

  const response = await fetch(
    "https://openidconnect.googleapis.com/v1/userinfo",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  const googleUser = await response.json();
  const email = googleUser.email;

  const user = await getOrCreateUser(email, localeCookie);
  await createSession(user.id);

  redirect("/overview");
}
