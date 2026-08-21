"use client";

import { IncomeIcon, ExpenseIcon, InventoryIcon, DashboardIcon, DebtIcon } from "./Icons";

type TabType = "dashboard" | "income" | "expenses" | "inventory" | "debts";

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs: { key: TabType; label: string; Icon: typeof IncomeIcon }[] = [
  { key: "dashboard", label: "الرئيسية", Icon: DashboardIcon },
  { key: "income", label: "الدخل", Icon: IncomeIcon },
  { key: "expenses", label: "المصاريف", Icon: ExpenseIcon },
  { key: "inventory", label: "المخزون", Icon: InventoryIcon },
  { key: "debts", label: "الديون", Icon: DebtIcon },
];

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      className="border-t flex justify-center items-center py-1.5 px-3 gap-1.5 shrink-0"
      style={{ background: "var(--card)", borderColor: "var(--border-light)", paddingBottom: "calc(0.375rem + env(safe-area-inset-bottom, 0px))" }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`btn d-flex flex-column align-items-center gap-1 py-2 font-tajawal font-bold flex-1 ${
              isActive ? "btn-success" : "btn-light border-0"
            }`}
            style={!isActive ? { color: "var(--text-faint)" } : {}}
          >
            <tab.Icon active={isActive} />
            <span className="text-[12px]">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
