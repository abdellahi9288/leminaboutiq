import { NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";
import { getUser } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return Response.json({ error: "غير مسجل" }, { status: 401 });
  }

  await dbConnect();
  const { currentPassword, newPassword } = await request.json();

  if (!currentPassword || !newPassword) {
    return Response.json({ error: "يجب إدخال كلمة المرور الحالية والجديدة" }, { status: 400 });
  }

  if (newPassword.length < 6) {
    return Response.json({ error: "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل" }, { status: 400 });
  }

  const dbUser = await User.findById(user.userId);
  if (!dbUser) {
    return Response.json({ error: "المستخدم غير موجود" }, { status: 404 });
  }

  const isMatch = await bcrypt.compare(currentPassword, dbUser.password);
  if (!isMatch) {
    return Response.json({ error: "كلمة المرور الحالية غير صحيحة" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  dbUser.password = hashed;
  await dbUser.save();

  return Response.json({ success: true, message: "تم تغيير كلمة المرور بنجاح" });
}
