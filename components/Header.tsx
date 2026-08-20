"use client";

import { useRouter } from "next/navigation";
import { LogoutIcon, SettingsIcon, DownloadIcon } from "./Icons";

interface HeaderProps {
  userName: string;
  storeName: string;
}

export default function Header({ userName, storeName }: HeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/me", { method: "POST" });
    router.push("/login");
  };

  return (
    <header
      className="flex items-center justify-between px-5 md:px-10 py-5 border-b pattern-bg"
      style={{ background: "var(--card)", borderColor: "var(--border-light)" }}
    >
      <div className="flex items-center gap-2 relative z-10">
        <button
          onClick={handleLogout}
          className="p-3 rounded-2xl transition-all duration-200 btn-press"
          style={{ background: "var(--sand)", color: "var(--text-muted)" }}
          title="تسجيل الخروج"
        >
          <LogoutIcon />
        </button>
        <button
          className="p-3 rounded-2xl transition-all duration-200 btn-press"
          style={{ background: "var(--sand)", color: "var(--text-muted)" }}
        >
          <SettingsIcon />
        </button>
        <button
          className="p-3 rounded-2xl transition-all duration-200 btn-press"
          style={{ background: "var(--sand)", color: "var(--text-muted)" }}
        >
          <DownloadIcon />
        </button>
      </div>
      <div className="text-left relative z-10">
        <p
          className="text-[11px] font-bold tracking-[0.14em] uppercase"
          style={{ color: "var(--gold)" }}
        >
          {storeName}
        </p>
        <p className="text-[20px] font-bold font-tajawal mt-0.5" style={{ color: "var(--text-ink)" }}>
          {userName}
        </p>
      </div>
    </header>
  );
}
