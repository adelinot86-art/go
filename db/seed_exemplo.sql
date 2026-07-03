-- ============================================================
--  Gestão Operacional · DADOS DE EXEMPLO (opcional)
--  Rode no SQL Editor do Supabase DEPOIS do schema.sql, só para
--  visualizar o dashboard populado. Datas são relativas a hoje.
--  Para remover depois: delete from public.chamados where num_chamado like '160%';
-- ============================================================

insert into public.chamados
  (data_abertura, hora_abertura, departamento, num_chamado, chamado_vinculado, num_inep, escola, municipio, tecnico, base_atendimento, tipo_atendimento, status, prioridade, data_prevista, data_encerramento)
values
  (current_date-25,'09:00','7- Serviço de Suporte Técnico Nível 1 e 2 - Canal Educação','16001',null,'22100001','CETI Petrônio Martins','Teresina','Matheus - Inovatech','BASE - TERESINA','Manutenção - Substituição de Equipamentos','CHAMADO FINALIZADO','Média',to_char(current_date-16,'DD/MM/YYYY'),current_date-18),
  (current_date-30,'10:15','7- Serviço de Suporte Técnico Nível 1 e 2 - Canal Educação','16002',null,'22100002','CETI Cristan Barreira','Uruçuí','Halisson Werlon','BASE - URUÇUÍ','Reposição de KIT','CHAMADO FINALIZADO','Alta',to_char(current_date-24,'DD/MM/YYYY'),current_date-20),
  (current_date-15,'08:40','7- Serviço de Suporte Técnico Nível 1 e 2 - Canal Educação','16003',null,'22100003','U.E. Prof. Manoel','Picos','João Pedro','BASE - PICOS','Suporte de Internet via Satélite','CHAMADO FINALIZADO','Média',to_char(current_date-7,'DD/MM/YYYY'),current_date-9),
  (current_date-40,'13:20','7- Serviço de Suporte Técnico Nível 1 e 2 - Canal Educação','16004',null,'22100004','CETI Benedito Martins','Floriano','Carlos Andrade','BASE - FLORIANO','Instalação de Kit','CHAMADO FINALIZADO','Baixa',to_char(current_date-30,'DD/MM/YYYY'),current_date-28),
  (current_date-10,'11:05','7- Serviço de Suporte Técnico Nível 1 e 2 - Canal Educação','16005',null,'22100005','CETI Pedro Mendes','Parnaíba','Matheus - Inovatech','BASE - PARNAÍBA','Manutenção - Substituição de Equipamentos','CHAMADO FINALIZADO','Média',to_char(current_date-3,'DD/MM/YYYY'),current_date-4),
  (current_date-8,'15:30','7- Serviço de Suporte Técnico Nível 1 e 2 - Canal Educação','16006',null,'22100006','Escola Oeiras','Oeiras','Halisson Werlon','BASE - PICOS','Reposição de KIT','CHAMADO FINALIZADO','Alta',to_char(current_date-4,'DD/MM/YYYY'),current_date-2),
  (current_date-0,'09:00','7- Serviço de Suporte Técnico Nível 1 e 2 - Canal Educação','16007',null,'22100007','Escola Campo Maior','Campo Maior','João Pedro','BASE - TERESINA','Suporte de Internet via Satélite','EM EXECUÇÃO DE ROTA','Média',to_char(current_date-2,'DD/MM/YYYY'),null),
  (current_date-1,'14:30','7- Serviço de Suporte Técnico Nível 1 e 2 - Canal Educação','16008',null,'22100008','Escola Piripiri','Piripiri',null,'BASE - PARNAÍBA','Reposição de KIT','PENDÊNCIA SEDUC','Alta',null,null),
  (current_date-3,'10:00','7- Serviço de Suporte Técnico Nível 1 e 2 - Canal Educação','16009',null,'22100009','Escola Bom Jesus','Bom Jesus','Carlos Andrade','BASE - URUÇUÍ','Manutenção - Substituição de Equipamentos','MONTAR ROTA','Alta',to_char(current_date-1,'DD/MM/YYYY'),null),
  (current_date-5,'16:10','11- Serviço de Suporte Técnico - Deslocamento','16010','16003','22100010','Escola SRN','São Raimundo Nonato','Halisson Werlon','BASE - PICOS','Modernização TV 65'' SMART','EM ROTA','Urgente',null,null),
  (current_date-7,'08:20','7- Serviço de Suporte Técnico Nível 1 e 2 - Canal Educação','16011',null,'22100011','Escola Corrente','Corrente',null,'BASE - URUÇUÍ','Instalação de Kit','PENDÊNCIA SEDUC','Alta',null,null),
  (current_date-2,'09:45','7- Serviço de Suporte Técnico Nível 1 e 2 - Canal Educação','16012',null,'22100012','Escola Barras','Barras','João Pedro','BASE - TERESINA','Suporte de Internet via Satélite','AGUARDANDO PEÇA','Baixa',null,null),
  (current_date-6,'13:00','7- Serviço de Suporte Técnico Nível 1 e 2 - Canal Educação','16013',null,'22100013','Escola Esperantina','Esperantina','Matheus - Inovatech','BASE - PARNAÍBA','Manutenção - Substituição de Equipamentos','EM EXECUÇÃO DE ROTA','Média',null,null),
  (current_date-10,'11:30','7- Serviço de Suporte Técnico Nível 1 e 2 - Canal Educação','16014','16001','22100014','Escola Valença','Valença do Piauí','Carlos Andrade','BASE - PICOS','Reposição de KIT','PENDÊNCIA SEDUC','Alta',null,null),
  (current_date-9,'10:50','7- Serviço de Suporte Técnico Nível 1 e 2 - Canal Educação','16015',null,'22100015','Escola Pedro II','Pedro II',null,'BASE - PARNAÍBA','Instalação de Kit','MONTAR ROTA','Média',null,null),
  (current_date-12,'14:00','11- Serviço de Suporte Técnico - Deslocamento','16016',null,'22100016','Escola União','União','João Pedro','BASE - TERESINA','Suporte de Internet via Satélite','CHAMADO FINALIZADO','Média',to_char(current_date-12,'DD/MM/YYYY'),current_date-11),
  (current_date-11,'09:15','7- Serviço de Suporte Técnico Nível 1 e 2 - Canal Educação','16017',null,'22100017','Escola Amarante','Amarante','Halisson Werlon','BASE - URUÇUÍ','Manutenção - Substituição de Equipamentos','EM EXECUÇÃO DE ROTA','Alta',null,null),
  (current_date-13,'15:40','11- Serviço de Suporte Técnico - Deslocamento','16018',null,'22100018','Escola J. Freitas','José de Freitas','Carlos Andrade','BASE - TERESINA','Reposição de KIT','PENDÊNCIA SEDUC','Baixa',null,null);
