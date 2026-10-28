import { fetchModifiedExpensesBatch, uploadExpensesBatch } from "@/actions/syncActions";
import type { IExpenseLocal } from "@/models/Expense";
import { LOCAL_STORAGE_KEYS, SYNC_BATCH_SIZE } from "../constants";
import { localDb } from "../indexedDb";
import { createSyncRunner, syncCollection, unchangedSinceSnapshot } from "./syncCollection";
import { requireActiveSyncSession } from "./checkSession";

export const syncExpenses = createSyncRunner(async () => {
  const userId = localStorage.getItem(LOCAL_STORAGE_KEYS.USER_ID);
  if (!userId) return;
  const assertAccount = () => {
    if (localStorage.getItem(LOCAL_STORAGE_KEYS.USER_ID) !== userId) {
      throw new Error("Account changed during synchronization");
    }
  };
  await requireActiveSyncSession(userId);
  assertAccount();
  await syncCollection<IExpenseLocal>({
    batchSize: SYNC_BATCH_SIZE,
    readLocal: () => localDb.expenses.toArray(),
    readServer: () => getServerChanges(userId),
    upload: (documents) => {
      assertAccount();
      return uploadExpensesBatch(documents, userId);
    },
    save: async (documents, snapshot) => {
      assertAccount();
      const original = new Map(snapshot.map((document) => [document._id, document]));
      await localDb.transaction("rw", localDb.expenses, async () => {
        assertAccount();
        for (const document of documents) {
          const current = await localDb.expenses.get(document._id);
          if (unchangedSinceSnapshot(current, original.get(document._id)) &&
              !unchangedSinceSnapshot(current, document)) {
            await localDb.expenses.put(document);
          }
        }
      });
    },
  });
  localStorage.removeItem(LOCAL_STORAGE_KEYS.EXPENSES_UPDATED_AT);
});

async function getServerChanges(userId: string): Promise<IExpenseLocal[]> {
  const documents: IExpenseLocal[] = [];
  let afterId: string | undefined;
  while (true) {
    const response = await fetchModifiedExpensesBatch(1, new Date(0), afterId, userId);
    documents.push(...response.data);
    if (!response.hasMore) return documents;
    const nextId = response.data.at(-1)?._id;
    if (!nextId || nextId === afterId) throw new Error("Invalid synchronization page");
    afterId = nextId;
  }
}
