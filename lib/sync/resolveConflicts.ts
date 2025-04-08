import { ICategoryLocal } from "@/models/Category";
import { IExpenseLocal } from "@/models/Expense";

export function resolveConflicts<T extends ICategoryLocal | IExpenseLocal>(
  local: T[],
  server: T[]
) {
  const toUpload: T[] = [];
  const toSave: T[] = [];
  const processed = new Set<string>();
  let latestDocumentUpdatedAt;

  for (const localDocument of local) {
    const serverDocument = server.find(
      (document) => document._id === localDocument._id
    );

    if (!serverDocument) {
      toUpload.push(localDocument);
    } else {
      const localDate = localDocument.updatedAt;
      const serverDate = serverDocument.updatedAt;

      if (localDate > serverDate) {
        toUpload.push(localDocument);
      } else {
        toSave.push(serverDocument);
      }
      processed.add(localDocument._id);
    }

    if (
      !latestDocumentUpdatedAt ||
      latestDocumentUpdatedAt < localDocument.updatedAt
    ) {
      latestDocumentUpdatedAt = localDocument.updatedAt;
    }
    if (serverDocument) {
      if (
        !latestDocumentUpdatedAt ||
        latestDocumentUpdatedAt < serverDocument.updatedAt
      ) {
        latestDocumentUpdatedAt = serverDocument.updatedAt;
      }
    }
  }

  for (const serverDocument of server) {
    if (!processed.has(serverDocument._id)) {
      toSave.push(serverDocument);
      if (
        !latestDocumentUpdatedAt ||
        latestDocumentUpdatedAt < serverDocument.updatedAt
      ) {
        latestDocumentUpdatedAt = serverDocument.updatedAt;
      }
    }
  }

  return { toUpload, toSave, latestDocumentUpdatedAt };
}
