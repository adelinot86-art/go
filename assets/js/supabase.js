/* ============================================================
   Cliente Supabase + camada de dados e autenticação.
   Requer, ANTES deste arquivo:
     <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
     <script src="assets/js/config.js"></script>
   Expõe (global): sb, fetchChamados(), insertChamado(), requireAuth(), logout()
   ============================================================ */
(function (global) {
  if (!global.SUPABASE_URL || !global.SUPABASE_ANON_KEY || /SEU-PROJETO|SUA_CHAVE/.test(global.SUPABASE_ANON_KEY)) {
    console.error('[config] Preencha assets/js/config.js com SUPABASE_URL e SUPABASE_ANON_KEY.');
  }
  var sb = global.supabase.createClient(global.SUPABASE_URL, global.SUPABASE_ANON_KEY);
  global.sb = sb;

  /* Mapa: coluna do banco -> cabeçalho de exibição.
     Mantém o dashboard 100% igual (ele usa os cabeçalhos como chaves). */
  var COLS = [
    ['data_abertura',         'Data de Abertura'],
    ['hora_abertura',         'Hora Abertura'],
    ['departamento',          'Departamento'],
    ['num_chamado',           'Nº Chamado'],
    ['chamado_vinculado',     'Chamado Vinculado | Raiz | Item 7'],
    ['num_inep',              'Nº INEP'],
    ['escola',                'Escola | Identificação Interna - NTI'],
    ['municipio',             'Município'],
    ['tecnico',               'Técnico Responsável'],
    ['base_atendimento',      'Base de Atendimento'],
    ['tipo_atendimento',      'Tipo de Atendimento'],
    ['status',                'Status'],
    ['prioridade',            'Prioridade'],
    ['data_prevista',         'Data Prevista'],
    ['materiais',             'Materiais'],
    ['num_chamado_materiais', 'Nº Chamado Materiais'],
    ['relatorio_tecnico',     'Relatório Técnico'],
    ['data_encerramento',     'Data Encerramento'],
    ['link_atividades',       'Link Gerador de atividades'],
    ['observacoes',           'Observações'],
    ['habilidade',            'Habilidade'],
    ['rota',                  'Rota'],
    ['uss_total',             'USS'],
    ['uss_detalhe',           'USS detalhe']
  ];
  var DATE_COLS = { data_abertura: 1, data_encerramento: 1, data_prevista: 1 };

  function isoParaBR(v) {
    if (!v) return '';
    var m = String(v).match(/^(\d{4})-(\d{2})-(\d{2})/);
    return m ? (m[3] + '/' + m[2] + '/' + m[1]) : String(v);
  }
  function cell(dbcol, val) {
    if (val == null) return '';
    if (DATE_COLS[dbcol]) return isoParaBR(val);
    return String(val);
  }

  /* Lê todos os chamados no formato { sheetName, headers, rows } (mesma forma do backend antigo). */
  global.fetchChamados = function () {
    return sb.from('chamados').select('*').order('data_abertura', { ascending: false, nullsFirst: false })
      .then(function (res) {
        if (res.error) throw res.error;
        var headers = COLS.map(function (c) { return c[1]; });
        var rows = (res.data || []).map(function (r) {
          return COLS.map(function (c) { return cell(c[0], r[c[0]]); });
        });
        return { sheetName: 'Chamados', headers: headers, rows: rows };
      });
  };

  /* Insere um chamado a partir de um objeto com chaves = cabeçalhos de exibição. */
  global.insertChamado = function (dadosDisplay) {
    var dispParaDb = {}; COLS.forEach(function (c) { dispParaDb[c[1]] = c[0]; });
    var rec = {};
    Object.keys(dadosDisplay).forEach(function (disp) {
      var db = dispParaDb[disp]; if (!db) return;
      var v = dadosDisplay[disp];
      if (v != null && String(v).trim() !== '') rec[db] = v;
    });
    return sb.from('chamados').insert(rec).select().single()
      .then(function (res) { if (res.error) throw res.error; return res.data; });
  };

  /* Atualiza um chamado existente (localizado pelo Nº Chamado original). */
  global.updateChamado = function (numOriginal, dadosDisplay) {
    var dispParaDb = {}; COLS.forEach(function (c) { dispParaDb[c[1]] = c[0]; });
    var rec = {};
    COLS.forEach(function (c) {
      if (c[0] === 'uss_total' || c[0] === 'uss_detalhe') return; // não gerenciados pelo cadastro: preserva
      var disp = c[1], db = c[0];
      var v = dadosDisplay[disp];
      // grava o valor (ou limpa o campo se veio vazio)
      rec[db] = (v != null && String(v).trim() !== '') ? v : null;
    });
    delete rec.created_at; delete rec.id;
    return sb.from('chamados').update(rec).eq('num_chamado', numOriginal).select().single()
      .then(function (res) { if (res.error) throw res.error; return res.data; });
  };

  /* ===== Opções configuráveis dos campos ===== */
  global.fetchOpcoes = function () {
    return sb.from('config_opcoes').select('id,campo,valor,ordem').order('campo').order('ordem')
      .then(function (res) {
        if (res.error) throw res.error;
        var map = {};
        (res.data || []).forEach(function (r) { (map[r.campo] = map[r.campo] || []).push({ id: r.id, valor: r.valor, ordem: r.ordem }); });
        return map;
      });
  };
  global.addOpcao = function (campo, valor, ordem) {
    return sb.from('config_opcoes').insert({ campo: campo, valor: valor, ordem: ordem || 0 }).select().single()
      .then(function (res) { if (res.error) throw res.error; return res.data; });
  };
  global.removeOpcao = function (id) {
    return sb.from('config_opcoes').delete().eq('id', id)
      .then(function (res) { if (res.error) throw res.error; return true; });
  };
  global.setOrdemOpcao = function (id, ordem) {
    return sb.from('config_opcoes').update({ ordem: ordem }).eq('id', id)
      .then(function (res) { if (res.error) throw res.error; return true; });
  };

  /* ===== Técnicos de campo ===== */
  global.fetchTecnicos = function () {
    return sb.from('tecnicos').select('*').order('nome')
      .then(function (res) { if (res.error) throw res.error; return res.data || []; });
  };
  global.addTecnico = function (obj) {
    return sb.from('tecnicos').insert(obj).select().single()
      .then(function (res) { if (res.error) throw res.error; return res.data; });
  };
  global.updateTecnico = function (id, obj) {
    return sb.from('tecnicos').update(obj).eq('id', id).select().single()
      .then(function (res) { if (res.error) throw res.error; return res.data; });
  };
  global.removeTecnico = function (id) {
    return sb.from('tecnicos').delete().eq('id', id)
      .then(function (res) { if (res.error) throw res.error; return true; });
  };
  // Exceções de escala (calendário de disponibilidade).
  global.fetchExcecoesTodas = function () {
    return sb.from('tecnico_excecoes').select('*')
      .then(function (res) { if (res.error) throw res.error; return res.data || []; });
  };
  global.fetchExcecoes = function (tecnicoId) {
    return sb.from('tecnico_excecoes').select('*').eq('tecnico_id', tecnicoId).order('data')
      .then(function (res) { if (res.error) throw res.error; return res.data || []; });
  };
  global.setExcecao = function (obj) {
    return sb.from('tecnico_excecoes').upsert(obj, { onConflict: 'tecnico_id,data' }).select().single()
      .then(function (res) { if (res.error) throw res.error; return res.data; });
  };
  global.removeExcecaoData = function (tecnicoId, data) {
    return sb.from('tecnico_excecoes').delete().eq('tecnico_id', tecnicoId).eq('data', data)
      .then(function (res) { if (res.error) throw res.error; return true; });
  };

  // Técnico do usuário logado (casado pelo e-mail).
  global.meuTecnico = function () {
    return sb.auth.getUser().then(function (r) {
      var email = r.data && r.data.user && r.data.user.email;
      if (!email) return null;
      return sb.from('tecnicos').select('*').ilike('email', email).limit(1)
        .then(function (res) { if (res.error) throw res.error; return (res.data && res.data[0]) || null; });
    });
  };
  // Chamados de um técnico (por nome). Retorna registros crus (com colunas de field service).
  global.fetchChamadosDoTecnico = function (nome) {
    return sb.from('chamados').select('*').eq('tecnico', nome)
      .order('agendado_em', { ascending: true, nullsFirst: false })
      .then(function (res) { if (res.error) throw res.error; return res.data || []; });
  };
  // Agenda/reagenda uma atividade (Gantt). agendadoIso = ISO completo; dur em minutos.
  global.agendarChamado = function (id, agendadoIso, duracaoMin) {
    return sb.from('chamados').update({ agendado_em: agendadoIso, duracao_min: duracaoMin }).eq('id', id).select().single()
      .then(function (res) { if (res.error) throw res.error; return res.data; });
  };
  // Remove o horário agendado (volta para "sem horário").
  global.desagendarChamado = function (id) {
    return sb.from('chamados').update({ agendado_em: null }).eq('id', id).select().single()
      .then(function (res) { if (res.error) throw res.error; return res.data; });
  };
  // Todos os chamados atribuídos a técnicos (registros crus) — base do Gantt.
  global.fetchChamadosAtribuidos = function () {
    return sb.from('chamados').select('*').not('tecnico', 'is', null)
      .then(function (res) { if (res.error) throw res.error; return (res.data || []).filter(function (c) { return String(c.tecnico || '').trim() && c.tecnico !== '-'; }); });
  };
  // Todos os chamados (registros crus) — base do Gantt + barra lateral.
  global.fetchChamadosTodos = function () {
    return sb.from('chamados').select('*')
      .then(function (res) { if (res.error) throw res.error; return res.data || []; });
  };
  // Atribui técnico + agenda numa tacada só (usado no arrastar-soltar).
  global.atribuirAgendar = function (id, tecnicoNome, agendadoIso, dur) {
    var patch = { agendado_em: agendadoIso, duracao_min: dur || 60 };
    if (tecnicoNome) patch.tecnico = tecnicoNome;
    return sb.from('chamados').update(patch).eq('id', id).select().single()
      .then(function (res) { if (res.error) throw res.error; return res.data; });
  };

  // Agenda de um dia (todos os técnicos) — para o Gantt. diaISO = 'aaaa-mm-dd'.
  global.fetchAgenda = function (diaISO) {
    var ini = diaISO + 'T00:00:00', fim = diaISO + 'T23:59:59';
    return sb.from('chamados').select('*').gte('agendado_em', ini).lte('agendado_em', fim)
      .order('agendado_em', { ascending: true })
      .then(function (res) { if (res.error) throw res.error; return res.data || []; });
  };
  // Transição de status feita pelo técnico: 'deslocamento' | 'execucao' | 'encerrado'.
  global.setStatusTecnico = function (id, acao, extras) {
    extras = extras || {};
    var agora = new Date().toISOString();
    var patch = {};
    if (acao === 'deslocamento') { patch.status = 'EM DESLOCAMENTO'; patch.deslocamento_em = agora; }
    else if (acao === 'execucao') { patch.status = 'EM EXECUÇÃO'; patch.execucao_em = agora; }
    else if (acao === 'encerrado') {
      patch.status = extras.nome ? ('ENCERRADO PELO TÉCNICO - ' + extras.nome) : 'ENCERRADO PELO TÉCNICO';
      patch.encerrado_em = agora;
      patch.data_encerramento = agora.slice(0, 10);
      if (extras.nome) patch.encerrado_por = extras.nome;
      if (extras.relatorio) patch.relatorio_tecnico = extras.relatorio;
      if (extras.materiais) patch.materiais = extras.materiais;
      if (extras.uss_total != null) patch.uss_total = extras.uss_total;
      if (extras.uss_detalhe) patch.uss_detalhe = extras.uss_detalhe;
    }
    else if (acao === 'pendente') {
      // Não conclui: registra o que foi tratado e devolve o chamado à fila (não atribuído/sem horário).
      patch.status = 'PENDENTE';
      patch.agendado_em = null;   // sai da linha do tempo do Gantt
      patch.tecnico = null;       // volta para "não atribuídos"
      patch.relatorio_tecnico = (extras.nome ? ('[' + extras.nome + '] ') : '') + (extras.relatorio || '');
      if (extras.materiais) patch.materiais = extras.materiais;
    }
    else { return Promise.reject(new Error('Ação inválida.')); }
    return sb.from('chamados').update(patch).eq('id', id).select().single()
      .then(function (res) { if (res.error) throw res.error; return res.data; });
  };

  /* ===== Notificações do técnico ===== */
  global.criarNotificacao = function (obj) {
    return sb.from('notificacoes').insert(obj)
      .then(function (res) { if (res.error) throw res.error; return true; });
  };
  global.fetchNotificacoes = function (nome) {
    return sb.from('notificacoes').select('*').ilike('tecnico_nome', nome).order('created_at', { ascending: false }).limit(30)
      .then(function (res) { if (res.error) throw res.error; return res.data || []; });
  };
  global.marcarNotificacoesLidas = function (nome) {
    return sb.from('notificacoes').update({ lida: true }).ilike('tecnico_nome', nome).eq('lida', false)
      .then(function (res) { if (res.error) throw res.error; return true; });
  };

  /* ===== Usuários (via Edge Function 'admin-users', que usa a service_role no servidor) ===== */
  global.adminUsers = function (action, payload) {
    return sb.functions.invoke('admin-users', { body: Object.assign({ action: action }, payload || {}) })
      .then(function (res) {
        if (res.error) {
          // tenta extrair a mensagem do corpo da resposta de erro
          if (res.error.context && typeof res.error.context.json === 'function') {
            return res.error.context.json().then(function (b) { throw new Error((b && b.error) || res.error.message); });
          }
          throw new Error(res.error.message || 'Falha ao chamar a função de usuários.');
        }
        if (res.data && res.data.error) throw new Error(res.data.error);
        return res.data;
      });
  };

  /* ===== Perfis (tipo de usuário) ===== */
  global.fetchPerfis = function () {
    return sb.from('perfis').select('*').order('email')
      .then(function (res) { if (res.error) throw res.error; return res.data || []; });
  };
  global.fetchPerfil = function (email) {
    return sb.from('perfis').select('*').ilike('email', email).limit(1)
      .then(function (res) { if (res.error) throw res.error; return (res.data && res.data[0]) || null; });
  };
  global.setPerfil = function (obj) {
    return sb.from('perfis').upsert(obj, { onConflict: 'email' }).select().single()
      .then(function (res) { if (res.error) throw res.error; return res.data; });
  };
  global.paginaHome = function (perfil) { return (perfil && perfil.tipo === 'tecnico') ? 'tecnico.html' : 'index.html'; };

  /* ===== Autenticação ===== */
  global.requireAuth = function () {
    return sb.auth.getSession().then(function (res) {
      var session = res.data && res.data.session;
      if (!session) { location.replace('login.html'); return null; }
      return session.user;
    });
  };
  global.logout = function () {
    sb.auth.signOut().then(function () { location.replace('login.html'); });
  };
  // Exige login E que o usuário NÃO seja técnico (telas admin). Técnico é mandado para a caixa dele.
  global.requireAuthAdmin = function () {
    return sb.auth.getSession().then(function (res) {
      var session = res.data && res.data.session;
      if (!session) { location.replace('login.html'); return null; }
      var user = session.user;
      return sb.from('perfis').select('tipo').ilike('email', user.email).limit(1)
        .then(function (r) {
          var p = r.data && r.data[0];
          if (p && p.tipo === 'tecnico') { location.replace('tecnico.html'); return null; }
          return user;
        }).catch(function () { return user; });
    });
  };
})(window);
