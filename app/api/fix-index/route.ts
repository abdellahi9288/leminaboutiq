import dbConnect from "@/lib/mongodb";
import mongoose from "mongoose";

export async function POST() {
  await dbConnect();
  const db = mongoose.connection.db;
  if (!db) return Response.json({ error: "no db" }, { status: 500 });
  try {
    await db.collection("users").dropIndex("email_1");
  } catch {
    // index may not exist
  }
  const indexes = await db.collection("users").indexes();
  return Response.json({ success: true, indexes });
}
