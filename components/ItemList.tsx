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
  });
}

export default function ItemList({ items, type, onDelete }: ItemListProps) {
  return (
    <div className="space-y-2 px-3 md:px-10">
      {items.map((item, i) => (
        <div
          key={item._id}
          className="border rounded-2xl p-3 md:p-5 flex items-center justify-between transition-all duration-200 animate-fade-up"
          style={{
            background: "var(--card)",
            borderColor: "var(--border-light)",
            animationDelay: `${i * 50}ms`,
          }}
        >
          {/* Delete */}
          <button
            onClick={() => onDelete(item._id)}
            className="btn btn-outline-danger btn-sm border-0 p-1"
          >
            <TrashIcon />
          </button>

          {/* Info */}
          <div className="flex-1 text-right mr-2 min-w-0">
            {type === "inventory" ? (
              <>
                <p className="text-[13px] md:text-[15px] font-bold font-tajawal truncate" style={{ color: "var(--text-ink)" }}>
                  {item.name}
                </p>
                <p className="text-[11px] md:text-[13px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                  <span className="nums">{item.quantity}</span> x <span className="nums">{formatMRU(item.unitPrice || 0)}</span>
                </p>
              </>
            ) : (
              <>
                <p className="text-[13px] md:text-[15px] font-bold font-tajawal truncate" style={{ color: "var(--text-ink)" }}>
                  {item.description}
                </p>
                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                  <span className="text-[10px] md:text-[12px]" style={{ color: "var(--text-faint)" }}>
                    {formatDate(item.date || item.createdAt)}
                  </span>
                  <span
                    className="text-[9px] md:text-[11px] px-2 py-0.5 rounded-full font-tajawal font-bold"
                    style={{ background: "var(--sand)", color: "var(--text-muted)" }}
                  >
                    {item.category}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Amount */}
          <div className="text-left shrink-0">
            <span
              className="text-[13px] md:text-[16px] font-bold font-tajawal nums"
              style={{ color: "var(--green-deep)" }}
            >
              {type === "inventory"
                ? formatMRU((item.quantity || 0) * (item.unitPrice || 0))
                : formatMRU(item.amount || 0)}
            </span>
            <span className="text-[9px] md:text-[11px] mr-0.5" style={{ color: "var(--gold)" }}> MRU</span>
          </div>
        </div>
      ))}
    </div>
  );
}
