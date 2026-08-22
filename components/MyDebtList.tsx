"use client";

import { useState } from "react";
import { TrashIcon } from "./Icons";

interface Payment {
  amount: number;
  date: string;
}

interface MyDebtItem {
  _id: string;
  creditorName: string;
  creditorPhone: string;
  debtName: string;
  totalAmount: number;
  remainingAmount: number;
  payments: Payment[];
  date: string;
}

interface MyDebtListProps {
  items: MyDebtItem[];
  onPay: (debtId: string, amount: number) => Promise<void>;
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

export default function MyDebtList({ items, onPay, onDelete }: MyDebtListProps) {
  const [payingId, setPayingId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payError, setPayError] = useState("");
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handlePay = async (debt: MyDebtItem) => {
    const amount = Number(payAmount);
    if (!amount || amount <= 0) {
      setPayError("يجب إدخال مبلغ صحيح");
      return;
    }
    if (amount > debt.remainingAmount) {
      setPayError(`المبلغ المتبقي ${formatMRU(debt.remainingAmount)} فقط`);
      return;
    }
    setSaving(true);
    setPayError("");
    await onPay(debt._id, amount);
    setSaving(false);
    setPayingId(null);
    setPayAmount("");
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 animate-fade-up">
        <h3 className="text-[18px] font-bold font-tajawal" style={{ color: "var(--text-ink)" }}>
          لا توجد ديون عليك
        </h3>
        <p className="text-[14px] mt-2 text-center max-w-[280px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
          أضف الديون التي عليك لتتبع مدفوعاتك.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5 px-3 md:px-10">
      {items.map((debt, i) => {
        const isPaid = debt.remainingAmount === 0;
        const paidPercent = ((debt.totalAmount - debt.remainingAmount) / debt.totalAmount) * 100;

        return (
          <div
            key={debt._id}
            className="border rounded-2xl animate-fade-up"
            style={{
              background: isPaid ? "#f0fdf4" : "var(--card)",
              borderColor: isPaid ? "#86efac" : "var(--border-light)",
              animationDelay: `${i * 50}ms`,
            }}
          >
            <div className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <button
                  onClick={() => onDelete(debt._id)}
                  className="btn btn-outline-danger btn-sm border-0 p-1 shrink-0"
                >
                  <TrashIcon />
                </button>
                <div className="text-right flex-1 min-w-0">
                  <p className="text-[16px] font-bold font-tajawal" style={{ color: "var(--text-ink)" }}>
                    {debt.creditorName}
                  </p>
                  <div className="flex items-center justify-end gap-2 mt-0.5">
                    <span className="text-[12px]" style={{ color: "var(--text-faint)" }}>
                      {formatDate(debt.date)}
                    </span>
                    {debt.creditorPhone && (
                      <span className="text-[12px] nums" dir="ltr" style={{ color: "var(--text-muted)" }}>
                        {debt.creditorPhone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Debt name */}
              <div className="rounded-xl p-2.5 mb-3" style={{ background: "#fef3c7", borderColor: "#fde68a" }}>
                <p className="text-[13px] font-tajawal font-bold text-center" style={{ color: "#92400e" }}>
                  {debt.debtName}
                </p>
              </div>

              {/* Progress bar */}
              <div className="rounded-full h-2 mb-2" style={{ background: "var(--sand-dark)" }}>
                <div
                  className="rounded-full h-2 transition-all"
                  style={{ width: `${paidPercent}%`, background: isPaid ? "#22c55e" : "#f59e0b" }}
                />
              </div>

              {/* Amounts */}
              <div className="grid grid-cols-3 gap-2 text-center mb-2">
                <div>
                  <p className="text-[10px] font-tajawal font-bold" style={{ color: "var(--text-faint)" }}>إجمالي الدين</p>
                  <p className="text-[14px] font-bold nums" style={{ color: "var(--text-ink)" }}>
                    {formatMRU(debt.totalAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-tajawal font-bold" style={{ color: "var(--text-faint)" }}>تم الدفع</p>
                  <p className="text-[14px] font-bold nums" style={{ color: "#059669" }}>
                    {formatMRU(debt.totalAmount - debt.remainingAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-tajawal font-bold" style={{ color: "var(--text-faint)" }}>المتبقي</p>
                  <p className="text-[14px] font-bold nums" style={{ color: isPaid ? "#22c55e" : "#dc2626" }}>
                    {isPaid ? "0" : formatMRU(debt.remainingAmount)}
                  </p>
                </div>
              </div>

              {isPaid && (
                <p className="text-center text-[13px] font-tajawal font-bold mb-2" style={{ color: "#22c55e" }}>
                  تم السداد بالكامل
                </p>
              )}

              {/* Actions */}
              {!isPaid && (
                <div className="flex gap-2 mt-2">
                  {payingId === debt._id ? (
                    <div className="flex-1">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="1"
                          max={debt.remainingAmount}
                          value={payAmount}
                          onChange={(e) => { setPayAmount(e.target.value); setPayError(""); }}
                          placeholder="المبلغ"
                          className="flex-1 border rounded-xl px-3 py-2 text-[13px] nums focus:outline-none focus:border-[#f59e0b]"
                          style={{ background: "var(--cream)", borderColor: "var(--border)", color: "var(--text-body)" }}
                        />
                        <button
                          onClick={() => handlePay(debt)}
                          disabled={saving}
                          className="btn btn-warning btn-sm font-tajawal font-bold px-3"
                        >
                          {saving ? "..." : "دفع"}
                        </button>
                        <button
                          onClick={() => { setPayingId(null); setPayError(""); }}
                          className="btn btn-outline-secondary btn-sm px-2"
                        >
                          ✕
                        </button>
                      </div>
                      {payError && <p className="text-[11px] font-tajawal mt-1" style={{ color: "#dc2626" }}>{payError}</p>}
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => { setPayingId(debt._id); setPayAmount(""); setPayError(""); }}
                        className="btn btn-warning btn-sm flex-1 font-tajawal font-bold"
                      >
                        تسجيل دفعة
                      </button>
                      <button
                        onClick={() => setExpandedId(expandedId === debt._id ? null : debt._id)}
                        className="btn btn-outline-secondary btn-sm font-tajawal font-bold px-3"
                      >
                        {expandedId === debt._id ? "إخفاء" : "السجل"}
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Payment history */}
              {(expandedId === debt._id || isPaid) && debt.payments.length > 0 && (
                <div className="mt-3 pt-2" style={{ borderTop: "1px solid var(--border-light)" }}>
                  <p className="text-[11px] font-tajawal font-bold mb-2" style={{ color: "var(--text-faint)" }}>سجل الدفعات</p>
                  {debt.payments.map((p, j) => (
                    <div key={j} className="flex items-center justify-between py-1" dir="rtl">
                      <span className="text-[12px]" style={{ color: "var(--text-faint)" }}>
                        {formatDate(p.date)}
                      </span>
                      <span className="text-[13px] font-bold nums" style={{ color: "#059669" }}>
                        +{formatMRU(p.amount)} MRU
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
