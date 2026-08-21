"use client";

import { useState, useEffect } from "react";
import { XMarkIcon } from "./Icons";

type ModalType = "income" | "expense" | "inventory";

interface InventoryItem {
  _id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  category: string;
}

interface AddModalProps {
  type: ModalType;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Record<string, string | number>) => void;
  onSell?: (data: { inventoryItemId: string; quantity: number; salePrice: number }) => void;
  onSellCredit?: (data: { inventoryItemId: string; quantity: number; salePrice: number; customerName: string; customerPhone: string }) => void;
}

const categoryOptions = {
  income: ["بيع", "خدمة", "أخرى"],
  expense: ["إيجار", "نقل", "فاتورة", "شراء بضاعة", "أخرى"],
  inventory: ["عام"],
};

const titles = {
  income: "بيع منتج",
  expense: "إضافة مصروف",
  inventory: "إضافة منتج",
};

export default function AddModal({ type, isOpen, onClose, onSave, onSell, onSellCredit }: AddModalProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [sellQty, setSellQty] = useState(1);
  const [sellPrice, setSellPrice] = useState(0);
  const [isCredit, setIsCredit] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && type === "income") {
      fetch("/api/inventory")
        .then((r) => r.json())
        .then((data) => setInventoryItems(data.filter((i: InventoryItem) => i.quantity > 0)))
        .catch(() => setInventoryItems([]));
    }
    if (isOpen) {
      setFormData({});
      setSelectedItem(null);
      setSellQty(1);
      setSellPrice(0);
      setIsCredit(false);
      setCustomerName("");
      setCustomerPhone("");
      setError("");
    }
  }, [isOpen, type]);

  if (!isOpen) return null;

  const handleSelectItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setSellQty(1);
    setSellPrice(item.unitPrice);
    setError("");
  };

  const handleSell = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    if (sellQty > selectedItem.quantity) {
      setError(`الكمية المتوفرة ${selectedItem.quantity} فقط`);
      return;
    }
    if (isCredit && (!customerName.trim() || !customerPhone.trim())) {
      setError("يجب إدخال اسم ورقم هاتف الزبون");
      return;
    }
    setSaving(true);
    setError("");

    if (isCredit && onSellCredit) {
      await onSellCredit({
        inventoryItemId: selectedItem._id,
        quantity: sellQty,
        salePrice: sellPrice * sellQty,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
      });
    } else if (onSell) {
      await onSell({
        inventoryItemId: selectedItem._id,
        quantity: sellQty,
        salePrice: sellPrice * sellQty,
      });
    }
    setSaving(false);
    setSelectedItem(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const data: Record<string, string | number> = { ...formData };
    if (data.amount) data.amount = Number(data.amount);
    if (data.quantity) data.quantity = Number(data.quantity);
    if (data.unitPrice) data.unitPrice = Number(data.unitPrice);
    await onSave(data);
    setFormData({});
    setSaving(false);
    onClose();
  };

  const inputClass =
    "w-full border rounded-2xl px-5 py-4 text-[14px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[var(--green-brand)]/20 focus:border-[var(--green-brand)] transition-all placeholder:text-[var(--text-faint)]";

  return (
    <div
      className="fixed inset-0 flex items-end md:items-center justify-center z-50"
      style={{ background: "rgba(28,20,16,0.35)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="rounded-t-[28px] md:rounded-[28px] w-full max-w-[480px] p-8 animate-slide-up md:mx-5 border"
        style={{ background: "var(--card)", borderColor: "var(--border-light)", maxHeight: "85vh", overflowY: "auto" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onClose}
            className="btn btn-light btn-sm border-0"
            style={{ color: "var(--text-faint)" }}
          >
            <XMarkIcon />
          </button>
          <h2 className="text-[20px] font-bold font-tajawal" style={{ color: "var(--text-ink)" }}>
            {titles[type]}
          </h2>
          <div className="w-10" />
        </div>

        {/* Income = sell from inventory */}
        {type === "income" && !selectedItem && (
          <div>
            {inventoryItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[16px] font-bold font-tajawal" style={{ color: "var(--text-ink)" }}>لا توجد منتجات في المخزون</p>
                <p className="text-[13px] mt-2" style={{ color: "var(--text-muted)" }}>أضف منتجات في قسم المخزون أولاً</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[13px] font-tajawal font-bold mb-3" style={{ color: "var(--text-muted)" }}>اختر المنتج للبيع</p>
                {inventoryItems.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => handleSelectItem(item)}
                    className="w-full border rounded-2xl p-4 flex items-center justify-between text-right transition-all"
                    style={{
                      background: item.quantity <= 1 ? "#fef2f2" : "var(--cream)",
                      borderColor: item.quantity <= 1 ? "#fca5a5" : "var(--border)",
                    }}
                  >
                    <div className="text-left shrink-0">
                      <span className="text-[14px] font-bold nums" style={{ color: "var(--green-deep)" }}>
                        {new Intl.NumberFormat("fr-FR").format(item.unitPrice)}
                      </span>
                      <span className="text-[9px] font-bold mr-0.5" style={{ color: "var(--gold)" }}> MRU</span>
                    </div>
                    <div>
                      <p className="text-[15px] font-bold font-tajawal" style={{ color: "var(--text-ink)" }}>{item.name}</p>
                      <p className="text-[12px] mt-0.5" style={{ color: item.quantity <= 1 ? "#dc2626" : "var(--text-muted)" }}>
                        <span className="nums">{item.quantity}</span> وحدة متوفرة
                        {item.quantity <= 1 && " ⚠️"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Income = sell confirmation form */}
        {type === "income" && selectedItem && (
          <form onSubmit={handleSell} className="space-y-4">
            <div
              className="border rounded-2xl p-4 text-center"
              style={{ background: "var(--green-wash)", borderColor: "var(--border-light)" }}
            >
              <p className="text-[18px] font-bold font-tajawal" style={{ color: "var(--green-deep)" }}>{selectedItem.name}</p>
              <p className="text-[13px] mt-1" style={{ color: "var(--text-muted)" }}>
                متوفر: <span className="nums font-bold" style={{ color: selectedItem.quantity <= 1 ? "#dc2626" : "var(--green-brand)" }}>{selectedItem.quantity}</span> وحدة
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-tajawal font-bold mb-2" style={{ color: "var(--text-muted)" }}>الكمية</label>
                <input
                  type="number" required min="1" max={selectedItem.quantity}
                  value={sellQty}
                  onChange={(e) => { setSellQty(Number(e.target.value)); }}
                  className={inputClass}
                  style={{ background: "var(--cream)", borderColor: "var(--border)", color: "var(--text-body)" }}
                />
              </div>
              <div>
                <label className="block text-[13px] font-tajawal font-bold mb-2" style={{ color: "var(--text-muted)" }}>سعر البيع (MRU)</label>
                <input
                  type="number" required min="0"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(Number(e.target.value))}
                  className={inputClass}
                  style={{ background: "var(--cream)", borderColor: "var(--border)", color: "var(--text-body)" }}
                />
              </div>
            </div>

            <div
              className="border rounded-2xl p-3 text-center"
              style={{ background: "var(--cream)", borderColor: "var(--border-light)" }}
            >
              <p className="text-[12px] font-tajawal font-bold" style={{ color: "var(--text-muted)" }}>المبلغ الإجمالي</p>
              <p className="text-[26px] font-bold font-tajawal nums mt-1" style={{ color: "var(--green-deep)" }}>
                {new Intl.NumberFormat("fr-FR").format(sellPrice * sellQty)}
              </p>
              <span className="text-[11px] font-bold" style={{ color: "var(--gold)" }}>MRU</span>
            </div>

            {/* Credit sale toggle */}
            <button
              type="button"
              onClick={() => setIsCredit(!isCredit)}
              className={`w-full border rounded-2xl p-3.5 flex items-center justify-between font-tajawal font-bold text-[14px] transition-all ${isCredit ? "" : ""}`}
              style={{
                background: isCredit ? "#fef3c7" : "var(--cream)",
                borderColor: isCredit ? "#f59e0b" : "var(--border)",
                color: isCredit ? "#92400e" : "var(--text-muted)",
              }}
            >
              <span className="text-[18px]">{isCredit ? "✓" : "○"}</span>
              <span>بيع بالدين</span>
            </button>

            {/* Credit customer fields */}
            {isCredit && (
              <div className="space-y-3 animate-fade-up">
                <div>
                  <label className="block text-[13px] font-tajawal font-bold mb-2" style={{ color: "var(--text-muted)" }}>اسم الزبون</label>
                  <input
                    type="text" required={isCredit} value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className={inputClass} placeholder="أدخل اسم الزبون"
                    style={{ background: "var(--cream)", borderColor: "var(--border)", color: "var(--text-body)" }}
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-tajawal font-bold mb-2" style={{ color: "var(--text-muted)" }}>رقم الهاتف</label>
                  <input
                    type="tel" required={isCredit} value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className={inputClass} placeholder="مثال: 36271730"
                    dir="ltr"
                    style={{ background: "var(--cream)", borderColor: "var(--border)", color: "var(--text-body)" }}
                  />
                </div>
              </div>
            )}

            {error && (
              <p className="text-[13px] font-tajawal font-bold text-center" style={{ color: "#dc2626" }}>{error}</p>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="btn btn-outline-secondary flex-1 font-tajawal font-bold"
              >
                رجوع
              </button>
              <button
                type="submit" disabled={saving}
                className="btn btn-success flex-1 font-tajawal font-bold"
              >
                {saving ? (
                  <span className="d-flex align-items-center justify-content-center gap-2">
                    <span className="spinner-border spinner-border-sm" />
                    {isCredit ? "جاري التسجيل..." : "جاري البيع..."}
                  </span>
                ) : isCredit ? "تأكيد البيع بالدين" : "تأكيد البيع"}
              </button>
            </div>
          </form>
        )}

        {/* Expense form */}
        {type === "expense" && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[13px] font-tajawal font-bold mb-2.5" style={{ color: "var(--text-muted)" }}>المبلغ (MRU)</label>
              <input
                type="number" required min="1" value={formData.amount || ""}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className={inputClass} placeholder="0"
                style={{ background: "var(--cream)", borderColor: "var(--border)", color: "var(--text-body)" }}
              />
            </div>
            <div>
              <label className="block text-[13px] font-tajawal font-bold mb-2.5" style={{ color: "var(--text-muted)" }}>الوصف</label>
              <input
                type="text" required value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={inputClass} placeholder="وصف المصروف"
                style={{ background: "var(--cream)", borderColor: "var(--border)", color: "var(--text-body)" }}
              />
            </div>
            <div>
              <label className="block text-[13px] font-tajawal font-bold mb-2.5" style={{ color: "var(--text-muted)" }}>الفئة</label>
              <select
                value={formData.category || categoryOptions.expense[0]}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className={inputClass}
                style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--text-body)" }}
              >
                {categoryOptions.expense.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-tajawal font-bold mb-2.5" style={{ color: "var(--text-muted)" }}>التاريخ</label>
              <input
                type="date" value={formData.date || new Date().toISOString().split("T")[0]}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={inputClass}
                style={{ background: "var(--cream)", borderColor: "var(--border)", color: "var(--text-body)" }}
              />
            </div>
            <div className="pt-3">
              <button
                type="submit" disabled={saving}
                className="btn btn-success btn-lg w-100 font-tajawal font-bold"
              >
                {saving ? (
                  <span className="d-flex align-items-center justify-content-center gap-2">
                    <span className="spinner-border spinner-border-sm" />
                    جاري الحفظ...
                  </span>
                ) : "حفظ"}
              </button>
            </div>
          </form>
        )}

        {/* Inventory form */}
        {type === "inventory" && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[13px] font-tajawal font-bold mb-2.5" style={{ color: "var(--text-muted)" }}>اسم المنتج</label>
              <input
                type="text" required value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={inputClass} placeholder="أدخل اسم المنتج"
                style={{ background: "var(--cream)", borderColor: "var(--border)", color: "var(--text-body)" }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-tajawal font-bold mb-2.5" style={{ color: "var(--text-muted)" }}>الكمية</label>
                <input
                  type="number" required min="0" value={formData.quantity || ""}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className={inputClass} placeholder="0"
                  style={{ background: "var(--cream)", borderColor: "var(--border)", color: "var(--text-body)" }}
                />
              </div>
              <div>
                <label className="block text-[13px] font-tajawal font-bold mb-2.5" style={{ color: "var(--text-muted)" }}>سعر الوحدة (MRU)</label>
                <input
                  type="number" required min="0" value={formData.unitPrice || ""}
                  onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                  className={inputClass} placeholder="0"
                  style={{ background: "var(--cream)", borderColor: "var(--border)", color: "var(--text-body)" }}
                />
              </div>
            </div>
            <div>
              <label className="block text-[13px] font-tajawal font-bold mb-2.5" style={{ color: "var(--text-muted)" }}>الفئة</label>
              <input
                type="text" value={formData.category || ""}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className={inputClass} placeholder="عام"
                style={{ background: "var(--cream)", borderColor: "var(--border)", color: "var(--text-body)" }}
              />
            </div>
            <div className="pt-3">
              <button
                type="submit" disabled={saving}
                className="btn btn-success btn-lg w-100 font-tajawal font-bold"
              >
                {saving ? (
                  <span className="d-flex align-items-center justify-content-center gap-2">
                    <span className="spinner-border spinner-border-sm" />
                    جاري الحفظ...
                  </span>
                ) : "حفظ"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
