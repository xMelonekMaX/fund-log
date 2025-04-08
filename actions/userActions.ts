"use server";

import { AUTH_COOKIE, COOKIE_KEYS, LANGUAGES } from "@/lib/constants";
import Session, { ISession } from "@/models/Session";
import User, { IUser } from "@/models/User";
import { Schema } from "mongoose";
import { cookies } from "next/headers";
import { setAuthCookie } from "./cookieActions";
import { ISessionData } from "@/types/sessionData";
import { TCurrency } from "@/types/currency";
import { TPeriod } from "@/types/period";
import { Locale } from "next-intl";

export async function getOrCreateUser(
  email: string,
  locale: Locale
): Promise<IUser> {
  try {
    const user = await User.findOne({ email });

    if (!user) {
      const newUser = new User({
        email,
        defaultCurrencyCode: LANGUAGES[locale].currency,
      });

      await newUser.save();

      return newUser;
    }

    return user;
  } catch (error) {
    console.error("❌ Error while upserting user:", error);
    throw error;
  }
}

export async function createSession(userId: string) {
  const session = new Session({
    userId,
    expiresAt: new Date(Date.now() + AUTH_COOKIE.MAX_AGE_IN_S * 1000),
  });

  await session.save();

  setAuthCookie(session.id);
}

export async function getSessionById(
  sessionId: string | Schema.Types.ObjectId
): Promise<ISession> {
  const session = await Session.findById(sessionId);
  return session;
}

export async function getUserById(
  userId: string | Schema.Types.ObjectId
): Promise<IUser> {
  const user = await User.findById(userId);
  return user;
}

export async function verifySession(): Promise<ISessionData | undefined> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(COOKIE_KEYS.AUTH_TOKEN)?.value;

    if (!sessionId) return;

    const session = await getSessionById(sessionId);
    if (!session) return;

    const user = await getUserById(session.userId);
    if (!user) return;

    const now = new Date();
    const isActive = session.expiresAt > now;
    if (!isActive)
      return {
        userId: user.id,
        email: user.email,
        isSessionValid: false,
        defaultCurrencyCode: user.defaultCurrencyCode,
        selectedPeriod: user.selectedPeriod,
        userUpdatedAt: user.updatedAt,
      };

    const timeUntilExpiry = session.expiresAt.getTime() - now.getTime();
    const shouldRefresh = timeUntilExpiry < AUTH_COOKIE.REFRESH_THRESHOLD_IN_MS;

    if (shouldRefresh) {
      const newExpiresAt = new Date(
        now.getTime() + AUTH_COOKIE.MAX_AGE_IN_S * 1000
      );

      session.expiresAt = newExpiresAt;
      await session.save();

      setAuthCookie(session.id);
    }

    return {
      userId: user.id,
      email: user.email,
      isSessionValid: true,
      defaultCurrencyCode: user.defaultCurrencyCode,
      selectedPeriod: user.selectedPeriod,
      userUpdatedAt: user.updatedAt,
    };
  } catch (error) {
    console.error("❌ Session verification error:", error);
  }
}

export async function getUserIfSessionValid(): Promise<IUser | undefined> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(COOKIE_KEYS.AUTH_TOKEN)?.value;

    if (!sessionId) return;

    const session = await getSessionById(sessionId);
    if (!session) return;

    const user = await getUserById(session.userId);
    if (!user) return;

    const now = new Date();
    const isActive = session.expiresAt > now;
    if (!isActive) return;

    return user;
  } catch (error) {
    console.error("❌ Session verification error:", error);
    return;
  }
}

export async function updateDefaultCurrency(
  defaultCurrency: TCurrency
): Promise<Date | undefined> {
  try {
    const user = await getUserIfSessionValid();
    if (!user) return;

    user.defaultCurrencyCode = defaultCurrency;
    await user.save();

    return user.updatedAt;
  } catch (error) {
    console.error("❌ Error updating default currency:", error);
  }
}

export async function updateSelectedPeriod(
  selectedPeriod: TPeriod
): Promise<Date | undefined> {
  try {
    const user = await getUserIfSessionValid();
    if (!user) return;

    user.selectedPeriod = selectedPeriod;
    await user.save();

    return user.updatedAt;
  } catch (error) {
    console.error("❌ Error updating selected period:", error);
  }
}
