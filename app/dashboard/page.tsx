"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";
import SummaryCards from "@/components/SummaryCards";
import BottomNav from "@/components/BottomNav";
import EmptyState from "@/components/EmptyState";
import AddModal from "@/components/AddModal";
import ItemList from "@/components/ItemList";
import ActivityList from "@/components/ActivityList";
import DebtList from "@/components/DebtList";
import SellPage from "@/components/SellPage";
import { PlusIcon } from "@/components/Icons";

interface SellItem {
  _id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  category: string;
}

type TabType = "dashboard" | "income" | "expenses" | "inventory" | "debts";
type FilterType = "today" | "week" | "month" | "custom";

interface UserData {
  userId: string;
  name: string;
  storeName: string;
}

interface SummaryData {
  totalIncome: number;
  totalExpenses: number;
  inventoryValue: number;
}

interface ActivityItem {
  _id: string;
  type: "income" | "expense";
  description: string;
  amount: number;
  category: string;
  date: string;
}

interface DebtItem {
  _id: string;
  customerName: string;
  customerPhone: string;
  description: string;
  totalAmount: number;
  remainingAmount: number;
  payments: Array<{ amount: number; date: string }>;
  date: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [activeFilter, setActiveFilter] = useState<FilterType>("today");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [summary, setSummary] = useState<SummaryData>({
    totalIncome: 0,
    totalExpenses: 0,
    inventoryValue: 0,
  });
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [activityPage, setActivityPage] = useState(1);
  const [activityHasMore, setActivityHasMore] = useState(false);
  const [activityLoading, setActivityLoading] = useState(false);
  const [lowStock, setLowStock] = useState<Array<{ _id: string; name: string; quantity: number; unitPrice: number }>>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sellItem, setSellItem] = useState<SellItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setInitialLoad(false);
      })
      .catch(() => router.push("/login"));
  }, [router]);

  const buildQuery = useCallback(() => {
    let q = `filter=${activeFilter}`;
    if (activeFilter === "custom" && customFrom) q += `&from=${customFrom}`;
    if (activeFilter === "custom" && customTo) q += `&to=${customTo}`;
    return q;
  }, [activeFilter, customFrom, customTo]);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await fetch(`/api/summary?${buildQuery()}`);
      const data = await res.json();
      setSummary(data);
    } catch {
      /* ignore */
    }
  }, [buildQuery]);

  const fetchActivity = useCallback(async (page = 1, append = false) => {
    setActivityLoading(true);
    try {
      const res = await fetch(`/api/activity?${buildQuery()}&page=${page}`);
      const data = await res.json();
      setActivity((prev) => append ? [...prev, ...data.items] : data.items);
      setActivityHasMore(data.hasMore);
      setActivityPage(page);
    } catch {
      if (!append) setActivity([]);
    } finally {
      setActivityLoading(false);
    }
  }, [buildQuery]);

  const fetchLowStock = useCallback(async () => {
    try {
      const res = await fetch("/api/inventory/low-stock");
      const data = await res.json();
      setLowStock(data);
    } catch {
      setLowStock([]);
    }
  }, []);

  const fetchDebts = useCallback(async () => {
    try {
      const res = await fetch("/api/debts");
      const data = await res.json();
      setDebts(data);
    } catch {
      setDebts([]);
    }
  }, []);

  const fetchItems = useCallback(async () => {
    if (activeTab === "dashboard" || activeTab === "debts") return;
    setLoading(true);
    try {
      const endpoint = activeTab === "inventory"
        ? "/api/inventory"
        : `/api/${activeTab}?${buildQuery()}`;
      const res = await fetch(endpoint);
      const data = await res.json();
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, buildQuery]);

  useEffect(() => {
    if (!initialLoad) {
      fetchSummary();
      if (activeTab === "dashboard") {
        fetchActivity();
        fetchLowStock();
        setLoading(false);
      } else if (activeTab === "debts") {
        fetchDebts();
        setLoading(false);
      } else {
        fetchItems();
      }
    }
  }, [fetchSummary, fetchItems, fetchActivity, fetchLowStock, fetchDebts, initialLoad, activeTab]);

  const handleAdd = async (data: Record<string, string | number>) => {
    const endpoint =
      activeTab === "inventory"
        ? "/api/inventory"
        : activeTab === "expenses"
        ? "/api/expenses"
        : "/api/income";

    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    fetchItems();
    fetchSummary();
  };

  const handleSell = async (data: { inventoryItemId: string; quantity: number; salePrice: number }) => {
    const res = await fetch("/api/sell", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) {
      alert(result.error || "حدث خطأ");
      return;
    }
    setSellItem(null);
    if (result.lowStock) {
      alert(`⚠️ تنبيه: المنتج "${result.inventoryItem.name}" بقي منه ${result.inventoryItem.quantity} وحدة فقط!`);
    }
    fetchItems();
    fetchSummary();
    fetchLowStock();
  };

  const handleSellCredit = async (data: { inventoryItemId: string; quantity: number; salePrice: number; customerName: string; customerPhone: string }) => {
    const res = await fetch("/api/sell-credit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) {
      alert(result.error || "حدث خطأ");
      return;
    }
    setSellItem(null);
    if (result.lowStock) {
      alert(`⚠️ تنبيه: المنتج "${result.inventoryItem.name}" بقي منه ${result.inventoryItem.quantity} وحدة فقط!`);
    }
    fetchItems();
    fetchSummary();
    fetchLowStock();
  };

  const handlePayDebt = async (debtId: string, amount: number) => {
    const res = await fetch("/api/debts/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ debtId, amount }),
    });
    const result = await res.json();
    if (!res.ok) {
      alert(result.error || "حدث خطأ");
      return;
    }
    if (result.paid) {
      alert("تم سداد الدين بالكامل!");
    }
    fetchDebts();
    fetchSummary();
  };

  const handleDelete = async (id: string) => {
    const endpoint =
      activeTab === "debts"
        ? "/api/debts"
        : activeTab === "inventory"
        ? "/api/inventory"
        : activeTab === "income"
        ? "/api/income"
        : "/api/expenses";

    await fetch(`${endpoint}?id=${id}`, { method: "DELETE" });
    if (activeTab === "debts") {
      fetchDebts();
    } else {
      fetchItems();
    }
    fetchSummary();
  };

  if (initialLoad) {
    return (
      <div className="h-full w-full flex items-center justify-center pattern-bg" style={{ background: "var(--sand)" }}>
        <div className="flex flex-col items-center gap-5 animate-scale-in relative z-10">
          <div
            className="w-14 h-14 rounded-full animate-spin"
            style={{ border: "3px solid var(--sand-dark)", borderTopColor: "var(--green-brand)" }}
          />
          <p className="text-[14px] font-tajawal font-bold" style={{ color: "var(--text-muted)" }}>
            جاري التحميل...
          </p>
        </div>
      </div>
    );
  }

  const emptyConfig = {
    income: {
      title: "لا توجد مداخيل",
      description: "سجل المبيعات والإيرادات الخاصة بمتجرك.",
    },
    expenses: {
      title: "لا توجد مصاريف",
      description: "سجل الإيجار أو النقل أو الفواتير أو شراء البضاعة.",
    },
    inventory: {
      title: "لا توجد منتجات",
      description: "أضف المنتجات وتتبع المخزون الخاص بمتجرك.",
    },
  };

  const modalType: "income" | "expense" | "inventory" =
    activeTab === "income"
      ? "income"
      : activeTab === "expenses"
      ? "expense"
      : "inventory";

  const isDashboard = activeTab === "dashboard";
  const isDebts = activeTab === "debts";

  if (sellItem) {
    return (
      <SellPage
        item={sellItem}
        onBack={() => setSellItem(null)}
        onSell={handleSell}
        onSellCredit={handleSellCredit}
      />
    );
  }

  return (
    <div className="h-full w-full flex flex-col" style={{ background: "var(--sand)" }}>
      <TopBar
        userName={user?.name || ""}
        storeName={user?.storeName || "LEMINA BOUTIQ"}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        onCustomDateChange={(from, to) => { setCustomFrom(from); setCustomTo(to); }}
        activeTab={activeTab}
      />

      {isDashboard ? (
        <>
          <SummaryCards
            totalIncome={summary.totalIncome}
            totalExpenses={summary.totalExpenses}
            inventoryValue={summary.inventoryValue}
          />
          <div className="flex-1 overflow-y-auto pb-3 pt-1">
            {lowStock.length > 0 && (
              <div className="px-3 md:px-10 mb-3">
                <div className="rounded-2xl border p-3" style={{ background: "#fef2f2", borderColor: "#fca5a5" }}>
                  <p className="text-[13px] font-tajawal font-bold mb-2" style={{ color: "#dc2626" }}>
                    ⚠️ تنبيه المخزون
                  </p>
                  {lowStock.map((item) => (
                    <div key={item._id} className="flex items-center justify-between py-1.5" dir="rtl">
                      <span className="text-[13px] font-tajawal font-bold" style={{ color: "#991b1b" }}>
                        {item.name}
                      </span>
                      <span className="text-[12px] font-tajawal font-bold" style={{ color: item.quantity === 0 ? "#dc2626" : "#ea580c" }}>
                        {item.quantity === 0 ? "نفد" : <><span className="nums">{item.quantity}</span> وحدة</>}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <ActivityList
              items={activity}
              hasMore={activityHasMore}
              loading={activityLoading}
              onLoadMore={() => fetchActivity(activityPage + 1, true)}
            />
          </div>
        </>
      ) : isDebts ? (
        <div className="flex-1 overflow-y-auto pb-3 pt-3">
          <DebtList items={debts} onPay={handlePayDebt} onDelete={handleDelete} />
        </div>
      ) : (
        <>
          <div className="px-3 md:px-8 pt-3 pb-2 shrink-0">
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn btn-success w-100 d-flex align-items-center justify-content-center gap-2 font-tajawal font-bold"
              style={{ padding: "10px 0", fontSize: "15px" }}
            >
              <PlusIcon />
              {activeTab === "income" ? "إضافة دخل" : activeTab === "expenses" ? "إضافة مصروف" : "إضافة منتج"}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pb-3 pt-1">
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <div
                  className="w-10 h-10 rounded-full animate-spin"
                  style={{ border: "3px solid var(--sand-dark)", borderTopColor: "var(--green-brand)" }}
                />
              </div>
            ) : items.length === 0 ? (
              <EmptyState
                title={emptyConfig[activeTab as keyof typeof emptyConfig].title}
                description={emptyConfig[activeTab as keyof typeof emptyConfig].description}
              />
            ) : (
              <ItemList
                items={items as Array<{
                  _id: string;
                  amount?: number;
                  description?: string;
                  name?: string;
                  quantity?: number;
                  unitPrice?: number;
                  category: string;
                  date?: string;
                  createdAt: string;
                }>}
                type={activeTab === "expenses" ? "expense" : activeTab as "income" | "inventory"}
                onDelete={handleDelete}
              />
            )}
          </div>
        </>
      )}

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {!isDashboard && !isDebts && (
        <AddModal
          type={modalType}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleAdd}
          onSelectProduct={(item) => { setIsModalOpen(false); setSellItem(item); }}
        />
      )}
    </div>
  );
}
