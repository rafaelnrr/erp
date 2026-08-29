-- Permite excluir propostas em rascunho (dono não-visualizador, ou admin)
create policy "propostas_delete_rascunho"
on public.propostas for delete
using (
  status = 'rascunho'
  and ((vendedor_id = auth.uid() and get_user_role() <> 'visualizador') or get_user_role() = 'admin')
);

-- Permite excluir clientes (dono não-visualizador, ou admin).
-- FKs de propostas/dimensionamentos ficam como NO ACTION: o banco bloqueia
-- a exclusão se o cliente tiver propostas/dimensionamentos vinculados.
create policy "clientes_delete"
on public.clientes for delete
using (
  (vendedor_id = auth.uid() and get_user_role() <> 'visualizador') or get_user_role() = 'admin'
);
