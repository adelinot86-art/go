-- ============================================================
--  Gestão Operacional · Mídia dos chamados (vídeo + fotos)
--  Rode no SQL Editor.
-- ============================================================

-- Bucket público de Storage para as mídias
insert into storage.buckets (id, name, public)
values ('chamados-midia', 'chamados-midia', true)
on conflict (id) do nothing;

-- Upload permitido para usuários autenticados neste bucket
drop policy if exists "midia_insert_auth" on storage.objects;
create policy "midia_insert_auth" on storage.objects
  for insert to authenticated with check (bucket_id = 'chamados-midia');

-- Leitura para autenticados (o download público funciona pelo bucket ser public)
drop policy if exists "midia_select_auth" on storage.objects;
create policy "midia_select_auth" on storage.objects
  for select to authenticated using (bucket_id = 'chamados-midia');

-- Referências das mídias por chamado
create table if not exists public.chamado_midia (
  id         bigint generated always as identity primary key,
  chamado_id bigint,
  num_chamado text,
  tipo       text,            -- 'video' | 'foto'
  path       text not null,   -- caminho do arquivo no bucket
  created_at timestamptz default now()
);
create index if not exists chamado_midia_num_idx on public.chamado_midia (num_chamado);

alter table public.chamado_midia enable row level security;
drop policy if exists midia_all_auth on public.chamado_midia;
create policy midia_all_auth on public.chamado_midia for all to authenticated using (true) with check (true);
