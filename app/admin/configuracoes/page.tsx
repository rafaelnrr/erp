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

      <p className="mt-4 max-w-2xl text-xs text-gray-500">
        Novos usuários se cadastram como "Comercial" por padrão. Para criar um usuário administrador diretamente,
        é necessário acesso ao painel do Supabase — essa tela apenas promove/rebaixa contas já existentes.
      </p>
    </main>
  );
}
