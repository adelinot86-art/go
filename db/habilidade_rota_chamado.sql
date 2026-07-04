-- ============================================================
--  Gestão Operacional · Habilidade / Rota no chamado + opções
--  Rode no SQL Editor DEPOIS de config_e_admin.sql e field_service.sql.
-- ============================================================

-- Campos no chamado (usados no check de compatibilidade com o técnico)
alter table public.chamados
  add column if not exists habilidade text,
  add column if not exists rota       text;

-- Opções configuráveis (aparecem em Configurações → Opções dos campos,
-- e são selecionadas no cadastro de técnico e de chamado)
insert into public.config_opcoes (campo, valor, ordem) values
  ('habilidade','Instalação',1),
  ('habilidade','Manutenção',2),
  ('habilidade','Operador',3),
  ('habilidade','Técnico',4),
  ('habilidade','Intra-cofre',5),
  ('habilidade','Extra-cofre',6),
  ('habilidade','Atividade sem AL',7),
  ('rota','Teresina - Interior',1),
  ('rota','Picos - Interior',2),
  ('rota','Floriano - Interior',3),
  ('rota','Parnaíba - Interior',4),
  ('rota','Uruçuí - Interior',5)
on conflict (campo, valor) do nothing;
