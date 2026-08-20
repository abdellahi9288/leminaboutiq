"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogoutIcon, SettingsIcon, DownloadIcon } from "./Icons";

type FilterType = "today" | "week" | "month" | "custom";
type TabType = "income" | "expenses" | "inventory";

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

  const handleFilterChange = (key: FilterType) => {
    onFilterChange(key);
    if (key !== "custom") setMenuOpen(false);
  };

  const sectionTitle = activeTab === "income" ? "الدخل" : activeTab === "expenses" ? "المصاريف" : "المخزون";

  return (
    <div
      className="border-b shrink-0"
      style={{ background: "var(--card)", borderColor: "var(--border-light)" }}
    >
      {/* Mobile: burger + section title + store name */}
      <div className="flex md:hidden items-center justify-between px-3 pt-2 pb-1.5">
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

      {/* Mobile menu overlay — rendered at top level with fixed positioning */}
      {menuOpen && (
        <div className="md:hidden">
          <div className="fixed inset-0" style={{ background: "rgba(0,0,0,0.25)", zIndex: 9998 }} onClick={() => setMenuOpen(false)} />
          <div
            className="fixed rounded-xl border shadow-xl animate-fade-up"
            style={{ background: "var(--card)", borderColor: "var(--border-light)", zIndex: 9999, top: "48px", left: "12px", right: "12px" }}
          >
            {/* Filters */}
            <div className="px-4 py-3">
              <p className="text-[11px] font-tajawal font-bold mb-2" style={{ color: "var(--text-faint)" }}>الفترة</p>
              <div className="flex flex-wrap gap-2">
                {filters.map((f) => {
                  const isActive = activeFilter === f.key;
                  return (
                    <button
                      key={f.key}
                      onClick={() => handleFilterChange(f.key)}
                      className={`btn btn-sm font-tajawal font-bold ${isActive ? "btn-success" : "btn-outline-secondary"}`}
                      style={{ fontSize: "12px", padding: "4px 12px" }}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>
              {activeFilter === "custom" && (
                <div className="flex items-center gap-3 mt-3">
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
            </div>
            <div style={{ height: "1px", background: "var(--border-light)" }} />
            <button onClick={handleExport} className="w-full d-flex align-items-center gap-2 px-4 py-3 text-[14px] font-tajawal border-0 bg-transparent" style={{ color: "var(--text-body)" }}>
              <DownloadIcon /> تحميل البيانات
            </button>
            <div style={{ height: "1px", background: "var(--border-light)" }} />
            <button onClick={() => setMenuOpen(false)} className="w-full d-flex align-items-center gap-2 px-4 py-3 text-[14px] font-tajawal border-0 bg-transparent" style={{ color: "var(--text-body)" }}>
              <SettingsIcon /> إعدادات
            </button>
            <div style={{ height: "1px", background: "var(--border-light)" }} />
            <button onClick={handleLogout} className="w-full d-flex align-items-center gap-2 px-4 py-3 text-[14px] font-tajawal border-0 bg-transparent" style={{ color: "#dc3545" }}>
              <LogoutIcon /> تسجيل الخروج
            </button>
          </div>
        </div>
      )}

      {/* Desktop: original layout */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between px-8 pt-2 pb-1 relative z-10">
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={handleExport} className="btn btn-light border-0 p-1" style={{ color: "var(--text-muted)" }}><DownloadIcon /></button>
            <button className="btn btn-light border-0 p-1" style={{ color: "var(--text-muted)" }}><SettingsIcon /></button>
            <button onClick={handleLogout} className="btn btn-light border-0 p-1" style={{ color: "var(--text-muted)" }}><LogoutIcon /></button>
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
