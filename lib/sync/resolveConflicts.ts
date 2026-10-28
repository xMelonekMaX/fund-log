import type { ICategoryLocal } from "@/models/Category";
import type { IExpenseLocal } from "@/models/Expense";

export function resolveConflicts<T extends ICategoryLocal | IExpenseLocal>(
  local: T[],
  server: T[],
) {
  const toUpload: T[] = [];
  const toSave: T[] = [];
  const serverById = new Map(server.map((document) => [document._id, document]));

  for (const localDocument of local) {
    const serverDocument = serverById.get(localDocument._id);
    if (!serverDocument || localDocument.updatedAt > serverDocument.updatedAt) {
      toUpload.push(localDocument);
    } else {
      toSave.push(serverDocument);
    }
    serverById.delete(localDocument._id);
  }

  toSave.push(...serverById.values());
  return { toUpload, toSave };
}
