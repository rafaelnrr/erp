import { listarPropostaCompleta } from "@/app/actions/propostas";
import { listarServicos } from "@/app/actions/servicos";
import { listarProdutos } from "@/app/actions/produtos";
import { ConstrutorProposta } from "@/components/ConstrutorProposta";
import { notFound } from "next/navigation";

export default async function ConstrutorPropostaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const completa = await listarPropostaCompleta(id);
  if (!completa) notFound();

  const [servicosRes, produtosRes] = await Promise.all([listarServicos(), listarProdutos()]);

  return (
    <ConstrutorProposta
      propostaId={id}
      propostaInicial={completa.proposta as any}
      itensIniciais={completa.itens as any}
      servicosIniciais={completa.servicos as any}
      catalogoServicos={servicosRes.ok ? servicosRes.data : []}
      catalogoProdutos={produtosRes.ok ? (produtosRes.data as any) : []}
    />
  );
}
