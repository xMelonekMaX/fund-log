import { connectDb } from "./lib/mongoDb";

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  try {
    await connectDb();
  } catch (error) {
    // Keep serving the offline app; authenticated actions retry the connection.
    console.error("Initial MongoDB connection failed:", error);
  }
}
