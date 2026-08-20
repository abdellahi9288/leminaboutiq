"use client";

import { useCountUp } from "@/hooks/useCountUp";

interface SummaryCardsProps {
  totalIncome: number;
  totalExpenses: number;
  inventoryValue: number;
}

function AnimatedMRU({ value, delay }: { value: number; delay?: number }) {
  const animated = useCountUp(value, 900 + (delay || 0));
  return (
    <span className="nums">{new Intl.NumberFormat("fr-FR").format(animated)}</span>
  );
}

export default function SummaryCards({ totalIncome, totalExpenses, inventoryValue }: SummaryCardsProps) {
  const cards = [
    {
      label: "إجمالي الدخل",
      value: totalIncome,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
        </svg>
      ),
    },
    {
      label: "إجمالي المصاريف",
      value: totalExpenses,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
    },
    {
      label: "قيمة المخزون",
      value: inventoryValue,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 px-3 md:px-10 py-2 shrink-0">
      {cards.map((card, i) => (
        <div
          key={card.label}
          className={`rounded-2xl border p-3 text-center animate-fade-up stagger-${i + 1}`}
          style={{ background: "var(--card)", borderColor: "var(--border-light)" }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2"
            style={{ background: "var(--green-wash)", color: "var(--green-brand)" }}
          >
            {card.icon}
          </div>
          <p className="text-[11px] font-tajawal font-bold mb-1" style={{ color: "var(--text-muted)" }}>
            {card.label}
          </p>
          <p className="text-[18px] font-bold font-tajawal leading-tight" style={{ color: "var(--green-deep)" }}>
            <AnimatedMRU value={card.value} delay={i * 100} />
          </p>
          <span className="text-[10px] font-bold" style={{ color: "var(--gold)" }}>MRU</span>
        </div>
      ))}
    </div>
  );
}
