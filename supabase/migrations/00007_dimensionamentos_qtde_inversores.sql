-- ==========================================================
-- MIGRATION 00007 — dimensionamentos nunca salvava a quantidade de
-- inversores (só de módulos), o que fazia o Construtor de Propostas
-- assumir sempre "1 inversor" ao importar. Corrigido aqui.
-- ==========================================================
alter table public.dimensionamentos add column qtde_inversores int;
