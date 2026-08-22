"use client";

import { useState } from "react";
import { XMarkIcon } from "./Icons";

interface MyDebtModalProps {
  onClose: () => void;
  onSave: (data: Record<string, string | number>) => void;
}

export default function MyDebtModal({ onClose, onSave }: MyDebtModalProps) {
  const [creditorName, setCreditorName] = useState("");
  const [creditorPhone, setCreditorPhone] = useState("");
  const [debtName, setDebtName] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave({
      creditorName,
      creditorPhone,
      debtName,
      totalAmount: Number(totalAmount),
      date,
    });
    setSaving(false);
  };

  const inputClass =
    "w-full border rounded-2xl px-5 py-4 text-[14px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/20 focus:border-[#f59e0b] transition-all placeholder:text-[var(--text-faint)]";

  return (
    <div
      className="fixed inset-0 flex items-end md:items-center justify-center z-50"
      style={{ background: "rgba(28,20,16,0.35)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="rounded-t-[28px] md:rounded-[28px] w-full max-w-[480px] p-8 animate-slide-up md:mx-5 border"
        style={{ background: "var(--card)", borderColor: "var(--border-light)", maxHeight: "85vh", overflowY: "auto" }}
      >
        <div className="flex items-center justify-between mb-6">
          <button onClick={onClose} className="btn btn-light btn-sm border-0" style={{ color: "var(--text-faint)" }}>
            <XMarkIcon />
          </button>
          <h2 className="text-[20px] font-bold font-tajawal" style={{ color: "var(--text-ink)" }}>
            إضافة دين
          </h2>
          <div className="w-10" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[13px] font-tajawal font-bold mb-2.5" style={{ color: "var(--text-muted)" }}>اسم الدائن</label>
            <input
              type="text" required value={creditorName}
              onChange={(e) => setCreditorName(e.target.value)}
              className={inputClass} placeholder="من عليك الدين؟"
              style={{ background: "var(--cream)", borderColor: "var(--border)", color: "var(--text-body)" }}
            />
          </div>
          <div>
            <label className="block text-[13px] font-tajawal font-bold mb-2.5" style={{ color: "var(--text-muted)" }}>رقم هاتف الدائن</label>
            <input
              type="tel" value={creditorPhone}
              onChange={(e) => setCreditorPhone(e.target.value)}
              className={inputClass} placeholder="اختياري" dir="ltr"
              style={{ background: "var(--cream)", borderColor: "var(--border)", color: "var(--text-body)" }}
            />
          </div>
          <div>
            <label className="block text-[13px] font-tajawal font-bold mb-2.5" style={{ color: "var(--text-muted)" }}>اسم الدين / الوصف</label>
            <input
              type="text" required value={debtName}
              onChange={(e) => setDebtName(e.target.value)}
              className={inputClass} placeholder="مثال: شراء بضاعة، قرض..."
              style={{ background: "var(--cream)", borderColor: "var(--border)", color: "var(--text-body)" }}
            />
          </div>
          <div>
            <label className="block text-[13px] font-tajawal font-bold mb-2.5" style={{ color: "var(--text-muted)" }}>المبلغ (MRU)</label>
            <input
              type="number" required min="1" value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              className={inputClass} placeholder="0"
              style={{ background: "var(--cream)", borderColor: "var(--border)", color: "var(--text-body)" }}
            />
          </div>
          <div>
            <label className="block text-[13px] font-tajawal font-bold mb-2.5" style={{ color: "var(--text-muted)" }}>التاريخ</label>
            <input
              type="date" value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
              style={{ background: "var(--cream)", borderColor: "var(--border)", color: "var(--text-body)" }}
            />
          </div>
          <div className="pt-3">
            <button
              type="submit" disabled={saving}
              className="btn btn-warning btn-lg w-100 font-tajawal font-bold"
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
