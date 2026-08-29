import Link from "next/link";
import { ReactNode } from "react";
import { obterMeuPapel } from "@/app/actions/perfis";

const NAV = [
  { href: "/admin", label: "Painel de Controle" },
  { href: "/admin/clientes", label: "Gestão de Clientes" },
  { href: "/admin/catalogo", label: "Catálogo de Produtos" },
  { href: "/admin/servicos", label: "Catálogo de Serviços" },
  { href: "/admin/dimensionamento", label: "Dimensionamento Inteligente" },
  { href: "/admin/propostas", label: "Orçamentos e Propostas" },
  { href: "/admin/configuracoes", label: "Configurações", somenteAdmin: true },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const role = await obterMeuPapel();
  const nav = NAV.filter((item) => !item.somenteAdmin || role === "admin");

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      <aside className="w-64 shrink-0 bg-slate-900 border-r border-slate-800 p-5 flex flex-col sticky top-0 h-screen overflow-y-auto">
        <div className="mb-8 flex items-center gap-2 px-2">
          <span className="text-emerald-400 text-xl">☀</span>
          <span className="text-[15px] font-bold text-white">SolarFlow Pro</span>
        </div>
        <nav className="flex flex-col gap-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        {role === "visualizador" && (
          <div className="mt-auto rounded-lg bg-slate-800 px-3 py-2 text-[11px] text-slate-400">
            Modo Visualizador — somente leitura
          </div>
        )}
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
