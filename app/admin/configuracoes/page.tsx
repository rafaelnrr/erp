import { listarUsuarios } from "@/app/actions/perfis";
import { GerenciamentoUsuarios } from "@/components/GerenciamentoUsuarios";
import { createClient } from "@/utils/supabase/server";
import { ThemeToggle } from "@/components/ThemeToggle";

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const [result, authData] = await Promise.all([listarUsuarios(), supabase.auth.getUser()]);

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-end">
        <ThemeToggle />
      </div>
      <GerenciamentoUsuarios usuarios={result.data} meuId={authData.data.user?.id ?? null} />

      <div className="mt-6 max-w-3xl text-xs text-slate-500 space-y-1">
        <p><b>Administrador:</b> acesso total, inclusive esta tela.</p>
        <p><b>Editor:</b> cria e edita clientes, dimensionamentos e propostas próprias — não gerencia catálogo nem usuários.</p>
        <p><b>Visualizador:</b> só leitura, em todo o sistema — não salva, edita ou exclui nada.</p>
      </div>
    </main>
  );
}
