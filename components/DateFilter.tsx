"use client";

type FilterType = "today" | "week" | "month" | "custom";

interface DateFilterProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const filters: { key: FilterType; label: string }[] = [
  { key: "today", label: "اليوم" },
  { key: "week", label: "هذا الأسبوع" },
  { key: "month", label: "هذا الشهر" },
  { key: "custom", label: "فترة مخصصة" },
];

export default function DateFilter({ activeFilter, onFilterChange }: DateFilterProps) {
  return (
    <div className="flex gap-2.5 px-5 md:px-10 py-4 overflow-x-auto">
      {filters.map((f) => (
        <button
          key={f.key}
          onClick={() => onFilterChange(f.key)}
          className={`px-6 py-3 rounded-full text-[13px] font-tajawal font-bold whitespace-nowrap transition-all duration-200 border btn-press ${
            activeFilter === f.key
              ? "text-white"
              : ""
          }`}
          style={
            activeFilter === f.key
              ? {
                  background: "var(--green-brand)",
                  borderColor: "var(--green-brand)",
                  boxShadow: "0 4px 14px rgba(22,101,52,0.2)",
                }
              : {
                  background: "var(--card)",
                  borderColor: "var(--border)",
                  color: "var(--text-muted)",
                }
          }
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
