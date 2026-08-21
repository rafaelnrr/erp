import { listarUsuarios } from "@/app/actions/perfis";
import { RoleUsuarioSelect } from "@/components/RoleUsuarioSelect";

export default async function ConfiguracoesPage() {
  const result = await listarUsuarios();
  const usuarios = result.data;

  return (
    <main className="p-8">
      <h1 className="text-xl font-semibold text-gray-800">Configurações</h1>
      <p className="mt-1 text-sm text-gray-500">Gestão de usuários e papéis de acesso.</p>

      <div className="mt-6 overflow-hidden rounded-lg border bg-white shadow-sm max-w-2xl">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">E-mail</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Papel</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-4 py-8 text-center text-gray-500">
                  Nenhum usuário encontrado.
                </td>
              </tr>
            ) : (
              usuarios.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-800">{u.email ?? "—"}</td>
                  <td className="px-4 py-3">
                    <RoleUsuarioSelect id={u.id} roleAtual={u.role} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 max-w-2xl text-xs text-gray-500 space-y-1">
        <p><b>Administrador:</b> acesso total, inclusive esta tela.</p>
        <p><b>Editor:</b> cria e edita clientes, dimensionamentos e propostas próprias — não gerencia catálogo nem usuários.</p>
        <p><b>Visualizador:</b> só leitura, em todo o sistema — não salva, edita ou exclui nada.</p>
        <p className="pt-2">
          Novos usuários se cadastram como "Editor" por padrão. Para criar um usuário diretamente, é necessário
          acesso ao painel do Supabase — essa tela apenas promove/rebaixa contas já existentes.
        </p>
      </div>
    </main>
  );
}
