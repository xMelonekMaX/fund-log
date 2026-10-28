import type { ICategoryLocal } from "@/models/Category";
import type { IExpenseLocal } from "@/models/Expense";
import { resolveConflicts } from "./resolveConflicts";

type SyncDocument = ICategoryLocal | IExpenseLocal;

type SyncOptions<T extends SyncDocument> = {
  readLocal: () => Promise<T[]>;
  readServer: () => Promise<T[]>;
  upload: (documents: T[]) => Promise<T[]>;
  // The snapshot lets the local transaction preserve edits made during network I/O.
  save: (documents: T[], snapshot: T[]) => Promise<void>;
  batchSize: number;
};

export async function syncCollection<T extends SyncDocument>(options: SyncOptions<T>) {
  // Reconcile all IDs, including legacy changes skipped by the old time cursor.
  // A count or the maximum client timestamp cannot prove that two replicas agree.
  const [local, server] = await Promise.all([
    options.readLocal(),
    options.readServer(),
  ]);
  const { toUpload, toSave } = resolveConflicts(local, server);

  for (let i = 0; i < toUpload.length; i += options.batchSize) {
    const batch = toUpload.slice(i, i + options.batchSize);
    const acknowledged = await options.upload(batch);
    const acknowledgedIds = new Set(acknowledged.map((document) => document._id));
    if (acknowledgedIds.size !== batch.length || batch.some((document) => !acknowledgedIds.has(document._id))) {
      throw new Error("Server did not acknowledge every document");
    }
    toSave.push(...acknowledged);
  }

  await options.save(toSave, local);
}

// One run per collection; calls arriving during a run request another pass.
export function createSyncRunner(run: () => Promise<void>) {
  let inFlight: Promise<boolean> | undefined;
  let pending = false;
  return () => {
    pending = true;
    if (!inFlight) {
      inFlight = (async () => {
        try {
          do {
            pending = false;
            await run();
          } while (pending);
          return true;
        } catch (error) {
          console.error("Synchronization failed:", error);
          return false;
        } finally {
          inFlight = undefined;
        }
      })();
    }
    return inFlight;
  };
}

// Compare the complete snapshot, so even edits in the same millisecond survive.
export function unchangedSinceSnapshot<T>(current: T | undefined, snapshot: T | undefined) {
  return JSON.stringify(current) === JSON.stringify(snapshot);
}
