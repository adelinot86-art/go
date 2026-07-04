-- ============================================================
--  Gestão Operacional · Clientes — campos adicionais (kits, conexão, ofertas)
--  Rode no SQL Editor DEPOIS de clientes.sql.
-- ============================================================
alter table public.clientes
  add column if not exists qtd_kits         int,
  add column if not exists kits_ids         text[] default '{}',  -- nº de identificação de cada kit
  add column if not exists tipo_kit         text,
  add column if not exists tipo_conexao     text,
  add column if not exists qtd_turmas_mt    int,                  -- turmas de mediação tecnológica
  add column if not exists jornada_ampliada text,                 -- 'Sim' | 'Não'
  add column if not exists tipo_oferta_uapi text;

-- Opções configuráveis (aparecem também em Configurações → Opções dos campos)
insert into public.config_opcoes (campo, valor, ordem) values
  ('tipo_kit','Sala Modelo',1),
  ('tipo_kit','Kit Padrão',2),
  ('tipo_conexao','VSAT',1),
  ('tipo_conexao','Internet Escola',2)
on conflict (campo, valor) do nothing;
