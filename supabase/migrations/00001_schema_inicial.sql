-- ==========================================================
-- MIGRATION 00001 — Schema inicial ERP Fotovoltaico
-- Aplicar via: supabase db push  (ou colar no SQL Editor do Supabase)
-- ==========================================================

-- ==========================================================
-- 0. ENUMS DE SUPORTE
-- ==========================================================
create type user_role as enum ('comercial', 'administrador');
create type categoria_produto as enum ('modulo', 'inversor', 'estrutura', 'string_box', 'cabo', 'acessorio');
create type status_proposta as enum ('rascunho', 'enviada', 'aprovada', 'rejeitada', 'expirada');

-- ==========================================================
-- 1. PERFIS DE USUÁRIO (espelha auth.users)
-- ==========================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome_completo text not null,
  role user_role not null default 'comercial',
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

-- Trigger para criar profile automaticamente ao registrar um novo auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nome_completo, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'nome_completo', new.email), 'comercial');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ==========================================================
-- 2. CLIENTES
-- ==========================================================
create table public.clientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  documento text not null,
  tipo_pessoa text not null check (tipo_pessoa in ('PF','PJ')),
  concessionaria text,
  grupo_tarifario text,
  endereco jsonb not null default '{}',
  criado_por uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);
create index idx_clientes_criado_por on public.clientes(criado_por);
create unique index idx_clientes_documento on public.clientes(documento);

-- ==========================================================
-- 3. PRODUTOS (Catálogo híbrido)
-- ==========================================================
create table public.produtos (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  categoria categoria_produto not null,
  fabricante text not null,
  modelo text not null,
  ativo boolean not null default true,
  potencia_w numeric,
  potencia_max_dc_w numeric,
  num_mppt int,
  num_fases int check (num_fases in (1,2,3)),
  tensao_v numeric,
  atributos jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_produtos_atributos on public.produtos using gin (atributos);
create index idx_produtos_categoria on public.produtos(categoria) where ativo = true;

-- ==========================================================
-- 4. ESTOQUE / PREÇO (isolado por Centro de Distribuição)
-- ==========================================================
create table public.centros_distribuicao (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  uf text not null
);

create table public.estoque_precos (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid not null references public.produtos(id) on delete cascade,
  cd_id uuid not null references public.centros_distribuicao(id),
  quantidade_disponivel numeric not null default 0,
  preco_custo numeric(12,2) not null,
  preco_venda numeric(12,2) not null,
  atualizado_em timestamptz not null default now(),
  unique (produto_id, cd_id)
);
create index idx_estoque_produto on public.estoque_precos(produto_id);

-- ==========================================================
-- 5. DIMENSIONAMENTOS
-- ==========================================================
create table public.dimensionamentos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id),
  criado_por uuid not null references public.profiles(id),
  consumo_medio_kwh numeric not null,
  irradiacao_local numeric not null,
  tipo_telhado text,
  fase_padrao int check (fase_padrao in (1,2,3)),
  potencia_sugerida_kwp numeric,
  modulo_id uuid references public.produtos(id),
  inversor_id uuid references public.produtos(id),
  qtd_modulos int,
  qtd_inversores int,
  relacao_dc_ac numeric,
  memoria_calculo jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- ==========================================================
-- 6. PROPOSTAS (com snapshot imutável)
-- ==========================================================
create table public.propostas (
  id uuid primary key default gen_random_uuid(),
  dimensionamento_id uuid not null references public.dimensionamentos(id),
  cliente_id uuid not null references public.clientes(id),
  criado_por uuid not null references public.profiles(id),
  status status_proposta not null default 'rascunho',
  numero_proposta text not null unique,
  validade_dias int not null default 15,
  snapshot jsonb not null,
  pdf_url text,
  created_at timestamptz not null default now()
);
create index idx_propostas_cliente on public.propostas(cliente_id);
create index idx_propostas_criado_por on public.propostas(criado_por);

