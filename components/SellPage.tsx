"use client";

import { useState } from "react";

interface InventoryItem {
  _id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  category: string;
}

interface SellPageProps {
  item: InventoryItem;
  onBack: () => void;
  onSell: (data: { inventoryItemId: string; quantity: number; salePrice: number }) => Promise<void>;
  onSellCredit: (data: { inventoryItemId: string; quantity: number; salePrice: number; customerName: string; customerPhone: string }) => Promise<void>;
}

function formatMRU(amount: number) {
  return new Intl.NumberFormat("fr-FR").format(amount);
}

export default function SellPage({ item, onBack, onSell, onSellCredit }: SellPageProps) {
  const [sellQty, setSellQty] = useState(1);
  const [sellPrice, setSellPrice] = useState(item.unitPrice);
  const [isCredit, setIsCredit] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const total = sellPrice * sellQty;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sellQty > item.quantity) {
      setError(`الكمية المتوفرة ${item.quantity} فقط`);
      return;
    }
    if (isCredit && (!customerName.trim() || !customerPhone.trim())) {
      setError("يجب إدخال اسم ورقم هاتف الزبون");
      return;
    }
    setSaving(true);
    setError("");

    if (isCredit) {
      await onSellCredit({
        inventoryItemId: item._id,
        quantity: sellQty,
        salePrice: total,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
      });
    } else {
      await onSell({
        inventoryItemId: item._id,
        quantity: sellQty,
        salePrice: total,
      });
    }
    setSaving(false);
  };

  const inputClass =
    "w-full border rounded-2xl px-4 py-3.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--green-brand)]/20 focus:border-[var(--green-brand)] transition-all nums";

  return (
    <div className="h-full w-full flex flex-col" style={{ background: "var(--sand)" }}>
      {/* Header */}
      <div className="border-b shrink-0 px-4 pt-4 pb-3 flex items-center justify-between" style={{ background: "var(--card)", borderColor: "var(--border-light)" }}>
        <button onClick={onBack} className="btn btn-outline-secondary btn-sm font-tajawal font-bold px-3">
          رجوع
        </button>
        <h2 className="text-[18px] font-bold font-tajawal" style={{ color: "var(--text-ink)" }}>بيع منتج</h2>
        <div className="w-16" />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-w-[480px] mx-auto">
          {/* Product card */}
          <div
            className="border rounded-2xl p-5 text-center"
            style={{ background: "var(--green-wash)", borderColor: "var(--border-light)" }}
          >
            <p className="text-[22px] font-bold font-tajawal" style={{ color: "var(--green-deep)" }}>{item.name}</p>
            <div className="flex items-center justify-center gap-4 mt-2">
              <span className="text-[13px] font-tajawal" style={{ color: "var(--text-muted)" }}>
                الفئة: <span className="font-bold">{item.category}</span>
              </span>
              <span className="text-[13px] font-tajawal" style={{ color: item.quantity <= 1 ? "#dc2626" : "var(--text-muted)" }}>
                متوفر: <span className="nums font-bold">{item.quantity}</span> وحدة
              </span>
            </div>
            <p className="mt-2 text-[15px] font-bold nums" style={{ color: "var(--green-brand)" }}>
              سعر الوحدة: {formatMRU(item.unitPrice)} MRU
            </p>
          </div>

          {/* Quantity + Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-tajawal font-bold mb-2 text-right" style={{ color: "var(--text-muted)" }}>الكمية</label>
              <input
                type="number" required min="1" max={item.quantity}
                value={sellQty}
                onChange={(e) => setSellQty(Number(e.target.value))}
                className={inputClass}
                style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--text-body)", textAlign: "center", fontSize: "18px" }}
              />
            </div>
            <div>
              <label className="block text-[13px] font-tajawal font-bold mb-2 text-right" style={{ color: "var(--text-muted)" }}>سعر البيع (MRU)</label>
              <input
                type="number" required min="0"
                value={sellPrice}
                onChange={(e) => setSellPrice(Number(e.target.value))}
                className={inputClass}
                style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--text-body)", textAlign: "center", fontSize: "18px" }}
              />
            </div>
          </div>

          {/* Total */}
          <div
            className="border rounded-2xl p-5 text-center"
            style={{ background: "var(--card)", borderColor: "var(--border-light)" }}
          >
            <p className="text-[12px] font-tajawal font-bold" style={{ color: "var(--text-faint)" }}>المبلغ الإجمالي</p>
            <p className="text-[34px] font-bold font-tajawal nums mt-1" style={{ color: "var(--green-deep)" }}>
              {formatMRU(total)}
            </p>
            <span className="text-[12px] font-bold" style={{ color: "var(--gold)" }}>MRU</span>
          </div>

          {/* Divider */}
          <div style={{ height: "1px", background: "var(--border-light)" }} />

          {/* Credit toggle */}
          <button
            type="button"
            onClick={() => setIsCredit(!isCredit)}
            className="w-full border rounded-2xl p-4 flex items-center justify-between font-tajawal font-bold text-[15px]"
            style={{
              background: isCredit ? "#fef3c7" : "var(--card)",
              borderColor: isCredit ? "#f59e0b" : "var(--border-light)",
              color: isCredit ? "#92400e" : "var(--text-muted)",
            }}
          >
            <div
              className="w-6 h-6 rounded-lg border-2 flex items-center justify-center"
              style={{
                borderColor: isCredit ? "#f59e0b" : "var(--border)",
                background: isCredit ? "#f59e0b" : "transparent",
              }}
            >
              {isCredit && <span className="text-white text-[14px]">✓</span>}
            </div>
            <span>بيع بالدين</span>
          </button>

          {/* Credit fields */}
          {isCredit && (
            <div className="space-y-3 animate-fade-up">
              <div
                className="rounded-2xl border p-4 space-y-3"
                style={{ background: "#fffbeb", borderColor: "#fde68a" }}
              >
                <p className="text-[13px] font-tajawal font-bold text-right" style={{ color: "#92400e" }}>معلومات الزبون المديون</p>
                <div>
                  <label className="block text-[12px] font-tajawal font-bold mb-1.5 text-right" style={{ color: "#92400e" }}>الاسم</label>
                  <input
                    type="text" required={isCredit} value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="اسم الزبون"
                    className="w-full border rounded-xl px-4 py-3 text-[14px] font-tajawal focus:outline-none focus:border-[#f59e0b]"
                    style={{ background: "white", borderColor: "#fde68a", color: "var(--text-body)" }}
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-tajawal font-bold mb-1.5 text-right" style={{ color: "#92400e" }}>رقم الهاتف</label>
                  <input
                    type="tel" required={isCredit} value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="مثال: 36271730"
                    dir="ltr"
                    className="w-full border rounded-xl px-4 py-3 text-[14px] nums focus:outline-none focus:border-[#f59e0b]"
                    style={{ background: "white", borderColor: "#fde68a", color: "var(--text-body)" }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-[13px] font-tajawal font-bold text-center" style={{ color: "#dc2626" }}>{error}</p>
          )}

          {/* Submit button */}
          <div className="pt-2 pb-4">
            <button
              type="submit" disabled={saving}
              className="btn btn-success btn-lg w-100 font-tajawal font-bold"
              style={{ padding: "14px", fontSize: "16px" }}
            >
              {saving ? (
                <span className="d-flex align-items-center justify-content-center gap-2">
                  <span className="spinner-border spinner-border-sm" />
                  {isCredit ? "جاري تسجيل الدين..." : "جاري البيع..."}
                </span>
              ) : isCredit ? "تأكيد البيع بالدين" : "تأكيد البيع"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
