-- ==========================================================
-- MIGRATION 00006 — Construtor de Propostas (rascunho editável +
-- finalização), Grupo Tarifário do cliente, catálogo de Serviços
-- ==========================================================

-- ---------- CLIENTES: grupo tarifário brasileiro ----------
alter table public.clientes
  add column grupo_tarifario text check (grupo_tarifario in ('A', 'B')),
  add column classe_b text check (classe_b in ('B1', 'B2', 'B3', 'B4')),
  add column subgrupo_a text check (subgrupo_a in ('A1', 'A2', 'A3', 'A3a', 'A4', 'AS')),
  add column modalidade_tarifaria_a text check (modalidade_tarifaria_a in ('verde', 'azul')),
  add column tarifa_kwh numeric(10,4),
  add column tarifa_kwh_ponta numeric(10,4),
  add column tarifa_kwh_fora_ponta numeric(10,4);

alter table public.clientes add constraint chk_grupo_tarifario_coerente check (
  (grupo_tarifario = 'B' and subgrupo_a is null and modalidade_tarifaria_a is null)
  or (grupo_tarifario = 'A' and classe_b is null)
  or grupo_tarifario is null
);

-- ---------- SERVIÇOS (catálogo) ----------
create table public.servicos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  recorrencia_padrao text not null check (recorrencia_padrao in ('unico', 'mensal', 'anual')),
  preco_padrao numeric(12,2) not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.servicos enable row level security;

create policy "servicos_select" on public.servicos
  for select using (auth.role() = 'authenticated');

create policy "servicos_admin_write" on public.servicos
  for all using (public.get_user_role() = 'admin') with check (public.get_user_role() = 'admin');

-- seed inicial
insert into public.servicos (nome, descricao, recorrencia_padrao, preco_padrao) values
  ('Instalação Padrão', 'Instalação completa do sistema fotovoltaico', 'unico', 800.00),
  ('Homologação na Concessionária', 'Processo de acesso e homologação junto à distribuidora', 'unico', 350.00),
  ('Limpeza de Módulos', 'Limpeza periódica dos módulos fotovoltaicos', 'mensal', 150.00),
  ('Manutenção Preventiva', 'Inspeção e manutenção preventiva anual do sistema', 'anual', 600.00);

-- ---------- PROPOSTAS: rascunho editável + campos comerciais ----------
alter table public.propostas
  alter column snapshot drop not null,
  add column condicoes_pagamento text,
  add column forma_pagamento text check (forma_pagamento in ('avista', 'financiado')),
  add column parcelas int,
  add column validade_dias int not null default 10,
  add column prazo_instalacao_dias int,
  add column economia_estimada_ano1 numeric(12,2),
  add column payback_meses numeric(6,1),
  add column finalizada_em timestamptz;

alter table public.propostas alter column status set default 'rascunho';

-- corrige o trigger: bloquear só depois que o snapshot já tiver sido setado
-- uma vez (a transição NULL -> valor, na finalização, precisa ser permitida)
create or replace function public.bloquear_alteracao_snapshot()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if old.snapshot is not null and old.snapshot is distinct from new.snapshot then
    raise exception 'Snapshot de proposta é imutável após a finalização.';
  end if;
  return new;
end;
$$;

-- ---------- ITENS DA PROPOSTA (editáveis em rascunho) ----------
create table public.proposta_itens (
  id uuid primary key default gen_random_uuid(),
  proposta_id uuid not null references public.propostas(id) on delete cascade,
  produto_id uuid references public.produtos(id),
  categoria text not null,
  descricao text not null,
  quantidade numeric not null default 1,
  preco_unitario numeric(12,2) not null,
  ordem int not null default 0
);
create index idx_proposta_itens_proposta on public.proposta_itens (proposta_id);

alter table public.proposta_itens enable row level security;

create policy "proposta_itens_select" on public.proposta_itens
  for select using (
    exists (select 1 from public.propostas p where p.id = proposta_itens.proposta_id
            and (p.vendedor_id = auth.uid() or public.get_user_role() = 'admin'))
  );
create policy "proposta_itens_all" on public.proposta_itens
  for all using (
    exists (select 1 from public.propostas p where p.id = proposta_itens.proposta_id
            and (p.vendedor_id = auth.uid() or public.get_user_role() = 'admin'))
  ) with check (
    exists (select 1 from public.propostas p where p.id = proposta_itens.proposta_id
            and (p.vendedor_id = auth.uid() or public.get_user_role() = 'admin'))
  );

-- ---------- SERVIÇOS ADICIONADOS À PROPOSTA ----------
create table public.proposta_servicos (
  id uuid primary key default gen_random_uuid(),
  proposta_id uuid not null references public.propostas(id) on delete cascade,
  servico_id uuid references public.servicos(id),
  nome text not null,
  recorrencia text not null check (recorrencia in ('unico', 'mensal', 'anual')),
  preco numeric(12,2) not null,
  ordem int not null default 0
);
create index idx_proposta_servicos_proposta on public.proposta_servicos (proposta_id);

alter table public.proposta_servicos enable row level security;

create policy "proposta_servicos_select" on public.proposta_servicos
  for select using (
    exists (select 1 from public.propostas p where p.id = proposta_servicos.proposta_id
            and (p.vendedor_id = auth.uid() or public.get_user_role() = 'admin'))
  );
create policy "proposta_servicos_all" on public.proposta_servicos
  for all using (
    exists (select 1 from public.propostas p where p.id = proposta_servicos.proposta_id
            and (p.vendedor_id = auth.uid() or public.get_user_role() = 'admin'))
  ) with check (
    exists (select 1 from public.propostas p where p.id = proposta_servicos.proposta_id
            and (p.vendedor_id = auth.uid() or public.get_user_role() = 'admin'))
  );
