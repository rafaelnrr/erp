-- Mesma leitura ampla que já demos pra clientes/propostas: editor e visualizador também
-- devem conseguir ver fatura/fotos de survey de clientes que não são deles (só admin tinha bypass).
drop policy "faturas_select_dono_ou_admin" on storage.objects;
create policy "faturas_select_dono_ou_admin" on storage.objects for select
using (
  bucket_id = 'faturas'
  and (
    (auth.uid())::text = (storage.foldername(name))[1]
    or get_user_role() = ANY (ARRAY['admin'::text, 'editor'::text, 'visualizador'::text])
  )
);

drop policy "survey_select_dono_ou_admin" on storage.objects;
create policy "survey_select_dono_ou_admin" on storage.objects for select
using (
  bucket_id = 'site-survey'
  and (
    (auth.uid())::text = (storage.foldername(name))[1]
    or get_user_role() = ANY (ARRAY['admin'::text, 'editor'::text, 'visualizador'::text])
  )
);
