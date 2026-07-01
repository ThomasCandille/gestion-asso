"use client";

import { CheckCircle2, XCircle } from "lucide-react";

export const controlClass =
  "h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition hover:border-zinc-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  return (
    <span
      className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ring-1 ${className}`}
    >
      {children}
    </span>
  );
}

export type StatCardTone = "zinc" | "emerald" | "violet" | "amber" | "blue";

const statCardTones: Record<StatCardTone, string> = {
  zinc: "bg-white text-zinc-950",
  emerald: "bg-emerald-50 text-emerald-800",
  violet: "bg-violet-50 text-violet-800",
  amber: "bg-amber-50 text-amber-800",
  blue: "bg-blue-50 text-blue-800",
};

export function StatCard({
  label,
  value,
  tone = "zinc",
}: {
  label: string;
  value: number;
  tone?: StatCardTone;
}) {
  return (
    <article
      className={`rounded-lg border border-zinc-200 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md ${statCardTones[tone]}`}
    >
      <p className="text-sm font-medium opacity-70">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </article>
  );
}

export function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-zinc-50 p-3">
      <dt className="text-zinc-500">{label}</dt>
      <dd className="font-medium text-zinc-900">{value}</dd>
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-zinc-600">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={controlClass}
      />
    </label>
  );
}

export function TextareaField({
  label,
  value,
  onChange,
  rows = 2,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-zinc-600">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none transition hover:border-zinc-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
    </label>
  );
}

export function FormFeedback({
  feedback,
  errors,
}: {
  feedback: string | null;
  errors: string[];
}) {
  return (
    <>
      {feedback ? (
        <div className="mt-4 flex gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p>{feedback}</p>
        </div>
      ) : null}
      {errors.length > 0 ? (
        <div className="mt-4 space-y-1 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {errors.map((err) => (
            <p key={err} className="flex gap-2">
              <XCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span>{err}</span>
            </p>
          ))}
        </div>
      ) : null}
    </>
  );
}
