-- ============================================================
--  Gestão Operacional · Perfis de usuário (tipo: usuário | técnico)
--  Rode no SQL Editor. Define quem é técnico (login vai direto para a
--  caixa dele) e quem é usuário/despachante (acessa o sistema completo).
-- ============================================================
create table if not exists public.perfis (
  email      text primary key,
  tipo       text not null default 'usuario',  -- 'usuario' | 'tecnico'
  nome       text,
  created_at timestamptz default now()
);

alter table public.perfis enable row level security;
drop policy if exists perfis_all_auth on public.perfis;
create policy perfis_all_auth on public.perfis for all to authenticated using (true) with check (true);

-- Dica: marque seu próprio e-mail como usuário (admin) para não ser tratado como técnico:
-- insert into public.perfis (email, tipo, nome) values ('SEU-EMAIL', 'usuario', 'Administrador')
-- on conflict (email) do update set tipo=excluded.tipo;
