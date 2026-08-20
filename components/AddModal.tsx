"use client";

import { useState } from "react";
import { XMarkIcon } from "./Icons";

type ModalType = "income" | "expense" | "inventory";

interface AddModalProps {
  type: ModalType;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Record<string, string | number>) => void;
}

const categoryOptions = {
  income: ["بيع", "خدمة", "أخرى"],
  expense: ["إيجار", "نقل", "فاتورة", "شراء بضاعة", "أخرى"],
  inventory: ["عام"],
};

const titles = {
  income: "إضافة دخل",
  expense: "إضافة مصروف",
  inventory: "إضافة منتج",
};

export default function AddModal({ type, isOpen, onClose, onSave }: AddModalProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

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
        style={{ background: "var(--card)", borderColor: "var(--border-light)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {type === "inventory" ? (
            <>
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
            </>
          ) : (
            <>
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
                  className={inputClass} placeholder={type === "income" ? "وصف الدخل" : "وصف المصروف"}
                  style={{ background: "var(--cream)", borderColor: "var(--border)", color: "var(--text-body)" }}
                />
              </div>
              <div>
                <label className="block text-[13px] font-tajawal font-bold mb-2.5" style={{ color: "var(--text-muted)" }}>الفئة</label>
                <select
                  value={formData.category || categoryOptions[type][0]}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={inputClass}
                  style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--text-body)" }}
                >
                  {categoryOptions[type].map((cat) => (
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
            </>
          )}

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
      </div>
    </div>
  );
}
