import { connectDb } from "./lib/mongoDb";

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  await connectDb();
}
