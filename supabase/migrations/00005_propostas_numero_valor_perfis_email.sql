-- ==========================================================
-- MIGRATION 00005 — Número/valor em Propostas, e-mail em Perfis
-- ==========================================================

-- ---------- PROPOSTAS: número de exibição e valor total congelado ----------
alter table public.propostas
  add column numero bigint generated always as identity,
  add column valor_total numeric(12,2);

-- ---------- PERFIS: e-mail denormalizado (para a tela de Gestão de Usuários,
-- já que auth.users não é exposto via API REST por segurança) ----------
alter table public.perfis
  add column email text;

update public.perfis p
set email = u.email
from auth.users u
where u.id = p.id and p.email is null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfis (id, role, email)
  values (new.id, 'comercial', new.email);
  return new;
end;
$$;
