-- ==========================================================
-- MIGRATION 00008 — Detalhes de Serviços (tempo de execução, custo
-- interno) e título do projeto em Propostas
-- ==========================================================
alter table public.servicos
  add column tempo_execucao_valor numeric,
  add column tempo_execucao_unidade text check (tempo_execucao_unidade in ('horas', 'dias')),
  add column custo_interno numeric(12,2);

alter table public.propostas
  add column titulo text;
