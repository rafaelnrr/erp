const VARIANTES = {
  blue: "bg-blue-100 text-blue-700",
  green: "bg-green-100 text-green-700",
  gray: "bg-slate-100 text-slate-600",
  amber: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700",
  purple: "bg-purple-100 text-purple-700",
} as const;

export function Badge({ children, variant = "gray" }: { children: React.ReactNode; variant?: keyof typeof VARIANTES }) {
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${VARIANTES[variant]}`}>{children}</span>;
}
