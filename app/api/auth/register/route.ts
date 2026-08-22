import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";
import { signToken, buildCookieHeader } from "@/lib/auth";
import { sanitizeInput, isValidPhone, isValidPassword } from "@/lib/sanitize";

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "طلب غير صالح" }, { status: 400 });
  }

  const name = sanitizeInput(body.name);
  const phone = sanitizeInput(body.phone);
  const password = typeof body.password === "string" ? body.password : "";
  const storeName = sanitizeInput(body.storeName) || "متجري";

  if (!name || !phone || !password) {
    return Response.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
  }

  if (!isValidPhone(phone)) {
    return Response.json({ error: "رقم هاتف غير صالح" }, { status: 400 });
  }

  const pwdCheck = isValidPassword(password);
  if (!pwdCheck.valid) {
    return Response.json({ error: pwdCheck.error }, { status: 400 });
  }

  if (name.length > 100) {
    return Response.json({ error: "الاسم طويل جداً" }, { status: 400 });
  }

  await dbConnect();

  const existing = await User.findOne({ phone });
  if (existing) {
    return Response.json({ error: "رقم الهاتف مسجل مسبقاً" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    phone,
    password: hashed,
    storeName,
  });

  const token = await signToken({
    userId: user._id.toString(),
    name: user.name,
    storeName: user.storeName,
  });

  const response = Response.json({
    success: true,
    user: { name: user.name, storeName: user.storeName },
  });
  response.headers.set("Set-Cookie", buildCookieHeader(token));
  return response;
}
