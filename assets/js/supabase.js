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
    ['observacoes',           'Observações']
  ];
  var DATE_COLS = { data_abertura: 1, data_encerramento: 1 };

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
})(window);
