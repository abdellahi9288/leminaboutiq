"use client";

import { IncomeIcon, ExpenseIcon, InventoryIcon, DashboardIcon, DebtIcon, MyDebtIcon } from "./Icons";

type TabType = "dashboard" | "income" | "expenses" | "inventory" | "debts" | "myDebts";

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
  { key: "myDebts", label: "ديوني", Icon: MyDebtIcon },
];

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      className="border-t flex justify-center items-center py-1 px-1.5 gap-0.5 shrink-0"
      style={{ background: "var(--card)", borderColor: "var(--border-light)", paddingBottom: "calc(0.25rem + env(safe-area-inset-bottom, 0px))" }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`btn d-flex flex-column align-items-center gap-0 py-1.5 px-0 font-tajawal font-bold flex-1 ${
              isActive ? "btn-success" : "btn-light border-0"
            }`}
            style={{
              ...(!isActive ? { color: "var(--text-faint)" } : {}),
              minWidth: 0,
              fontSize: "10px",
              borderRadius: "10px",
            }}
          >
            <tab.Icon active={isActive} />
            <span className="text-[10px] leading-tight mt-0.5">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
