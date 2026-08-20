"use client";

interface EmptyStateProps {
  title: string;
  description: string;
}

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 animate-fade-up">
      <h3
        className="text-[20px] font-bold font-tajawal relative z-10"
        style={{ color: "var(--text-ink)" }}
      >
        {title}
      </h3>
      <p
        className="text-[14px] mt-3 text-center max-w-[280px] leading-relaxed relative z-10"
        style={{ color: "var(--text-muted)" }}
      >
        {description}
      </p>
    </div>
  );
}
