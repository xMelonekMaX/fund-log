import { fetchModifiedCategoriesBatch, uploadCategoriesBatch } from "@/actions/syncActions";
import type { ICategoryLocal } from "@/models/Category";
import { LOCAL_STORAGE_KEYS, SYNC_BATCH_SIZE } from "../constants";
import { localDb } from "../indexedDb";
import { createSyncRunner, syncCollection, unchangedSinceSnapshot } from "./syncCollection";
import { requireActiveSyncSession } from "./checkSession";

export const syncCategories = createSyncRunner(async () => {
  const userId = localStorage.getItem(LOCAL_STORAGE_KEYS.USER_ID);
  if (!userId) return;
  const assertAccount = () => {
    if (localStorage.getItem(LOCAL_STORAGE_KEYS.USER_ID) !== userId) {
      throw new Error("Account changed during synchronization");
    }
  };
  await requireActiveSyncSession(userId);
  assertAccount();
  await syncCollection<ICategoryLocal>({
    batchSize: SYNC_BATCH_SIZE,
    readLocal: () => localDb.categories.toArray(),
    readServer: () => getServerChanges(userId),
    upload: (documents) => {
      assertAccount();
      return uploadCategoriesBatch(documents, userId);
    },
    save: async (documents, snapshot) => {
      assertAccount();
      const original = new Map(snapshot.map((document) => [document._id, document]));
      await localDb.transaction("rw", localDb.categories, async () => {
        assertAccount();
        for (const document of documents) {
          const current = await localDb.categories.get(document._id);
          if (unchangedSinceSnapshot(current, original.get(document._id)) &&
              !unchangedSinceSnapshot(current, document)) {
            await localDb.categories.put(document);
          }
        }
      });
    },
  });
  localStorage.removeItem(LOCAL_STORAGE_KEYS.CATEGORIES_UPDATED_AT);
});

async function getServerChanges(userId: string): Promise<ICategoryLocal[]> {
  const documents: ICategoryLocal[] = [];
  let afterId: string | undefined;
  while (true) {
    const response = await fetchModifiedCategoriesBatch(1, new Date(0), afterId, userId);
    documents.push(...response.data);
    if (!response.hasMore) return documents;
    const nextId = response.data.at(-1)?._id;
    if (!nextId || nextId === afterId) throw new Error("Invalid synchronization page");
    afterId = nextId;
  }
}
