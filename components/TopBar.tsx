"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogoutIcon, SettingsIcon, DownloadIcon, XMarkIcon } from "./Icons";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}

declare global {
  interface Window { __pwaPrompt: BeforeInstallPromptEvent | null; }
}

type FilterType = "today" | "week" | "month" | "custom";
type TabType = "dashboard" | "income" | "expenses" | "inventory" | "debts";

interface TopBarProps {
  userName: string;
  storeName: string;
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  onCustomDateChange?: (from: string, to: string) => void;
  activeTab: TabType;
}

const filters: { key: FilterType; label: string }[] = [
  { key: "today", label: "اليوم" },
  { key: "week", label: "هذا الأسبوع" },
  { key: "month", label: "هذا الشهر" },
  { key: "custom", label: "فترة مخصصة" },
];

export default function TopBar({ userName, storeName, activeFilter, onFilterChange, onCustomDateChange, activeTab }: TopBarProps) {
  const router = useRouter();
  const todayStr = new Date().toISOString().split("T")[0];
  const [customFrom, setCustomFrom] = useState(todayStr);
  const [customTo, setCustomTo] = useState(todayStr);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError("");
    setPwdSuccess("");
    setPwdSaving(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwdError(data.error);
      } else {
        setPwdSuccess("تم تغيير كلمة المرور بنجاح");
        setCurrentPwd("");
        setNewPwd("");
        setTimeout(() => { setShowPassword(false); setPwdSuccess(""); }, 1500);
      }
    } catch {
      setPwdError("حدث خطأ");
    } finally {
      setPwdSaving(false);
    }
  };

  const triggerInstall = async (evt: BeforeInstallPromptEvent) => {
    await evt.prompt();
    window.__pwaPrompt = null;
  };

  const handleInstall = async () => {
    const stored = window.__pwaPrompt;
    if (stored) { await triggerInstall(stored); return; }

    // Wait briefly for the prompt to arrive
    await new Promise<void>((resolve) => {
      const onPrompt = (e: Event) => {
        e.preventDefault();
        window.__pwaPrompt = e as BeforeInstallPromptEvent;
        resolve();
      };
      window.addEventListener("beforeinstallprompt", onPrompt);
      setTimeout(() => { window.removeEventListener("beforeinstallprompt", onPrompt); resolve(); }, 3000);
    });

    const delayed = window.__pwaPrompt;
    if (delayed) { await triggerInstall(delayed); return; }

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      alert("لتثبيت التطبيق:\n\nاضغط على زر المشاركة ⬆️ في الأسفل\nثم اختر \"إضافة إلى الشاشة الرئيسية\"");
    } else {
      alert("لتثبيت التطبيق:\n\nاضغط على ⋮ في أعلى المتصفح\nثم اختر \"إضافة إلى الشاشة الرئيسية\"");
    }
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    await fetch("/api/auth/me", { method: "POST" });
    router.push("/login");
  };

  const handleExport = async () => {
    setMenuOpen(false);
    const [incomes, expenses, inventory] = await Promise.all([
      fetch(`/api/income?filter=${activeFilter}`).then(r => r.json()),
      fetch(`/api/expenses?filter=${activeFilter}`).then(r => r.json()),
      fetch("/api/inventory").then(r => r.json()),
    ]);
    const data = { incomes, expenses, inventory, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lemina-boutiq-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sectionTitle = activeTab === "dashboard" ? "لوحة التحكم" : activeTab === "income" ? "الدخل" : activeTab === "expenses" ? "المصاريف" : activeTab === "debts" ? "الديون" : "المخزون";

  return (
    <div
      className="border-b shrink-0"
      style={{ background: "var(--card)", borderColor: "var(--border-light)" }}
    >
      {/* Mobile: burger + section title + store name */}
      <div className="flex md:hidden items-center justify-between px-4 pt-3 pb-2">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="btn btn-light border-0 p-1"
          style={{ color: "var(--text-muted)" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <h2 className="text-[14px] font-bold font-tajawal m-0" style={{ color: "var(--text-ink)" }}>{sectionTitle}</h2>
          <span className="text-[9px] font-bold tracking-[0.1em] uppercase" style={{ color: "var(--gold)" }}>{storeName}</span>
        </div>
      </div>

      {/* Mobile: filters row under top bar */}
      <div className="flex md:hidden flex-wrap gap-2 px-4 pb-3">
        {filters.map((f) => {
          const isActive = activeFilter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => onFilterChange(f.key)}
              className={`btn btn-sm font-tajawal font-bold ${isActive ? "btn-success" : "btn-outline-secondary"}`}
              style={{ fontSize: "12px", padding: "4px 12px" }}
            >
              {f.label}
            </button>
          );
        })}
      </div>
      {activeFilter === "custom" && (
        <div className="flex md:hidden items-center gap-3 px-4 pb-3 animate-fade-up">
          <div className="flex items-center gap-1">
            <label className="text-[11px] font-tajawal font-bold" style={{ color: "var(--text-muted)" }}>من</label>
            <input
              type="date" value={customFrom}
              onChange={(e) => { setCustomFrom(e.target.value); onCustomDateChange?.(e.target.value, customTo); }}
              className="btn btn-outline-secondary btn-sm" style={{ fontSize: "11px", padding: "2px 6px" }}
            />
          </div>
          <div className="flex items-center gap-1">
            <label className="text-[11px] font-tajawal font-bold" style={{ color: "var(--text-muted)" }}>إلى</label>
            <input
              type="date" value={customTo}
              onChange={(e) => { setCustomTo(e.target.value); onCustomDateChange?.(customFrom, e.target.value); }}
              className="btn btn-outline-secondary btn-sm" style={{ fontSize: "11px", padding: "2px 6px" }}
            />
          </div>
        </div>
      )}

      {/* Mobile menu overlay — burger menu (no filters, just actions) */}
      {menuOpen && (
        <div className="md:hidden">
          <div className="fixed inset-0" style={{ background: "rgba(0,0,0,0.25)", zIndex: 9998 }} onClick={() => setMenuOpen(false)} />
          <div
            className="fixed rounded-xl border shadow-xl animate-fade-up"
            style={{ background: "var(--card)", borderColor: "var(--border-light)", zIndex: 9999, top: "48px", left: "12px", right: "12px" }}
          >
            <button onClick={() => { setMenuOpen(false); handleInstall(); }} className="w-full d-flex align-items-center gap-2 px-4 py-3 text-[14px] font-tajawal font-bold border-0 bg-transparent" style={{ color: "var(--green-brand)" }}>
              <DownloadIcon /> تثبيت التطبيق
            </button>
            <div style={{ height: "1px", background: "var(--border-light)" }} />
            <button onClick={handleExport} className="w-full d-flex align-items-center gap-2 px-4 py-3 text-[14px] font-tajawal border-0 bg-transparent" style={{ color: "var(--text-body)" }}>
              <DownloadIcon /> تحميل البيانات
            </button>
            <div style={{ height: "1px", background: "var(--border-light)" }} />
            <button onClick={() => { setMenuOpen(false); setShowPassword(true); setPwdError(""); setPwdSuccess(""); }} className="w-full d-flex align-items-center gap-2 px-4 py-3 text-[14px] font-tajawal border-0 bg-transparent" style={{ color: "var(--text-body)" }}>
              <SettingsIcon /> تغيير كلمة المرور
            </button>
            <div style={{ height: "1px", background: "var(--border-light)" }} />
            <button onClick={handleLogout} className="w-full d-flex align-items-center gap-2 px-4 py-3 text-[14px] font-tajawal border-0 bg-transparent" style={{ color: "#dc3545" }}>
              <LogoutIcon /> تسجيل الخروج
            </button>
          </div>
        </div>
      )}

      {/* Change password modal */}
      {showPassword && (
        <div
          className="fixed inset-0 flex items-end md:items-center justify-center"
          style={{ background: "rgba(28,20,16,0.35)", backdropFilter: "blur(4px)", zIndex: 10000 }}
        >
          <div
            className="rounded-t-[28px] md:rounded-[28px] w-full max-w-[420px] p-8 animate-slide-up md:mx-5 border"
            style={{ background: "var(--card)", borderColor: "var(--border-light)" }}
          >
            <div className="flex items-center justify-between mb-6">
              <button onClick={() => setShowPassword(false)} className="btn btn-light btn-sm border-0" style={{ color: "var(--text-faint)" }}>
                <XMarkIcon />
              </button>
              <h2 className="text-[18px] font-bold font-tajawal" style={{ color: "var(--text-ink)" }}>تغيير كلمة المرور</h2>
              <div className="w-10" />
            </div>
            <form onSubmit={handleChangePassword} className="space-y-5">
              <div>
                <label className="block text-[13px] font-tajawal font-bold mb-2" style={{ color: "var(--text-muted)" }}>كلمة المرور الحالية</label>
                <input
                  type="password" required value={currentPwd}
                  onChange={(e) => setCurrentPwd(e.target.value)}
                  className="w-full border rounded-2xl px-5 py-4 text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--green-brand)]/20 focus:border-[var(--green-brand)]"
                  style={{ background: "var(--cream)", borderColor: "var(--border)", color: "var(--text-body)" }}
                />
              </div>
              <div>
                <label className="block text-[13px] font-tajawal font-bold mb-2" style={{ color: "var(--text-muted)" }}>كلمة المرور الجديدة</label>
                <input
                  type="password" required minLength={6} value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  className="w-full border rounded-2xl px-5 py-4 text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--green-brand)]/20 focus:border-[var(--green-brand)]"
                  style={{ background: "var(--cream)", borderColor: "var(--border)", color: "var(--text-body)" }}
                />
              </div>
              {pwdError && <p className="text-[13px] font-tajawal font-bold text-center" style={{ color: "#dc2626" }}>{pwdError}</p>}
              {pwdSuccess && <p className="text-[13px] font-tajawal font-bold text-center" style={{ color: "#059669" }}>{pwdSuccess}</p>}
              <button
                type="submit" disabled={pwdSaving}
                className="btn btn-success btn-lg w-100 font-tajawal font-bold"
              >
                {pwdSaving ? (
                  <span className="d-flex align-items-center justify-content-center gap-2">
                    <span className="spinner-border spinner-border-sm" />
                    جاري الحفظ...
                  </span>
                ) : "تغيير كلمة المرور"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Desktop: original layout */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between px-8 pt-2 pb-1 relative z-10">
          <div className="flex items-center gap-3 shrink-0">
            <button onClick={handleExport} className="btn btn-light border-0 d-flex flex-column align-items-center gap-0.5 px-2 py-1" style={{ color: "var(--green-deep)" }}>
              <DownloadIcon />
              <span className="text-[10px] font-tajawal font-bold">تحميل</span>
            </button>
            <button onClick={() => { setShowPassword(true); setPwdError(""); setPwdSuccess(""); }} className="btn btn-light border-0 d-flex flex-column align-items-center gap-0.5 px-2 py-1" style={{ color: "var(--green-deep)" }}>
              <SettingsIcon />
              <span className="text-[10px] font-tajawal font-bold">إعدادات</span>
            </button>
            <button onClick={handleLogout} className="btn btn-light border-0 d-flex flex-column align-items-center gap-0.5 px-2 py-1" style={{ color: "#dc3545" }}>
              <LogoutIcon />
              <span className="text-[10px] font-tajawal font-bold">خروج</span>
            </button>
          </div>
          <span className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color: "var(--gold)" }}>{storeName}</span>
        </div>
        <div className="flex items-center justify-between px-8 pb-1.5 pt-0 relative z-10">
          <div className="flex items-center gap-3">
            {filters.map((f) => {
              const isActive = activeFilter === f.key;
              return (
                <button key={f.key} onClick={() => onFilterChange(f.key)} className="btn btn-link text-decoration-none text-[12px] font-tajawal font-bold whitespace-nowrap p-0" style={{ color: isActive ? "var(--green-brand)" : "var(--text-muted)" }}>
                  {f.label}
                </button>
              );
            })}
          </div>
          <h2 className="text-[15px] font-bold font-tajawal m-0" style={{ color: "var(--text-ink)" }}>{sectionTitle}</h2>
        </div>
        {activeFilter === "custom" && (
          <div className="flex items-center justify-center gap-2 px-8 pb-2 pt-0.5 relative z-10 animate-fade-up">
            <div className="flex items-center gap-1">
              <label className="text-[11px] font-tajawal font-bold" style={{ color: "var(--text-muted)" }}>من</label>
              <input type="date" value={customFrom} onChange={(e) => { setCustomFrom(e.target.value); onCustomDateChange?.(e.target.value, customTo); }} className="btn btn-outline-secondary btn-sm font-tajawal" style={{ fontSize: "11px", padding: "1px 6px" }} />
            </div>
            <div className="flex items-center gap-1">
              <label className="text-[11px] font-tajawal font-bold" style={{ color: "var(--text-muted)" }}>إلى</label>
              <input type="date" value={customTo} onChange={(e) => { setCustomTo(e.target.value); onCustomDateChange?.(customFrom, e.target.value); }} className="btn btn-outline-secondary btn-sm font-tajawal" style={{ fontSize: "11px", padding: "1px 6px" }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