create or replace function public.bloquear_alteracao_snapshot()
returns trigger as $$
begin
  if old.snapshot is distinct from new.snapshot then
    raise exception 'Snapshot de proposta é imutável após criação.';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_bloquear_snapshot
before update on public.propostas
for each row execute function public.bloquear_alteracao_snapshot();

-- ==========================================================
-- 7. ROW LEVEL SECURITY
-- ==========================================================
alter table public.profiles enable row level security;
alter table public.produtos enable row level security;
alter table public.estoque_precos enable row level security;
alter table public.centros_distribuicao enable row level security;
alter table public.clientes enable row level security;
alter table public.propostas enable row level security;
alter table public.dimensionamentos enable row level security;

-- Função helper: role do usuário autenticado (security definer evita
-- recursão de policy ao consultar profiles dentro de outras policies)
create or replace function public.get_user_role()
returns user_role as $$
  select role from public.profiles where id = auth.uid();
$$ language sql stable security definer;

-- ---------- PROFILES ----------
create policy "profiles_select_own_or_admin"
on public.profiles for select
to authenticated
using (id = auth.uid() or public.get_user_role() = 'administrador');

-- ---------- PRODUTOS ----------
create policy "produtos_select_all_authenticated"
on public.produtos for select
to authenticated
using (true);

create policy "produtos_write_admin_only"
on public.produtos for insert
to authenticated
with check (public.get_user_role() = 'administrador');

create policy "produtos_update_admin_only"
on public.produtos for update
to authenticated
using (public.get_user_role() = 'administrador')
with check (public.get_user_role() = 'administrador');

create policy "produtos_delete_admin_only"
on public.produtos for delete
to authenticated
using (public.get_user_role() = 'administrador');

-- ---------- ESTOQUE / PREÇO ----------
create policy "estoque_select_all_authenticated"
on public.estoque_precos for select
to authenticated
using (true);

create policy "estoque_write_admin_only"
on public.estoque_precos for all
to authenticated
using (public.get_user_role() = 'administrador')
with check (public.get_user_role() = 'administrador');

-- ---------- CENTROS DE DISTRIBUIÇÃO ----------
create policy "cd_select_all_authenticated"
on public.centros_distribuicao for select
to authenticated
using (true);

create policy "cd_write_admin_only"
on public.centros_distribuicao for all
to authenticated
using (public.get_user_role() = 'administrador')
with check (public.get_user_role() = 'administrador');

-- ---------- CLIENTES ----------
create policy "clientes_select_own_or_admin"
on public.clientes for select
to authenticated
using (criado_por = auth.uid() or public.get_user_role() = 'administrador');

create policy "clientes_insert_own"
on public.clientes for insert
to authenticated
with check (criado_por = auth.uid());

create policy "clientes_update_own_or_admin"
on public.clientes for update
to authenticated
using (criado_por = auth.uid() or public.get_user_role() = 'administrador');

-- ---------- DIMENSIONAMENTOS ----------
create policy "dimensionamentos_select_own_or_admin"
on public.dimensionamentos for select
to authenticated
using (criado_por = auth.uid() or public.get_user_role() = 'administrador');

create policy "dimensionamentos_insert_own"
on public.dimensionamentos for insert
to authenticated
with check (criado_por = auth.uid());

-- ---------- PROPOSTAS ----------
create policy "propostas_select_own_or_admin"
on public.propostas for select
to authenticated
using (criado_por = auth.uid() or public.get_user_role() = 'administrador');

create policy "propostas_insert_own"
on public.propostas for insert
to authenticated
with check (criado_por = auth.uid());

create policy "propostas_delete_admin_only"
on public.propostas for delete
to authenticated
using (public.get_user_role() = 'administrador');

-- Nota: não há policy de UPDATE em propostas para nenhum papel além
-- do necessário para trocar 'status' (ex. enviada -> aprovada).
-- Se precisar disso, crie uma policy de update restrita por criado_por
-- e confie na trigger trg_bloquear_snapshot para proteger o campo snapshot.
