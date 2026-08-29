import { ReactNode } from "react";
import { obterMeuPapel } from "@/app/actions/perfis";
import { AdminSidebar } from "@/components/AdminSidebar";

const NAV = [
  { href: "/admin", label: "Painel de Controle" },
  { href: "/admin/clientes", label: "Gestão de Clientes" },
  { href: "/admin/catalogo", label: "Catálogo de Produtos" },
  { href: "/admin/fabricantes", label: "Fabricantes" },
  { href: "/admin/estoque", label: "Estoque & Preços" },
  { href: "/admin/servicos", label: "Catálogo de Serviços" },
  { href: "/admin/dimensionamento", label: "Dimensionamento Inteligente" },
  { href: "/admin/propostas", label: "Orçamentos e Propostas" },
  { href: "/admin/configuracoes", label: "Configurações", somenteAdmin: true },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const role = await obterMeuPapel();
  const nav = NAV.filter((item) => !item.somenteAdmin || role === "admin");

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 dark:bg-slate-900">
      <AdminSidebar nav={nav} role={role ?? ""} />
      <main className="flex-1 min-w-0 flex flex-col">{children}</main>
    </div>
  );
}
