import { checkSyncSession } from "@/actions/userActions";
import type { SyncSessionResult } from "@/types/syncSession";

const checking = new Map<string, Promise<SyncSessionResult>>();

export function checkSession(userId: string): Promise<SyncSessionResult> {
  const inFlight = checking.get(userId);
  if (inFlight) return inFlight;
  const request = (async (): Promise<SyncSessionResult> => {
    try {
      return await checkSyncSession(userId);
    } catch {
      // Network failures and stale server-action IDs are not proof of expiry.
      return { status: "unavailable" };
    }
  })();
  checking.set(userId, request);
  void request.finally(() => checking.delete(userId));
  return request;
}

export async function requireActiveSyncSession(userId: string) {
  const result = await checkSession(userId);
  if (result.status !== "active") throw new Error(`Synchronization session: ${result.status}`);
}
