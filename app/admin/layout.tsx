import Link from "next/link";
import { ReactNode } from "react";

const NAV = [
  { href: "/admin", label: "Painel de Controle" },
  { href: "/admin/clientes", label: "Gestão de Clientes" },
  { href: "/admin/catalogo", label: "Catálogo de Produtos" },
  { href: "/admin/dimensionamento", label: "Dimensionamento Inteligente" },
  { href: "/admin/propostas", label: "Orçamentos e Propostas" },
  { href: "/admin/configuracoes", label: "Configurações" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 shrink-0 bg-[#0b1220] border-r border-[#1e293b] p-5 flex flex-col">
        <div className="mb-8 flex items-center gap-2 px-2">
          <span className="text-[#22c55e] text-xl">☀</span>
          <span className="text-[15px] font-bold text-white">SolarFlow Pro</span>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-[#94a3b8] hover:bg-[#111c30] hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
