"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";
import SummaryCards from "@/components/SummaryCards";
import BottomNav from "@/components/BottomNav";
import EmptyState from "@/components/EmptyState";
import AddModal from "@/components/AddModal";
import ItemList from "@/components/ItemList";
import { PlusIcon } from "@/components/Icons";

type TabType = "income" | "expenses" | "inventory";
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

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("expenses");
  const [activeFilter, setActiveFilter] = useState<FilterType>("today");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [summary, setSummary] = useState<SummaryData>({
    totalIncome: 0,
    totalExpenses: 0,
    inventoryValue: 0,
  });
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint =
        activeTab === "inventory"
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
      fetchItems();
    }
  }, [fetchSummary, fetchItems, initialLoad]);

  const handleAdd = async (data: Record<string, string | number>) => {
    const endpoint =
      activeTab === "inventory"
        ? "/api/inventory"
        : activeTab === "income"
        ? "/api/income"
        : "/api/expenses";

    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    fetchItems();
    fetchSummary();
  };

  const handleDelete = async (id: string) => {
    const endpoint =
      activeTab === "inventory"
        ? "/api/inventory"
        : activeTab === "income"
        ? "/api/income"
        : "/api/expenses";

    await fetch(`${endpoint}?id=${id}`, { method: "DELETE" });
    fetchItems();
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

      {/* Add button */}
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

      <SummaryCards
        totalIncome={summary.totalIncome}
        totalExpenses={summary.totalExpenses}
        inventoryValue={summary.inventoryValue}
      />

      {/* Content */}
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
            title={emptyConfig[activeTab].title}
            description={emptyConfig[activeTab].description}
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
            type={activeTab === "expenses" ? "expense" : activeTab}
            onDelete={handleDelete}
          />
        )}
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      <AddModal
        type={modalType}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAdd}
      />
    </div>
  );
}
