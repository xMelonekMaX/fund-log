"use server";

import mongoose, { connect, ConnectionStates } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
const useTls = process.env.MONGODB_TLS === "true";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

let connecting: Promise<typeof mongoose> | undefined;

export async function connectDb() {
  if (mongoose.connection.readyState === ConnectionStates.connected) return;
  if (!connecting) {
    connecting = connect(MONGODB_URI as string, {
      tls: useTls,
      ...(useTls && process.env.MONGODB_CA_FILE
        ? { tlsCAFile: process.env.MONGODB_CA_FILE }
        : {}),
    });
  }
  try {
    await connecting;
  } finally {
    // A failed attempt can be retried, and disconnected clients check live state.
    connecting = undefined;
  }
}
