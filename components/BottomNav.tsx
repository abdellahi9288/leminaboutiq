"use client";

import { IncomeIcon, ExpenseIcon, InventoryIcon } from "./Icons";

type TabType = "income" | "expenses" | "inventory";

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs: { key: TabType; label: string; Icon: typeof IncomeIcon }[] = [
  { key: "income", label: "الدخل", Icon: IncomeIcon },
  { key: "expenses", label: "المصاريف", Icon: ExpenseIcon },
  { key: "inventory", label: "المخزون", Icon: InventoryIcon },
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
            className={`btn d-flex flex-column align-items-center gap-0.5 px-3 py-1.5 font-tajawal font-bold ${
              isActive ? "btn-success" : "btn-light border-0"
            }`}
            style={!isActive ? { color: "var(--text-faint)" } : {}}
          >
            <tab.Icon active={isActive} />
            <span className="text-[11px]">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
