"use server";

import { AUTH_COOKIE, COOKIE_KEYS, LANGUAGES } from "@/lib/constants";
import Session, { ISession } from "@/models/Session";
import User, { IUser } from "@/models/User";
import { isValidObjectId, Schema } from "mongoose";
import { cookies } from "next/headers";
import { setAuthCookie } from "./cookieActions";
import { ISessionData } from "@/types/sessionData";
import { TCurrency } from "@/types/currency";
import { TPeriod } from "@/types/period";
import { Locale } from "next-intl";
import { connectDb } from "@/lib/mongoDb";
import type { SyncSessionResult } from "@/types/syncSession";

// A structured result survives Next.js production error redaction. A database
// outage must not be presented as an expired login.
export async function checkSyncSession(expectedUserId: string): Promise<SyncSessionResult> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(COOKIE_KEYS.AUTH_TOKEN)?.value;
    if (!sessionId || !isValidObjectId(sessionId)) return { status: "session-required" };

    const session = await getSessionById(sessionId);
    if (!session || session.expiresAt.getTime() <= Date.now()) {
      return { status: "session-required" };
    }
    if (session.userId.toString() !== expectedUserId) return { status: "account-mismatch" };
    if (!await getUserById(session.userId)) return { status: "session-required" };

    if (session.expiresAt.getTime() - Date.now() < AUTH_COOKIE.REFRESH_THRESHOLD_IN_MS) {
      session.expiresAt = new Date(Date.now() + AUTH_COOKIE.MAX_AGE_IN_S * 1000);
      await session.save();
      await setAuthCookie(session.id);
    }
    return { status: "active", userId: expectedUserId, expiresAt: session.expiresAt.toISOString() };
  } catch (error) {
    console.error("Session status check failed:", error);
    return { status: "unavailable" };
  }
}

export async function getOrCreateUser(
  email: string,
  locale: Locale
): Promise<IUser> {
  try {
    await connectDb();
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
  await connectDb();
  const session = new Session({
    userId,
    expiresAt: new Date(Date.now() + AUTH_COOKIE.MAX_AGE_IN_S * 1000),
  });

  await session.save();

  await setAuthCookie(session.id);
}

export async function getSessionById(
  sessionId: string | Schema.Types.ObjectId
): Promise<ISession> {
  await connectDb();
  const session = await Session.findById(sessionId);
  return session;
}

export async function getUserById(
  userId: string | Schema.Types.ObjectId
): Promise<IUser> {
  await connectDb();
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

    // Cookie renewal runs in authenticated server actions. Layout rendering
    // cannot set cookies, and a long-lived PWA may never render this layout again.

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

    if (session.expiresAt.getTime() - now.getTime() < AUTH_COOKIE.REFRESH_THRESHOLD_IN_MS) {
      session.expiresAt = new Date(now.getTime() + AUTH_COOKIE.MAX_AGE_IN_S * 1000);
      await session.save();
      await setAuthCookie(session.id);
    }

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
