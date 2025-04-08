import mongoose, { Document, ObjectId, Schema } from "mongoose";

export interface ISession extends Document {
  userId: ObjectId;
  expiresAt: Date;
}

const SessionSchema = new mongoose.Schema({
  userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  expiresAt: { type: Date, required: true },
});

SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Session =
  mongoose.models.Session || mongoose.model<ISession>("Session", SessionSchema);

export default Session;
