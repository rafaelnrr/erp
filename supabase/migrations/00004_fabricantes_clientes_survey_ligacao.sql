-- ==========================================================
-- MIGRATION 00004 — Fabricantes, campos técnicos de Clientes,
-- Site Survey e Tipo de Ligação no Dimensionamento
-- ==========================================================

-- ---------- FABRICANTES ----------
create table public.fabricantes (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  created_at timestamptz not null default now()
);
create index idx_fabricantes_nome on public.fabricantes (nome);

alter table public.produtos
  add column fabricante_id uuid references public.fabricantes(id);

alter table public.fabricantes enable row level security;

create policy "fabricantes_select" on public.fabricantes
  for select using (auth.role() = 'authenticated');

create policy "fabricantes_admin_write" on public.fabricantes
  for all using (public.get_user_role() = 'admin') with check (public.get_user_role() = 'admin');

-- ---------- CLIENTES: endereço, telhado, zona, documentos ----------
alter table public.clientes
  add column cep text,
  add column rua text,
  add column numero text,
  add column bairro text,
  add column cidade text,
  add column uf text,
  add column zona text check (zona in ('urbana', 'rural')) default 'urbana',
  add column concessionaria text,
  add column tipo_telhado text,
  add column estrutura_telhado text,
  add column fatura_path text,
  add column observacoes text;

-- ---------- SITE SURVEY (fotos com descrição obrigatória) ----------
create table public.cliente_fotos_survey (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  storage_path text not null,
  descricao text not null,
  created_at timestamptz not null default now()
);
create index idx_fotos_survey_cliente on public.cliente_fotos_survey (cliente_id);

alter table public.cliente_fotos_survey enable row level security;

create policy "fotos_survey_select" on public.cliente_fotos_survey
  for select using (
    exists (select 1 from public.clientes c where c.id = cliente_fotos_survey.cliente_id
            and (c.vendedor_id = auth.uid() or public.get_user_role() = 'admin'))
  );

create policy "fotos_survey_insert" on public.cliente_fotos_survey
  for insert with check (
    exists (select 1 from public.clientes c where c.id = cliente_fotos_survey.cliente_id
            and (c.vendedor_id = auth.uid() or public.get_user_role() = 'admin'))
  );

create policy "fotos_survey_delete" on public.cliente_fotos_survey
  for delete using (
    exists (select 1 from public.clientes c where c.id = cliente_fotos_survey.cliente_id
            and (c.vendedor_id = auth.uid() or public.get_user_role() = 'admin'))
  );

-- ---------- DIMENSIONAMENTOS: tipo de ligação usado no cálculo ----------
alter table public.dimensionamentos
  add column tipo_ligacao text check (tipo_ligacao in ('monofasico', 'bifasico', 'trifasico'));

-- ---------- STORAGE: buckets privados para fatura e site survey ----------
insert into storage.buckets (id, name, public)
values ('faturas', 'faturas', false), ('site-survey', 'site-survey', false)
on conflict (id) do nothing;

-- Convenção de path: "<vendedor_id>/<cliente_id>/<arquivo>" — permite restringir
-- acesso ao dono do cliente (ou admin) sem precisar de tabela auxiliar.
create policy "faturas_select_dono_ou_admin" on storage.objects
  for select using (
    bucket_id = 'faturas'
    and (auth.uid()::text = (storage.foldername(name))[1] or public.get_user_role() = 'admin')
  );
create policy "faturas_insert_dono_ou_admin" on storage.objects
  for insert with check (
    bucket_id = 'faturas'
    and (auth.uid()::text = (storage.foldername(name))[1] or public.get_user_role() = 'admin')
  );
create policy "faturas_delete_dono_ou_admin" on storage.objects
  for delete using (
    bucket_id = 'faturas'
    and (auth.uid()::text = (storage.foldername(name))[1] or public.get_user_role() = 'admin')
  );

create policy "survey_select_dono_ou_admin" on storage.objects
  for select using (
    bucket_id = 'site-survey'
    and (auth.uid()::text = (storage.foldername(name))[1] or public.get_user_role() = 'admin')
  );
create policy "survey_insert_dono_ou_admin" on storage.objects
  for insert with check (
    bucket_id = 'site-survey'
    and (auth.uid()::text = (storage.foldername(name))[1] or public.get_user_role() = 'admin')
  );
create policy "survey_delete_dono_ou_admin" on storage.objects
  for delete using (
    bucket_id = 'site-survey'
    and (auth.uid()::text = (storage.foldername(name))[1] or public.get_user_role() = 'admin')
  );
