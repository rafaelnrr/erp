import { listarTodosServicos } from "@/app/actions/servicos";
import { ServicosLista } from "@/components/ServicosLista";

export default async function ServicosPage() {
  const result = await listarTodosServicos();

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <ServicosLista servicos={result.data} />
    </main>
  );
}
