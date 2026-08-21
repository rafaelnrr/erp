-- ==========================================================
-- MIGRATION 00003 — Corrige drift entre schema real e migrations anteriores
-- ==========================================================
-- Contexto: em algum momento entre a 00001 e a 00002, o schema em produção
-- foi simplificado diretamente no banco (profiles -> perfis, estoque_precos
-- -> estoque_preco, colunas enxutas, role como text) sem atualizar as
-- migrations correspondentes. A 00002 só corrigiu parcialmente o trigger de
-- signup, deixando get_user_role() ainda apontando para public.profiles
-- (inexistente) e 4 tabelas com RLS habilitado sem nenhuma policy —
-- ou seja, totalmente inacessíveis via API (inclusive para admin).
--
-- Esta migration alinha o repositório com o que foi aplicado diretamente
-- no projeto Supabase (ref: slfefqhrxgzkzyymiogs) e não deve ser reaplicada
-- manualmente lá — serve como registro para ambientes novos (staging, CI,
-- outro projeto Supabase) partirem do estado correto.
-- ==========================================================

-- 0. get_user_role() precisa ser dropada antes: muda o tipo de retorno de
-- user_role (enum, da 00001) para text (schema real usa perfis.role text)
drop function if exists public.get_user_role();

create function public.get_user_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role from public.perfis where id = auth.uid();
$$;

revoke execute on function public.get_user_role() from public, anon;
grant execute on function public.get_user_role() to authenticated;

-- 1. handle_new_user(): a 00002 já apontava para public.perfis, mas faltava
-- search_path fixo (alerta de segurança "function_search_path_mutable")
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfis (id, role)
  values (new.id, 'comercial');
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- 2. bloquear_alteracao_snapshot(): existia como função mas nunca tinha
-- sido anexada a nenhum trigger em propostas — a imutabilidade do
-- snapshot não estava sendo aplicada de fato
create or replace function public.bloquear_alteracao_snapshot()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if old.snapshot is distinct from new.snapshot then
    raise exception 'Snapshot de proposta é imutável após criação.';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_bloquear_alteracao_snapshot on public.propostas;
create trigger trg_bloquear_alteracao_snapshot
  before update on public.propostas
  for each row execute function public.bloquear_alteracao_snapshot();

-- 3. Policies que faltavam (RLS ligado + zero policies = tudo bloqueado)

create policy "perfis_select" on public.perfis
  for select using (id = auth.uid() or public.get_user_role() = 'admin');

create policy "perfis_admin_manage" on public.perfis
  for all using (public.get_user_role() = 'admin') with check (public.get_user_role() = 'admin');

create policy "clientes_select" on public.clientes
  for select using (vendedor_id = auth.uid() or public.get_user_role() = 'admin');

create policy "clientes_insert" on public.clientes
  for insert with check (vendedor_id = auth.uid() or public.get_user_role() = 'admin');

create policy "clientes_update" on public.clientes
  for update using (vendedor_id = auth.uid() or public.get_user_role() = 'admin');

create policy "estoque_preco_select" on public.estoque_preco
  for select using (auth.role() = 'authenticated');

create policy "estoque_preco_admin_write" on public.estoque_preco
  for all using (public.get_user_role() = 'admin') with check (public.get_user_role() = 'admin');

-- dimensionamentos não tem coluna própria de "dono" (só cliente_id),
-- então o escopo por vendedor é feito via join na tabela clientes
create policy "dimensionamentos_select" on public.dimensionamentos
  for select using (
    exists (select 1 from public.clientes c where c.id = dimensionamentos.cliente_id
            and (c.vendedor_id = auth.uid() or public.get_user_role() = 'admin'))
  );

create policy "dimensionamentos_insert" on public.dimensionamentos
  for insert with check (
    exists (select 1 from public.clientes c where c.id = dimensionamentos.cliente_id
            and (c.vendedor_id = auth.uid() or public.get_user_role() = 'admin'))
  );

-- 4. propostas: a policy "vendedor_proprias" (ALL, sem with_check) permitia
-- ao vendedor trocar vendedor_id/cliente_id da própria proposta ou deletar
-- qualquer uma. Substituída por policies separadas, sem delete.
drop policy if exists "vendedor_proprias" on public.propostas;

create policy "propostas_select" on public.propostas
  for select using (vendedor_id = auth.uid() or public.get_user_role() = 'admin');

create policy "propostas_insert" on public.propostas
  for insert with check (vendedor_id = auth.uid() or public.get_user_role() = 'admin');

create policy "propostas_update_status" on public.propostas
  for update using (vendedor_id = auth.uid() or public.get_user_role() = 'admin')
  with check (vendedor_id = auth.uid() or public.get_user_role() = 'admin');
