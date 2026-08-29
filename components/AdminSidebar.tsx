"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Zap,
  Package,
  Wrench,
  Factory,
  Warehouse,
  Upload,
  Settings,
  ChevronDown,
  LogOut,
  Menu,
  X,
  Truck,
  Plug,
} from "lucide-react";
import { sair } from "@/app/actions/auth";

const ICONES = {
  dashboard: LayoutDashboard,
  clientes: Users,
  propostas: FileText,
  dimensionamento: Zap,
  produtos: Package,
  servicos: Wrench,
  fabricantes: Factory,
  fornecedores: Truck,
  concessionarias: Plug,
  estoque: Warehouse,
  importar: Upload,
  config: Settings,
} as const;

type IconeId = keyof typeof ICONES;

export interface NavItem {
  href: string;
  label: string;
  icone: IconeId;
}

export interface NavGrupo {
  titulo: string;
  itens: NavItem[];
  colapsavel?: boolean;
  somenteAdmin?: boolean;
}

const LABEL_ROLE: Record<string, string> = {
  admin: "Administrador",
  editor: "Vendedor",
  visualizador: "Visualizador",
};

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/);
  const letras = partes.length > 1 ? partes[0][0] + partes[partes.length - 1][0] : partes[0]?.slice(0, 2) ?? "?";
  return letras.toUpperCase();
}

function ItemLink({ item, ativo, onClick }: { item: NavItem; ativo: boolean; onClick: () => void }) {
  const Icone = ICONES[item.icone];
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        ativo ? "bg-amber-500/10 text-amber-500" : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
      }`}
    >
      <Icone className="w-4 h-4 shrink-0" strokeWidth={2} />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

function GrupoColapsavel({ grupo, pathname, onNavigate }: { grupo: NavGrupo; pathname: string; onNavigate: () => void }) {
  const algumAtivo = grupo.itens.some((item) => pathname === item.href || pathname.startsWith(item.href + "/"));
  const [aberto, setAberto] = useState(algumAtivo);

  return (
    <div>
      <button
        onClick={() => setAberto((a) => !a)}
        className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-300 transition-colors"
      >
        {grupo.titulo}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${aberto ? "rotate-0" : "-rotate-90"}`} />
      </button>
      {aberto && (
        <div className="flex flex-col gap-1 mt-0.5">
          {grupo.itens.map((item) => {
            const ativo = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/admin");
            return <ItemLink key={item.href} item={item} ativo={ativo} onClick={onNavigate} />;
          })}
        </div>
      )}
    </div>
  );
}

export function AdminSidebar({ nav, role, nome, email }: { nav: NavGrupo[]; role: string; nome: string; email: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [saindo, startTransition] = useTransition();
  const pathname = usePathname();

  const toggleSidebar = () => setIsOpen(!isOpen);
  const fecharAoNavegar = () => setIsOpen(false);

  const SidebarContent = () => (
    <>
      <div className="mb-6 flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="text-amber-500 text-xl">☀</span>
          <span className="text-[15px] font-bold text-white">Hertz Solar</span>
        </div>
        <button onClick={toggleSidebar} className="lg:hidden text-slate-400 hover:text-white p-1">
          <X className="w-6 h-6" />
        </button>
      </div>

      <nav className="flex flex-col gap-4 flex-1 overflow-y-auto">
        {nav.map((grupo) =>
          grupo.colapsavel ? (
            <GrupoColapsavel key={grupo.titulo} grupo={grupo} pathname={pathname} onNavigate={fecharAoNavegar} />
          ) : (
            <div key={grupo.titulo}>
              <p className="px-3 mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">{grupo.titulo}</p>
              <div className="flex flex-col gap-1">
                {grupo.itens.map((item) => {
                  const ativo = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/admin");
                  return <ItemLink key={item.href} item={item} ativo={ativo} onClick={fecharAoNavegar} />;
                })}
              </div>
            </div>
          )
        )}
      </nav>

      {role === "visualizador" && (
        <div className="mt-3 rounded-lg bg-slate-800 px-3 py-2 text-[11px] text-slate-400">
          Modo Visualizador — somente leitura
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-slate-800 flex items-center gap-2.5 px-1">
        <div className="w-9 h-9 shrink-0 rounded-full bg-amber-500/15 text-amber-500 flex items-center justify-center text-xs font-bold">
          {iniciais(nome)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-100 truncate">{nome}</p>
          <p className="text-[11px] text-slate-500 truncate">{LABEL_ROLE[role] ?? role} · {email}</p>
        </div>
        <Link
          href="/admin/configuracoes"
          title="Configurações"
          className="p-1.5 rounded-md text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <Settings className="w-4 h-4" />
        </Link>
        <button
          onClick={() => startTransition(() => sair())}
          disabled={saindo}
          title="Sair"
          className="p-1.5 rounded-md text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between bg-slate-950 px-4 py-3 sticky top-0 z-40 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-amber-500 text-lg">☀</span>
          <span className="text-sm font-bold text-white">Hertz Solar</span>
        </div>
        <button onClick={toggleSidebar} className="text-slate-300 hover:text-white p-2 rounded-md hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Backdrop for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden transition-opacity backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar (Off-canvas on mobile, fixed on desktop) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-slate-950 border-r border-slate-800 p-5 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:sticky lg:top-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
