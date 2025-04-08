import {
  fetchModifiedCategoriesBatch,
  uploadCategoriesBatch,
} from "@/actions/syncActions";
import { ICategoryLocal } from "@/models/Category";
import { LOCAL_STORAGE_KEYS, SYNC_BATCH_SIZE } from "../constants";
import { localDb } from "../indexedDb";
import { resolveConflicts } from "./resolveConflicts";

export async function syncCategories() {
  const lastSync = new Date(
    localStorage.getItem(LOCAL_STORAGE_KEYS.CATEGORIES_UPDATED_AT) || 0,
  );

  try {
    const [localChanges, serverChanges] = await Promise.all([
      getLocalChanges(lastSync),
      getServerChanges(lastSync),
    ]);

    const { toUpload, toSave, latestDocumentUpdatedAt } =
      resolveConflicts<ICategoryLocal>(localChanges, serverChanges);

    if (toUpload.length > 0) {
      await uploadToServer(toUpload);
    }

    if (toSave.length > 0) {
      await saveToLocalDb(toSave);
    }

    if (latestDocumentUpdatedAt)
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.CATEGORIES_UPDATED_AT,
        latestDocumentUpdatedAt.toISOString(),
      );
  } catch (error) {
    console.error("Categories sync failed:", error);
  }
}

async function getLocalChanges(since: Date): Promise<ICategoryLocal[]> {
  return await localDb.categories.where("updatedAt").above(since).toArray();
}

async function getServerChanges(since: Date): Promise<ICategoryLocal[]> {
  let batch = 1;
  let hasMore = true;
  const allChanges = [];

  while (hasMore) {
    const response = await fetchModifiedCategoriesBatch(batch, since);

    allChanges.push(...response.data);
    hasMore = response.hasMore;
    batch++;
  }

  return allChanges;
}

async function uploadToServer(categories: ICategoryLocal[]) {
  for (let i = 0; i < categories.length; i += SYNC_BATCH_SIZE) {
    const batch = categories.slice(i, i + SYNC_BATCH_SIZE);
    await uploadCategoriesBatch(batch);
  }
}

async function saveToLocalDb(categories: ICategoryLocal[]) {
  await localDb.categories.bulkPut(categories);
}
