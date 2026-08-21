import { ButtonHTMLAttributes } from "react";

const VARIANTES = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50",
  secondary: "border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50",
  danger: "border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50",
} as const;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof VARIANTES;
}

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${VARIANTES[variant]} ${className}`}
      {...props}
    />
  );
}
