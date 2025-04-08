"use server";

import { AUTH_COOKIE, COOKIE_KEYS } from "@/lib/constants";
import { cookies } from "next/headers";

export async function deleteAuthCookie() {
  const cookiesStore = await cookies();
  cookiesStore.delete(COOKIE_KEYS.AUTH_TOKEN);
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_KEYS.AUTH_TOKEN, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: AUTH_COOKIE.MAX_AGE_IN_S,
    sameSite: "lax",
  });
}
