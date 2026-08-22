export function sanitizeInput(input: unknown): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/[\${}]/g, "")
    .trim()
    .slice(0, 500);
}

export function isValidPhone(phone: string): boolean {
  return /^[0-9+\-\s()]{4,20}$/.test(phone);
}

export function isValidPassword(password: string): { valid: boolean; error: string } {
  if (typeof password !== "string") {
    return { valid: false, error: "كلمة المرور مطلوبة" };
  }
  if (password.length < 6) {
    return { valid: false, error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" };
  }
  if (password.length > 128) {
    return { valid: false, error: "كلمة المرور طويلة جداً" };
  }
  return { valid: true, error: "" };
}
