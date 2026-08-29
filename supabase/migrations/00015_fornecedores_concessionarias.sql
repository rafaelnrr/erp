-- Fornecedores: entidade separada de fabricantes (quem fabrica != de quem se compra).
-- Mesmo padrão de acesso de fabricantes/produtos (catálogo é só-admin).
create table public.fornecedores (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  documento text,
  telefone text,
  email text,
  created_at timestamptz not null default now()
);
alter table public.fornecedores enable row level security;
create policy "fornecedores_select" on public.fornecedores for select using (auth.role() = 'authenticated');
create policy "fornecedores_admin_write" on public.fornecedores for all
  using (get_user_role() = 'admin') with check (get_user_role() = 'admin');

-- Concessionárias: vira tabela própria, referenciada por clientes (antes era texto livre).
-- SELECT pra qualquer autenticado, INSERT pra admin/editor (quem cadastra cliente pode
-- adicionar uma concessionária nova na hora), UPDATE/DELETE só admin (evita renomear/apagar
-- um valor compartilhado por engano).
create table public.concessionarias (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  created_at timestamptz not null default now()
);
alter table public.concessionarias enable row level security;
create policy "concessionarias_select" on public.concessionarias for select using (auth.role() = 'authenticated');
create policy "concessionarias_insert" on public.concessionarias for insert
  with check (get_user_role() = ANY (ARRAY['admin'::text, 'editor'::text]));
create policy "concessionarias_update_delete_admin" on public.concessionarias for update
  using (get_user_role() = 'admin');
create policy "concessionarias_delete_admin" on public.concessionarias for delete
  using (get_user_role() = 'admin');

-- Lista padrão (mesma que já existia hardcoded no formulário de cliente)
insert into public.concessionarias (nome) values
  ('CPFL'), ('Enel'), ('Light'), ('Cemig'), ('Copel'), ('Coelba'), ('Celesc'), ('Equatorial'), ('Neoenergia')
on conflict (nome) do nothing;

-- Migra o texto livre existente em clientes.concessionaria pra tabela nova
insert into public.concessionarias (nome)
select distinct concessionaria from public.clientes where concessionaria is not null
on conflict (nome) do nothing;

alter table public.clientes add column concessionaria_id uuid references public.concessionarias(id);
update public.clientes c set concessionaria_id = co.id
from public.concessionarias co where co.nome = c.concessionaria;
alter table public.clientes drop column concessionaria;
