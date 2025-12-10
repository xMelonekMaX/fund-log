import {
	fetchExpensesCount,
	fetchModifiedExpensesBatch,
	uploadExpensesBatch,
} from "@/actions/syncActions";
import { LOCAL_STORAGE_KEYS, SYNC_BATCH_SIZE } from "../constants";
import { localDb } from "../indexedDb";
import { resolveConflicts } from "./resolveConflicts";
import { IExpenseLocal } from "@/models/Expense";

export async function syncExpenses(isFullResync = false) {
	const lastSync = isFullResync
		? new Date(0)
		: new Date(
				localStorage.getItem(LOCAL_STORAGE_KEYS.EXPENSES_UPDATED_AT) || 0
		  );

	try {
		const [localChanges, serverChanges] = await Promise.all([
			getLocalChanges(lastSync),
			getServerChanges(lastSync),
		]);

		const { toUpload, toSave, latestDocumentUpdatedAt } =
			resolveConflicts<IExpenseLocal>(localChanges, serverChanges);

		if (toUpload.length > 0) {
			await uploadToServer(toUpload);
		}

		if (toSave.length > 0) {
			await saveToLocalDb(toSave);
		}

		if (latestDocumentUpdatedAt)
			localStorage.setItem(
				LOCAL_STORAGE_KEYS.EXPENSES_UPDATED_AT,
				latestDocumentUpdatedAt.toISOString()
			);

		await verifyExpenseCounts();
	} catch (error) {
		console.error("Expenses sync failed:", error);
	}
}

async function getLocalChanges(since: Date): Promise<IExpenseLocal[]> {
	return await localDb.expenses.where("updatedAt").above(since).toArray();
}

async function getServerChanges(since: Date): Promise<IExpenseLocal[]> {
	let batch = 1;
	let hasMore = true;
	const allChanges = [];

	while (hasMore) {
		const response = await fetchModifiedExpensesBatch(batch, since);

		allChanges.push(...response.data);
		hasMore = response.hasMore;
		batch++;
	}

	return allChanges;
}

async function uploadToServer(expenses: IExpenseLocal[]) {
	for (let i = 0; i < expenses.length; i += SYNC_BATCH_SIZE) {
		const batch = expenses.slice(i, i + SYNC_BATCH_SIZE);
		await uploadExpensesBatch(batch);
	}
}

async function saveToLocalDb(expenses: IExpenseLocal[]) {
	await localDb.expenses.bulkPut(expenses);
}

async function verifyExpenseCounts() {
	const localCount = await localDb.expenses.count();
	const serverCount = await fetchExpensesCount();

	if (localCount !== serverCount) {
		console.warn(
			`Mismatch expenses counts! Local: ${localCount}, Server: ${serverCount}. Running full resync...`
		);

		localStorage.setItem(LOCAL_STORAGE_KEYS.EXPENSES_UPDATED_AT, "0");
		await syncExpenses(true);
	}
}
