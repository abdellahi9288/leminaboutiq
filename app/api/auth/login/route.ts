import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";
import { signToken, buildCookieHeader } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { sanitizeInput, isValidPhone, isValidPassword } from "@/lib/sanitize";

const MAX_FAILED = 5;
const LOCK_DURATION = 15 * 60 * 1000; // 15 minutes
const GENERIC_ERROR = "بيانات الدخول غير صحيحة";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";

  const rateCheck = checkRateLimit(ip);
  if (!rateCheck.allowed) {
    return Response.json(
      { error: `تم تجاوز عدد المحاولات. حاول بعد ${Math.ceil(rateCheck.retryAfterSeconds / 60)} دقيقة` },
      {
        status: 429,
        headers: { "Retry-After": String(rateCheck.retryAfterSeconds) },
      }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "طلب غير صالح" }, { status: 400 });
  }

  const phone = sanitizeInput(body.phone);
  const password = typeof body.password === "string" ? body.password : "";

  if (!phone || !password) {
    return Response.json({ error: "رقم الهاتف وكلمة المرور مطلوبان" }, { status: 400 });
  }

  if (!isValidPhone(phone)) {
    return Response.json({ error: "رقم هاتف غير صالح" }, { status: 400 });
  }

  const pwdCheck = isValidPassword(password);
  if (!pwdCheck.valid) {
    return Response.json({ error: pwdCheck.error }, { status: 400 });
  }

  await dbConnect();

  const user = await User.findOne({ phone });

  if (!user) {
    // Constant-time delay to prevent user enumeration
    await bcrypt.hash("dummy-password", 10);
    return Response.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  if (!user.isActive) {
    return Response.json({ error: "هذا الحساب معطل. تواصل مع الإدارة" }, { status: 403 });
  }

  // Check account lockout
  if (user.lockUntil && user.lockUntil > new Date()) {
    const remaining = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
    return Response.json(
      { error: `الحساب مقفل. حاول بعد ${remaining} دقيقة` },
      { status: 423 }
    );
  }

  // Reset lock if expired
  if (user.lockUntil && user.lockUntil <= new Date()) {
    user.failedAttempts = 0;
    user.lockUntil = null;
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    user.failedAttempts = (user.failedAttempts || 0) + 1;

    if (user.failedAttempts >= MAX_FAILED) {
      user.lockUntil = new Date(Date.now() + LOCK_DURATION);
      await user.save();
      return Response.json(
        { error: `تم قفل الحساب بعد ${MAX_FAILED} محاولات فاشلة. حاول بعد 15 دقيقة` },
        { status: 423 }
      );
    }

    await user.save();
    const attemptsLeft = MAX_FAILED - user.failedAttempts;
    return Response.json(
      { error: `${GENERIC_ERROR}. المحاولات المتبقية: ${attemptsLeft}` },
      { status: 401 }
    );
  }

  // Successful login — reset counters
  user.failedAttempts = 0;
  user.lockUntil = null;
  await user.save();

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
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  return response;
}
