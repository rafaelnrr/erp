import { notFound } from "next/navigation";
import { buscarProduto } from "@/app/actions/produtos";
import { EditarProdutoClient } from "./EditarProdutoClient";

export default async function EditarProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const produto = await buscarProduto(id);
  if (!produto) notFound();

  return <EditarProdutoClient produto={produto} />;
}
