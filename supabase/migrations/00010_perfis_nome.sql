-- ==========================================================
-- MIGRATION 00010 — Nome do usuário em Perfis
-- ==========================================================
alter table public.perfis add column nome text;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfis (id, role, email, nome)
  values (new.id, 'editor', new.email, new.raw_user_meta_data->>'nome');
  return new;
end;
$$;
