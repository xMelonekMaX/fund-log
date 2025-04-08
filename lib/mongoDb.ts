"use server";

import { connect, ConnectionStates } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

let isConnected: ConnectionStates;

export async function connectDb() {
  if (isConnected) return;

  try {
    const db = await connect(MONGODB_URI as string);
    isConnected = db.connections[0].readyState;

    if (isConnected == ConnectionStates.connected) {
      console.log("✅ Successfully connected to MongoDB database");
    } else {
      console.log("❌ Unexpected connection state:", isConnected);
    }
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
  }
}
