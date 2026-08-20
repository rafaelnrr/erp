import Link from "next/link";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 border-r bg-white p-6 flex flex-col justify-between">
        <div>
          <h2 className="mb-8 text-xl font-bold text-gray-800">ERP Solar</h2>
          <nav className="flex flex-col gap-2">
            <Link href="/admin/clientes" className="rounded p-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
              Clientes
            </Link>
            <Link href="/admin/catalogo" className="rounded p-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
              Catálogo de Produtos
            </Link>
            <Link href="/admin/dimensionamento" className="rounded p-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
              Dimensionamento
            </Link>
          </nav>
        </div>
      </aside>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
