import { getUser, clearCookieHeader } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function GET() {
  const tokenUser = await getUser();
  if (!tokenUser) {
    return Response.json({ error: "غير مسجل" }, { status: 401 });
  }

  await dbConnect();
  const dbUser = await User.findById(tokenUser.userId).select("name storeName isActive");

  if (!dbUser || !dbUser.isActive) {
    const response = Response.json({ error: "الحساب غير موجود أو معطل" }, { status: 401 });
    response.headers.set("Set-Cookie", clearCookieHeader());
    return response;
  }

  return Response.json({
    userId: tokenUser.userId,
    name: dbUser.name,
    storeName: dbUser.storeName,
  });
}

export async function POST() {
  const response = Response.json({ success: true });
  response.headers.set("Set-Cookie", clearCookieHeader());
  return response;
}
