-- Editor ganha leitura ampla (igual visualizador já tinha), mantendo escrita restrita ao próprio registro.
-- Sem isso, um editor não consegue nem visualizar (nem editar) propostas/clientes criados por outro vendedor —
-- a tela carrega, mas a query retorna vazio (RLS bloqueia silenciosamente) e a página cai em 404.

drop policy "clientes_select" on public.clientes;
create policy "clientes_select" on public.clientes for select
using (
  (vendedor_id = auth.uid())
  or (get_user_role() = ANY (ARRAY['admin'::text, 'visualizador'::text, 'editor'::text]))
);

drop policy "propostas_select" on public.propostas;
create policy "propostas_select" on public.propostas for select
using (
  (vendedor_id = auth.uid())
  or (get_user_role() = ANY (ARRAY['admin'::text, 'visualizador'::text, 'editor'::text]))
);

drop policy "dimensionamentos_select" on public.dimensionamentos;
create policy "dimensionamentos_select" on public.dimensionamentos for select
using (
  (get_user_role() = ANY (ARRAY['admin'::text, 'visualizador'::text, 'editor'::text]))
  or (exists (select 1 from clientes c where c.id = dimensionamentos.cliente_id and c.vendedor_id = auth.uid()))
);

drop policy "proposta_itens_select" on public.proposta_itens;
create policy "proposta_itens_select" on public.proposta_itens for select
using (
  (get_user_role() = ANY (ARRAY['admin'::text, 'visualizador'::text, 'editor'::text]))
  or (exists (select 1 from propostas p where p.id = proposta_itens.proposta_id and p.vendedor_id = auth.uid()))
);

drop policy "proposta_servicos_select" on public.proposta_servicos;
create policy "proposta_servicos_select" on public.proposta_servicos for select
using (
  (get_user_role() = ANY (ARRAY['admin'::text, 'visualizador'::text, 'editor'::text]))
  or (exists (select 1 from propostas p where p.id = proposta_servicos.proposta_id and p.vendedor_id = auth.uid()))
);

drop policy "fotos_survey_select" on public.cliente_fotos_survey;
create policy "fotos_survey_select" on public.cliente_fotos_survey for select
using (
  (get_user_role() = ANY (ARRAY['admin'::text, 'visualizador'::text, 'editor'::text]))
  or (exists (select 1 from clientes c where c.id = cliente_fotos_survey.cliente_id and c.vendedor_id = auth.uid()))
);
