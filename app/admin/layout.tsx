import { ReactNode } from "react";
import { obterMeuPapel } from "@/app/actions/perfis";
import { createClient } from "@/utils/supabase/server";
import { AdminSidebar, type NavGrupo } from "@/components/AdminSidebar";

const NAV: NavGrupo[] = [
  {
    titulo: "Principal",
    itens: [{ href: "/admin", label: "Painel de Controle", icone: "dashboard" }],
  },
  {
    titulo: "Comercial",
    itens: [
      { href: "/admin/clientes", label: "Gestão de Clientes", icone: "clientes" },
      { href: "/admin/propostas", label: "Orçamentos e Propostas", icone: "propostas" },
      { href: "/admin/dimensionamento", label: "Dimensionamento Inteligente", icone: "dimensionamento" },
      { href: "/admin/concessionarias", label: "Concessionárias", icone: "concessionarias" },
    ],
  },
  {
    titulo: "Catálogo & Estoque",
    colapsavel: true,
    itens: [
      { href: "/admin/catalogo", label: "Catálogo de Produtos", icone: "produtos" },
      { href: "/admin/servicos", label: "Catálogo de Serviços", icone: "servicos" },
      { href: "/admin/fabricantes", label: "Fabricantes", icone: "fabricantes" },
      { href: "/admin/fornecedores", label: "Fornecedores", icone: "fornecedores" },
      { href: "/admin/estoque", label: "Estoque & Preços", icone: "estoque" },
      { href: "/admin/importar", label: "Importação em Massa", icone: "importar" },
    ],
  },
  {
    titulo: "Administração",
    somenteAdmin: true,
    itens: [{ href: "/admin/configuracoes", label: "Usuários & Configurações", icone: "config" }],
  },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const [role, { data: authData }] = await Promise.all([obterMeuPapel(), supabase.auth.getUser()]);

  const nav = NAV.map((grupo) => ({ ...grupo, itens: grupo.itens })).filter((grupo) => !grupo.somenteAdmin || role === "admin");

  const nome = authData.user?.user_metadata?.nome || authData.user?.email?.split("@")[0] || "Usuário";
  const email = authData.user?.email ?? "";

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 dark:bg-slate-900">
      <AdminSidebar nav={nav} role={role ?? ""} nome={nome} email={email} />
      <main className="flex-1 min-w-0 flex flex-col">{children}</main>
    </div>
  );
}
