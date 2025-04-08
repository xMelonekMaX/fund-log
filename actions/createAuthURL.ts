"use server";

import { COOKIE_KEYS, AUTH_COOKIE_MAX_AGE_IN_S } from "@/lib/constants";
import { github, google } from "@/lib/oauth";
import { generateCodeVerifier, generateState } from "arctic";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function createGoogleAuthURL() {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();

  const cookieStore = await cookies();

  cookieStore.set(COOKIE_KEYS.STATE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: AUTH_COOKIE_MAX_AGE_IN_S,
    sameSite: "lax",
  });

  cookieStore.set(COOKIE_KEYS.CODE_VERIFIER, codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: AUTH_COOKIE_MAX_AGE_IN_S,
    sameSite: "lax",
  });

  let url;

  try {
    url = google.createAuthorizationURL(state, codeVerifier, ["email"]);
  } catch (error) {
    return null;
  }

  redirect(url.toString());
}

export async function createGithubAuthURL() {
  const state = generateState();

  const cookieStore = await cookies();

  cookieStore.set(COOKIE_KEYS.STATE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: AUTH_COOKIE_MAX_AGE_IN_S,
    sameSite: "lax",
  });

  let url;

  try {
    url = github.createAuthorizationURL(state, ["user:email"]);
  } catch (error) {
    return null;
  }

  redirect(url.toString());
}
