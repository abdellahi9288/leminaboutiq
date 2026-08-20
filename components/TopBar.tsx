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

  const handleLogout = async () => {
    await fetch("/api/auth/me", { method: "POST" });
    router.push("/login");
  };

  const handleExport = async () => {
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

  return (
    <div
      className="border-b"
      style={{ background: "var(--card)", borderColor: "var(--border-light)" }}
    >
      {/* Row 1: action buttons + store name */}
      <div className="flex items-center justify-between px-4 md:px-8 pt-2 pb-1 relative z-10">
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExport}
            className="btn btn-outline-success btn-sm d-flex align-items-center gap-1 font-tajawal"
            style={{ fontSize: "12px" }}
          >
            <DownloadIcon />
            تحميل
          </button>
          <button
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 font-tajawal"
            style={{ fontSize: "12px" }}
          >
            <SettingsIcon />
            إعدادات
          </button>
          <button
            onClick={handleLogout}
            className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1 font-tajawal"
            style={{ fontSize: "12px" }}
          >
            <LogoutIcon />
            خروج
          </button>
        </div>
        <span className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color: "var(--gold)" }}>{storeName}</span>
      </div>

      {/* Row 2: section title + filters */}
      <div className="flex items-center justify-between px-4 md:px-8 pb-1.5 pt-0.5 relative z-10">
        <div className="flex items-center gap-3">
          {filters.map((f) => {
            const isActive = activeFilter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => onFilterChange(f.key)}
                className="btn btn-link text-decoration-none text-[12px] font-tajawal font-bold whitespace-nowrap p-0"
                style={{ color: isActive ? "var(--green-brand)" : "var(--text-muted)" }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = "var(--green-brand)"; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = "var(--text-muted)"; }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
        <h2 className="text-[15px] font-bold font-tajawal m-0" style={{ color: "var(--text-ink)" }}>
          {activeTab === "income" ? "الدخل" : activeTab === "expenses" ? "المصاريف" : "المخزون"}
        </h2>
      </div>

      {activeFilter === "custom" && (
        <div className="flex items-center justify-center gap-2 px-4 md:px-8 pb-2 pt-0.5 relative z-10 animate-fade-up">
          <div className="flex items-center gap-1">
            <label className="text-[11px] font-tajawal font-bold" style={{ color: "var(--text-muted)" }}>من</label>
            <input
              type="date"
              value={customFrom}
              onChange={(e) => {
                setCustomFrom(e.target.value);
                onCustomDateChange?.(e.target.value, customTo);
              }}
              className="btn btn-outline-secondary btn-sm font-tajawal"
              style={{ fontSize: "12px", padding: "2px 8px" }}
            />
          </div>
          <div className="flex items-center gap-1">
            <label className="text-[11px] font-tajawal font-bold" style={{ color: "var(--text-muted)" }}>إلى</label>
            <input
              type="date"
              value={customTo}
              onChange={(e) => {
                setCustomTo(e.target.value);
                onCustomDateChange?.(customFrom, e.target.value);
              }}
              className="btn btn-outline-secondary btn-sm font-tajawal"
              style={{ fontSize: "12px", padding: "2px 8px" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
