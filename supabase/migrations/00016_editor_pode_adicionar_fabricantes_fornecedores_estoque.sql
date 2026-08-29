-- Editor passa a poder ADICIONAR fabricantes/fornecedores/registros de estoque na hora
-- (mesmo padrão já usado em concessionarias), mas editar/excluir continua só admin —
-- evita que um vendedor renomeie/apague um valor compartilhado por engano.

drop policy if exists fabricantes_admin_write on public.fabricantes;
create policy "fabricantes_insert" on public.fabricantes for insert
  with check (get_user_role() = ANY (ARRAY['admin'::text, 'editor'::text]));
create policy "fabricantes_update_admin" on public.fabricantes for update
  using (get_user_role() = 'admin');
create policy "fabricantes_delete_admin" on public.fabricantes for delete
  using (get_user_role() = 'admin');

drop policy if exists fornecedores_admin_write on public.fornecedores;
create policy "fornecedores_insert" on public.fornecedores for insert
  with check (get_user_role() = ANY (ARRAY['admin'::text, 'editor'::text]));
create policy "fornecedores_update_admin" on public.fornecedores for update
  using (get_user_role() = 'admin');
create policy "fornecedores_delete_admin" on public.fornecedores for delete
  using (get_user_role() = 'admin');

drop policy if exists estoque_preco_admin_write on public.estoque_preco;
create policy "estoque_preco_insert" on public.estoque_preco for insert
  with check (get_user_role() = ANY (ARRAY['admin'::text, 'editor'::text]));
create policy "estoque_preco_update_admin" on public.estoque_preco for update
  using (get_user_role() = 'admin');
create policy "estoque_preco_delete_admin" on public.estoque_preco for delete
  using (get_user_role() = 'admin');
