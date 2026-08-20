"use client";

import { TrashIcon } from "./Icons";

interface Item {
  _id: string;
  amount?: number;
  description?: string;
  name?: string;
  quantity?: number;
  unitPrice?: number;
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
    year: "numeric",
  });
}

export default function ItemList({ items, type, onDelete }: ItemListProps) {
  return (
    <div className="space-y-3.5 px-5 md:px-10">
      {items.map((item, i) => (
        <div
          key={item._id}
          className="border rounded-[20px] p-5 flex items-center justify-between transition-all duration-200 animate-fade-up"
          style={{
            background: "var(--card)",
            borderColor: "var(--border-light)",
            animationDelay: `${i * 50}ms`,
          }}
        >
          {/* Delete */}
          <button
            onClick={() => onDelete(item._id)}
            className="btn btn-outline-danger btn-sm border-0"
          >
            <TrashIcon />
          </button>

          {/* Info */}
          <div className="flex-1 text-right mr-4">
            {type === "inventory" ? (
              <>
                <p className="text-[15px] font-bold font-tajawal" style={{ color: "var(--text-ink)" }}>
                  {item.name}
                </p>
                <p className="text-[13px] mt-1.5 leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  <span className="nums">{item.quantity}</span> وحدة &times; <span className="nums">{formatMRU(item.unitPrice || 0)}</span> MRU
                </p>
              </>
            ) : (
              <>
                <p className="text-[15px] font-bold font-tajawal" style={{ color: "var(--text-ink)" }}>
                  {item.description}
                </p>
                <div className="flex items-center justify-end gap-2.5 mt-2">
                  <span className="text-[12px]" style={{ color: "var(--text-faint)" }}>
                    {formatDate(item.date || item.createdAt)}
                  </span>
                  <span
                    className="text-[11px] px-3 py-1 rounded-full font-tajawal font-bold"
                    style={{ background: "var(--sand)", color: "var(--text-muted)" }}
                  >
                    {item.category}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Amount */}
          <div className="min-w-[100px] text-left">
            <span
              className="text-[16px] font-bold font-tajawal nums"
              style={{ color: "var(--green-deep)" }}
            >
              {type === "inventory"
                ? formatMRU((item.quantity || 0) * (item.unitPrice || 0))
                : formatMRU(item.amount || 0)}
            </span>
            <span className="text-[11px] mr-1" style={{ color: "var(--gold)" }}> MRU</span>
          </div>
        </div>
      ))}
    </div>
  );
}
