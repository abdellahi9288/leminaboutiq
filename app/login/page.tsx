"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.phone, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "حدث خطأ");
        setLoading(false);
        return;
      }
      router.push("/dashboard");
    } catch {
      setError("خطأ في الاتصال بالخادم");
      setLoading(false);
    }
  };

  return (
    <div className="h-full w-full flex items-center justify-center p-5" style={{ background: "var(--sand)" }}>
      <div className="w-full max-w-[400px] animate-scale-in">

        {/* Avatar icon */}
        <div className="text-center mb-8 animate-fade-up">
          <img src="/icons/icon-192.png" alt="حساباتي" className="w-[90px] h-[90px] mx-auto mb-5" />
          <h1 className="text-[28px] font-bold font-tajawal" style={{ color: "var(--green-brand)" }}>حساباتي</h1>
          <p className="text-[16px] font-bold font-tajawal mt-2" style={{ color: "var(--text-ink)" }}>مرحباً بك</p>
          <p className="text-[13px] mt-1" style={{ color: "var(--text-muted)" }}>سجّل الدخول إلى حسابك</p>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-danger text-[13px] mb-4 animate-fade-up py-2">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Phone */}
          <div>
            <div
              className="flex items-center gap-3 border rounded-xl px-4 py-3"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="var(--text-faint)" className="w-5 h-5 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="flex-1 bg-transparent outline-none text-[14px] font-tajawal"
                placeholder="رقم الهاتف"
                dir="ltr"
                style={{ color: "var(--text-body)", textAlign: "right" }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div
              className="flex items-center gap-3 border rounded-xl px-4 py-3"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="var(--text-faint)" className="w-5 h-5 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="flex-1 bg-transparent outline-none text-[14px] font-tajawal"
                placeholder="كلمة المرور"
                dir="ltr"
                style={{ color: "var(--text-body)", textAlign: "right" }}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-success w-100 font-tajawal font-bold"
              style={{ padding: "12px 0", fontSize: "16px" }}
            >
              {loading ? (
                <span className="d-flex align-items-center justify-content-center gap-2">
                  <span className="spinner-border spinner-border-sm" />
                  جاري التحميل...
                </span>
              ) : "تسجيل الدخول"}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center mt-6 space-y-1">
          <p className="text-[11px]" style={{ color: "var(--text-faint)" }}>
            Developed with <span style={{ color: "#dc2626" }}>&#10084;</span> by <span className="font-bold">NetIT</span>
          </p>
          <p className="text-[11px] nums" dir="ltr" style={{ color: "var(--text-faint)" }}>
            +222 36271730 &nbsp; +222 36797986
          </p>
        </div>
      </div>
    </div>
  );
}
