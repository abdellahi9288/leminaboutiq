"use client";

import { TrashIcon } from "./Icons";

interface Item {
  _id: string;
  amount?: number;
  description?: string;
  name?: string;
  quantity?: number;
  unitPrice?: number;
  sold?: number;
  category: string;
  date?: string;
  createdAt: string;
}

interface ItemListProps {
  items: Item[];
  type: "income" | "expense" | "inventory";
  onDelete: (id: string) => void;
}

function formatMRU(amount: number) {
  return new Intl.NumberFormat("fr-FR").format(amount);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ar-MR", {
    day: "numeric",
    month: "short",
  });
}

function formatFullDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ar-MR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ItemList({ items, type, onDelete }: ItemListProps) {
  return (
    <div className="space-y-2.5 px-3 md:px-10">
      {items.map((item, i) => (
        <div
          key={item._id}
          className="border rounded-2xl animate-fade-up"
          style={{
            background: type === "inventory" && (item.quantity || 0) <= 1 ? "#fef2f2" : "var(--card)",
            borderColor: type === "inventory" && (item.quantity || 0) <= 1 ? "#fca5a5" : "var(--border-light)",
            animationDelay: `${i * 50}ms`,
          }}
        >
          {type === "inventory" ? (
            <div className="p-4">
              {/* Top row: name + delete */}
              <div className="flex items-start justify-between mb-3">
                <button
                  onClick={() => onDelete(item._id)}
                  className="btn btn-outline-danger btn-sm border-0 p-1 shrink-0"
                >
                  <TrashIcon />
                </button>
                <div className="text-right flex-1 min-w-0">
                  <p className="text-[16px] font-bold font-tajawal truncate" style={{ color: "var(--text-ink)" }}>
                    {item.name}
                  </p>
                  <div className="flex items-center justify-end gap-2 mt-1">
                    <span className="text-[11px]" style={{ color: "var(--text-faint)" }}>
                      {formatFullDate(item.date || item.createdAt)}
                    </span>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-tajawal font-bold"
                      style={{ background: "var(--sand)", color: "var(--text-muted)" }}
                    >
                      {item.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl p-2.5" style={{ background: "var(--cream)" }}>
                  <p className="text-[10px] font-tajawal font-bold mb-1" style={{ color: "var(--text-faint)" }}>سعر الوحدة</p>
                  <p className="text-[14px] font-bold nums" style={{ color: "var(--green-deep)" }}>
                    {formatMRU(item.unitPrice || 0)}
                  </p>
                </div>
                <div className="rounded-xl p-2.5" style={{ background: (item.sold || 0) > 0 ? "#f0fdf4" : "var(--cream)" }}>
                  <p className="text-[10px] font-tajawal font-bold mb-1" style={{ color: "var(--text-faint)" }}>تم البيع</p>
                  <p className="text-[14px] font-bold nums" style={{ color: (item.sold || 0) > 0 ? "#059669" : "var(--text-muted)" }}>
                    {item.sold || 0}
                  </p>
                </div>
                <div
                  className="rounded-xl p-2.5"
                  style={{
                    background: (item.quantity || 0) <= 1 ? "#fef2f2" : "var(--cream)",
                  }}
                >
                  <p className="text-[10px] font-tajawal font-bold mb-1" style={{ color: "var(--text-faint)" }}>المتبقي</p>
                  <p className="text-[14px] font-bold nums" style={{ color: (item.quantity || 0) <= 1 ? "#dc2626" : "var(--text-ink)" }}>
                    {item.quantity || 0}
                  </p>
                </div>
              </div>

              {/* Total value + warning */}
              <div className="flex items-center justify-between mt-3 pt-2" style={{ borderTop: "1px solid var(--border-light)" }}>
                {(item.quantity || 0) === 0 ? (
                  <span className="text-[12px] font-tajawal font-bold" style={{ color: "#dc2626" }}>نفد المخزون</span>
                ) : (item.quantity || 0) === 1 ? (
                  <span className="text-[12px] font-tajawal font-bold" style={{ color: "#dc2626" }}>⚠️ آخر وحدة</span>
                ) : (
                  <span />
                )}
                <div className="text-left">
                  <span className="text-[10px] font-tajawal font-bold" style={{ color: "var(--text-faint)" }}>القيمة الإجمالية </span>
                  <span className="text-[16px] font-bold nums" style={{ color: "var(--green-deep)" }}>
                    {formatMRU((item.quantity || 0) * (item.unitPrice || 0))}
                  </span>
                  <span className="text-[9px] font-bold mr-0.5" style={{ color: "var(--gold)" }}> MRU</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 flex items-center justify-between">
              {/* Delete */}
              <button
                onClick={() => onDelete(item._id)}
                className="btn btn-outline-danger btn-sm border-0 p-1 shrink-0"
              >
                <TrashIcon />
              </button>

              {/* Info */}
              <div className="flex-1 text-right mr-3 min-w-0">
                <p className="text-[15px] font-bold font-tajawal truncate" style={{ color: "var(--text-ink)" }}>
                  {item.description}
                </p>
                <div className="flex items-center justify-end gap-2 mt-1">
                  <span className="text-[12px]" style={{ color: "var(--text-faint)" }}>
                    {formatDate(item.date || item.createdAt)}
                  </span>
                  <span
                    className="text-[11px] px-2.5 py-0.5 rounded-full font-tajawal font-bold"
                    style={{ background: "var(--sand)", color: "var(--text-muted)" }}
                  >
                    {item.category}
                  </span>
                </div>
              </div>

              {/* Amount */}
              <div className="text-left shrink-0">
                <span
                  className="text-[16px] font-bold font-tajawal nums"
                  style={{ color: "var(--green-deep)" }}
                >
                  {formatMRU(item.amount || 0)}
                </span>
                <span className="text-[10px] mr-1 font-bold" style={{ color: "var(--gold)" }}> MRU</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
