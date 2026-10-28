export type SyncSessionResult =
  | { status: "active"; userId: string; expiresAt: string }
  | { status: "session-required" }
  | { status: "account-mismatch" }
  | { status: "unavailable" };
