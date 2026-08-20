import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";
import { signToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  await dbConnect();
  const { phone, password } = await request.json();

  if (!phone || !password) {
    return Response.json({ error: "رقم الهاتف وكلمة المرور مطلوبان" }, { status: 400 });
  }

  const user = await User.findOne({ phone });
  if (!user) {
    return Response.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return Response.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 });
  }

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
