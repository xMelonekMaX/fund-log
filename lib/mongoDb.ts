"use server";

import { connect, ConnectionStates } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
const useTls = process.env.MONGODB_TLS === "true";

if (!MONGODB_URI) {
	throw new Error("Please define the MONGODB_URI environment variable");
}

let isConnected: ConnectionStates;

export async function connectDb() {
	if (isConnected) return;

	try {
		const db = await connect(MONGODB_URI as string, {
			tls: useTls,
			...(useTls && process.env.MONGODB_CA_FILE
				? { tlsCAFile: process.env.MONGODB_CA_FILE }
				: {}),
		});
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
