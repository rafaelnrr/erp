"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
}

export function AdminSidebar({ nav, role }: { nav: NavItem[]; role: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const SidebarContent = () => (
    <>
      <div className="mb-8 flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="text-amber-500 text-xl">☀</span>
          <span className="text-[15px] font-bold text-white">Hertz Solar</span>
        </div>
        <button onClick={toggleSidebar} className="lg:hidden text-slate-400 hover:text-white p-1">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <nav className="flex flex-col gap-1">
        {nav.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/admin");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive 
                  ? "bg-amber-500/10 text-amber-500" 
                  : "text-slate-400 hover:bg-slate-900 hover:text-amber-400"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      {role === "visualizador" && (
        <div className="mt-auto rounded-lg bg-slate-800 px-3 py-2 text-[11px] text-slate-400">
          Modo Visualizador — somente leitura
        </div>
      )}
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
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
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
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-slate-950 border-r border-slate-800 p-5 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:sticky lg:top-0 lg:overflow-y-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
