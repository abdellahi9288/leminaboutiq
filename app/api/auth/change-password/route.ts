import { NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";
import { getUser } from "@/lib/auth";
import { isValidPassword } from "@/lib/sanitize";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return Response.json({ error: "غير مسجل" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "طلب غير صالح" }, { status: 400 });
  }

  const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
  const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

  if (!currentPassword || !newPassword) {
    return Response.json({ error: "يجب إدخال كلمة المرور الحالية والجديدة" }, { status: 400 });
  }

  const pwdCheck = isValidPassword(newPassword);
  if (!pwdCheck.valid) {
    return Response.json({ error: pwdCheck.error }, { status: 400 });
  }

  await dbConnect();

  const dbUser = await User.findById(user.userId);
  if (!dbUser || !dbUser.isActive) {
    return Response.json({ error: "المستخدم غير موجود" }, { status: 404 });
  }

  const isMatch = await bcrypt.compare(currentPassword, dbUser.password);
  if (!isMatch) {
    return Response.json({ error: "كلمة المرور الحالية غير صحيحة" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(newPassword, 12);
  dbUser.password = hashed;
  await dbUser.save();

  return Response.json({ success: true, message: "تم تغيير كلمة المرور بنجاح" });
}
