-- ==========================================================
-- MIGRATION 00009 — RBAC de 3 níveis (admin / editor / visualizador)
-- ==========================================================
-- 'comercial' vira 'editor' (mesmas permissões de escrita nos próprios
-- registros); 'visualizador' é novo — leitura ampla, escrita nenhuma.

alter table public.perfis drop constraint perfis_role_check;
update public.perfis set role = 'editor' where role = 'comercial';
alter table public.perfis add constraint perfis_role_check check (role in ('admin', 'editor', 'visualizador'));
alter table public.perfis alter column role set default 'editor';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfis (id, role, email)
  values (new.id, 'editor', new.email);
  return new;
end;
$$;

-- ---------- CLIENTES ----------
drop policy if exists "clientes_select" on public.clientes;
create policy "clientes_select" on public.clientes
  for select using (vendedor_id = auth.uid() or public.get_user_role() in ('admin', 'visualizador'));

drop policy if exists "clientes_insert" on public.clientes;
create policy "clientes_insert" on public.clientes
  for insert with check (
    (vendedor_id = auth.uid() and public.get_user_role() != 'visualizador') or public.get_user_role() = 'admin'
  );

drop policy if exists "clientes_update" on public.clientes;
create policy "clientes_update" on public.clientes
  for update using (
    (vendedor_id = auth.uid() and public.get_user_role() != 'visualizador') or public.get_user_role() = 'admin'
  );

-- ---------- DIMENSIONAMENTOS ----------
drop policy if exists "dimensionamentos_select" on public.dimensionamentos;
create policy "dimensionamentos_select" on public.dimensionamentos
  for select using (
    public.get_user_role() in ('admin', 'visualizador')
    or exists (select 1 from public.clientes c where c.id = dimensionamentos.cliente_id and c.vendedor_id = auth.uid())
  );

drop policy if exists "dimensionamentos_insert" on public.dimensionamentos;
create policy "dimensionamentos_insert" on public.dimensionamentos
  for insert with check (
    public.get_user_role() = 'admin'
    or (
      public.get_user_role() != 'visualizador'
      and exists (select 1 from public.clientes c where c.id = dimensionamentos.cliente_id and c.vendedor_id = auth.uid())
    )
  );

-- ---------- PROPOSTAS ----------
drop policy if exists "propostas_select" on public.propostas;
create policy "propostas_select" on public.propostas
  for select using (vendedor_id = auth.uid() or public.get_user_role() in ('admin', 'visualizador'));

drop policy if exists "propostas_insert" on public.propostas;
create policy "propostas_insert" on public.propostas
  for insert with check (
    (vendedor_id = auth.uid() and public.get_user_role() != 'visualizador') or public.get_user_role() = 'admin'
  );

drop policy if exists "propostas_update_status" on public.propostas;
create policy "propostas_update_status" on public.propostas
  for update using (
    (vendedor_id = auth.uid() and public.get_user_role() != 'visualizador') or public.get_user_role() = 'admin'
  );

-- ---------- PROPOSTA_ITENS ----------
drop policy if exists "proposta_itens_select" on public.proposta_itens;
create policy "proposta_itens_select" on public.proposta_itens
  for select using (
    public.get_user_role() in ('admin', 'visualizador')
    or exists (select 1 from public.propostas p where p.id = proposta_itens.proposta_id and p.vendedor_id = auth.uid())
  );

drop policy if exists "proposta_itens_all" on public.proposta_itens;
create policy "proposta_itens_write" on public.proposta_itens
  for all using (
    public.get_user_role() = 'admin'
    or (
      public.get_user_role() != 'visualizador'
      and exists (select 1 from public.propostas p where p.id = proposta_itens.proposta_id and p.vendedor_id = auth.uid())
    )
  ) with check (
    public.get_user_role() = 'admin'
    or (
      public.get_user_role() != 'visualizador'
      and exists (select 1 from public.propostas p where p.id = proposta_itens.proposta_id and p.vendedor_id = auth.uid())
    )
  );

-- ---------- PROPOSTA_SERVICOS ----------
drop policy if exists "proposta_servicos_select" on public.proposta_servicos;
create policy "proposta_servicos_select" on public.proposta_servicos
  for select using (
    public.get_user_role() in ('admin', 'visualizador')
    or exists (select 1 from public.propostas p where p.id = proposta_servicos.proposta_id and p.vendedor_id = auth.uid())
  );

drop policy if exists "proposta_servicos_all" on public.proposta_servicos;
create policy "proposta_servicos_write" on public.proposta_servicos
  for all using (
    public.get_user_role() = 'admin'
    or (
      public.get_user_role() != 'visualizador'
      and exists (select 1 from public.propostas p where p.id = proposta_servicos.proposta_id and p.vendedor_id = auth.uid())
    )
  ) with check (
    public.get_user_role() = 'admin'
    or (
      public.get_user_role() != 'visualizador'
      and exists (select 1 from public.propostas p where p.id = proposta_servicos.proposta_id and p.vendedor_id = auth.uid())
    )
  );

-- ---------- CLIENTE_FOTOS_SURVEY ----------
drop policy if exists "fotos_survey_select" on public.cliente_fotos_survey;
create policy "fotos_survey_select" on public.cliente_fotos_survey
  for select using (
    public.get_user_role() in ('admin', 'visualizador')
    or exists (select 1 from public.clientes c where c.id = cliente_fotos_survey.cliente_id and c.vendedor_id = auth.uid())
  );

drop policy if exists "fotos_survey_insert" on public.cliente_fotos_survey;
create policy "fotos_survey_insert" on public.cliente_fotos_survey
  for insert with check (
    public.get_user_role() = 'admin'
    or (
      public.get_user_role() != 'visualizador'
      and exists (select 1 from public.clientes c where c.id = cliente_fotos_survey.cliente_id and c.vendedor_id = auth.uid())
    )
  );

drop policy if exists "fotos_survey_delete" on public.cliente_fotos_survey;
create policy "fotos_survey_delete" on public.cliente_fotos_survey
  for delete using (
    public.get_user_role() = 'admin'
    or (
      public.get_user_role() != 'visualizador'
      and exists (select 1 from public.clientes c where c.id = cliente_fotos_survey.cliente_id and c.vendedor_id = auth.uid())
    )
  );
