-- ==========================================================
-- MIGRATION 00011 — Campos que faltavam pra reproduzir o modelo completo
-- de proposta (área estimada, HSP, perdas, desconto à vista)
-- ==========================================================
alter table public.dimensionamentos
  add column hsp numeric,
  add column perdas_pct numeric,
  add column area_estimada_m2 numeric;

alter table public.propostas
  add column desconto_avista_pct numeric(5,2) not null default 3;
