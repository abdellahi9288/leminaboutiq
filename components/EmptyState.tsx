"use client";

interface EmptyStateProps {
  title: string;
  description: string;
}

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 animate-fade-up">
      <h3
        className="text-[18px] font-bold font-tajawal"
        style={{ color: "var(--text-ink)" }}
      >
        {title}
      </h3>
      <p
        className="text-[14px] mt-2 text-center max-w-[280px] leading-relaxed"
        style={{ color: "var(--text-muted)" }}
      >
        {description}
      </p>
    </div>
  );
}
