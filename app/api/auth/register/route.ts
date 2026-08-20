import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";
import { signToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  await dbConnect();
  const { name, phone, password, storeName } = await request.json();

  if (!name || !phone || !password) {
    return Response.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
  }

  const existing = await User.findOne({ phone });
  if (existing) {
    return Response.json({ error: "رقم الهاتف مسجل مسبقاً" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    phone,
    password: hashed,
    storeName: storeName || "متجري",
  });

  const token = await signToken({
    userId: user._id.toString(),
    name: user.name,
    storeName: user.storeName,
  });

  const response = Response.json({ success: true, user: { name: user.name, storeName: user.storeName } });
  response.headers.set(
    "Set-Cookie",
    `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`
  );
  return response;
}
