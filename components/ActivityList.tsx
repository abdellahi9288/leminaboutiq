"use client";

interface ActivityItem {
  _id: string;
  type: "income" | "expense" | "inventory";
  description: string;
  amount: number;
  category: string;
  date: string;
}

interface ActivityListProps {
  items: ActivityItem[];
}

function formatMRU(amount: number) {
  return new Intl.NumberFormat("fr-FR").format(amount);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ar-MR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const typeConfig = {
  income: {
    label: "دخل",
    color: "#059669",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
  },
  expense: {
    label: "مصروف",
    color: "#dc3545",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  inventory: {
    label: "مخزون",
    color: "#2563eb",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
      </svg>
    ),
  },
};

export default function ActivityList({ items }: ActivityListProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 animate-fade-up">
        <h3 className="text-[18px] font-bold font-tajawal" style={{ color: "var(--text-ink)" }}>
          لا توجد حركات
        </h3>
        <p className="text-[14px] mt-2 text-center max-w-[280px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
          سجل المبيعات أو المصاريف لعرض آخر النشاطات هنا.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 px-3 md:px-10">
      <p className="text-[13px] font-tajawal font-bold px-1 pt-1" style={{ color: "var(--text-muted)" }}>
        آخر الحركات
      </p>
      {items.map((item, i) => {
        const config = typeConfig[item.type];
        return (
          <div
            key={item._id}
            className="border rounded-2xl p-3.5 flex items-center gap-3 animate-fade-up"
            style={{
              background: "var(--card)",
              borderColor: "var(--border-light)",
              animationDelay: `${i * 40}ms`,
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${config.color}12`, color: config.color }}
            >
              {config.icon}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-bold font-tajawal truncate" style={{ color: "var(--text-ink)" }}>
                {item.description}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-tajawal font-bold"
                  style={{ background: `${config.color}12`, color: config.color }}
                >
                  {config.label}
                </span>
                <span className="text-[11px]" style={{ color: "var(--text-faint)" }}>
                  {formatDate(item.date)}
                </span>
              </div>
            </div>

            <div className="text-left shrink-0">
              <span className="text-[15px] font-bold font-tajawal nums" style={{ color: item.type === "expense" ? "#dc3545" : "var(--green-deep)" }}>
                {item.type === "expense" ? "-" : ""}{formatMRU(item.amount)}
              </span>
              <span className="text-[9px] mr-0.5 font-bold" style={{ color: "var(--gold)" }}> MRU</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
