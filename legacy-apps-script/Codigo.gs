/**************************************************************
 * DASHBOARD DE CHAMADOS · SUPORTE TÉCNICO
 * Code.gs — Roteamento do Web App e utilidades de template.
 *
 * ESTRUTURA DOS ARQUIVOS NO PROJETO APPS SCRIPT:
 *   Code.gs            → roteamento (este arquivo)
 *   Dados.gs           → leitura da planilha + cache
 *   Estilos.html       → CSS compartilhado
 *   Index.html         → estrutura do dashboard
 *   Index_JS.html      → lógica do dashboard
 *   Calculadora.html   → estrutura da calculadora
 *   Calculadora_JS.html→ lógica da calculadora
 *   Dados_Servicos.html→ tabelas de USS/UST/localizador
 *
 * IMPLANTAR ▸ Gerenciar implantações ▸ editar ▸ Nova versão ▸ Implantar
 *   - Executar como: Eu mesmo
 *   - Quem tem acesso: Qualquer pessoa (ou da sua organização)
 **************************************************************/

/**
 * Serve o HTML, roteando por ?page= (index | calculadora).
 */
function doGet(e) {
  var page = (e && e.parameter && e.parameter.page) ? e.parameter.page : 'index';

  var arquivo, titulo;
  if (page === 'calculadora') {
    arquivo = 'Calculadora';
    titulo  = 'Calculadora de Serviços · Suporte Técnico';
  } else {
    arquivo = 'Index';
    titulo  = 'Dashboard de Chamados · Suporte Técnico';
  }

  var t = HtmlService.createTemplateFromFile(arquivo);
  t.appUrl = getAppUrl_();          // URL base para navegar entre as páginas

  return t.evaluate()
    .setTitle(titulo)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * URL pública do Web App implantado.
 */
function getAppUrl_() {
  return ScriptApp.getService().getUrl();
}

/**
 * Inclui o conteúdo de outro arquivo HTML dentro do template.
 * Uso no HTML:  <?!= include('Estilos'); ?>
 */
function include(nome) {
  return HtmlService.createHtmlOutputFromFile(nome).getContent();
}


/**************************************************************
 * Dados.gs — Leitura da aba de Chamados (+ cache de 60s).
 * Chamado pelo front-end via google.script.run.getDadosChamados()
 **************************************************************/

// Nome da aba de chamados (aceita variações com emoji/acentos).
var ABA_CHAMADOS_HINT = 'hamado';   // casa com "📋 Chamados", "Chamados", etc.
var LINHA_CABECALHO   = 5;          // headers na linha 5 (dados a partir da 6)
var CACHE_KEY         = 'chamados_v1';
var CACHE_TTL         = 60;         // segundos (acelera aberturas repetidas)

/**
 * Lê a aba de Chamados e devolve { headers, rows } já limpos.
 * @param {boolean} forcar  Se true, ignora o cache e relê a planilha.
 */
function getDadosChamados(forcar) {
  var cache = CacheService.getScriptCache();

  // 1) Tenta servir do cache (resposta quase instantânea).
  if (!forcar) {
    var hit = cache.get(CACHE_KEY);
    if (hit) {
      try { return JSON.parse(hit); } catch (e) { /* cache inválido: relê */ }
    }
  }

  // 2) Lê da planilha.
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = encontrarAba_(ss, ABA_CHAMADOS_HINT);
  if (!sheet) {
    return { erro: 'Aba de Chamados não encontrada. Verifique o nome da aba.' };
  }

  var valores = sheet.getDataRange().getValues();
  if (valores.length < LINHA_CABECALHO) {
    return { erro: 'A aba não possui linhas suficientes de dados.' };
  }

  // Cabeçalho na linha indicada (índice = LINHA_CABECALHO - 1)
  var headers = valores[LINHA_CABECALHO - 1].map(function (h) {
    return formatarValor_(h).trim();
  });
  while (headers.length && !headers[headers.length - 1]) headers.pop(); // remove colunas vazias no fim

  var rows = [];
  for (var i = LINHA_CABECALHO; i < valores.length; i++) {
    var linha = [];
    var temConteudo = false;
    for (var c = 0; c < headers.length; c++) {
      var v = formatarValor_(valores[i][c]);
      if (v !== '') temConteudo = true;
      linha.push(v);
    }
    if (temConteudo) rows.push(linha);
  }

  var out = {
    sheetName: sheet.getName(),
    headers: headers,
    rows: rows,
    atualizadoEm: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm:ss')
  };

  // 3) Guarda no cache (limite de 100KB por chave: só grava se couber).
  try {
    var s = JSON.stringify(out);
    if (s.length < 95000) cache.put(CACHE_KEY, s, CACHE_TTL);
  } catch (e) { /* ignora falha de cache */ }

  return out;
}

/**
 * Limpa o cache manualmente (útil ao testar).
 */
function limparCacheChamados() {
  CacheService.getScriptCache().remove(CACHE_KEY);
}

/* ===================== HELPERS DE PLANILHA ===================== */

/**
 * Encontra a aba cujo nome contém o "hint" (ignorando acentos/emoji/caixa).
 */
function encontrarAba_(ss, hint) {
  var alvo = normalizar_(hint);
  var abas = ss.getSheets();
  for (var i = 0; i < abas.length; i++) {
    if (normalizar_(abas[i].getName()).indexOf(alvo) !== -1) return abas[i];
  }
  return null;
}

/**
 * Converte datas em dd/MM/yyyy e remove quebras de linha.
 */
function formatarValor_(v) {
  if (v === null || v === undefined) return '';
  if (Object.prototype.toString.call(v) === '[object Date]') {
    return Utilities.formatDate(v, Session.getScriptTimeZone(), 'dd/MM/yyyy');
  }
  var s = String(v).trim();
  if (/^\d+\.0$/.test(s)) s = s.slice(0, -2);
  s = s.replace(/[\r\n]+/g, ' ').trim();
  return s;
}

/**
 * Normaliza texto: minúsculo, sem acento, sem espaços extras.
 */
function normalizar_(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}


/**************************************************************
 * CADASTRO \u00b7 Grava um novo chamado na aba de Chamados.
 * Chamado pelo front-end via:
 *   google.script.run
 *     .withSuccessHandler(...).withFailureHandler(...)
 *     .adicionarChamado(dados)
 *
 * @param {Object} dados  Objeto { "N\u00ba Chamado": "...", "Munic\u00edpio": "...", ... }
 *                        As chaves s\u00e3o os nomes das colunas (aceita varia\u00e7\u00e3o de acento).
 * @return {Object} { ok:true, numero, linha } em caso de sucesso; { erro } caso contr\u00e1rio.
 **************************************************************/
function adicionarChamado(dados) {
  try {
    if (!dados || typeof dados !== 'object') return { erro: 'Dados inv\u00e1lidos.' };

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = encontrarAba_(ss, ABA_CHAMADOS_HINT);
    if (!sheet) return { erro: 'Aba de Chamados n\u00e3o encontrada. Verifique o nome da aba.' };

    var ultimaCol = sheet.getLastColumn();
    if (ultimaCol < 1) return { erro: 'A aba de Chamados est\u00e1 vazia.' };

    // Cabe\u00e7alho completo (linha 5), sem remover colunas vazias \u2014 precisamos dos \u00edndices reais.
    var headers = sheet.getRange(LINHA_CABECALHO, 1, 1, ultimaCol).getValues()[0]
      .map(function (h) { return String(h == null ? '' : h).trim(); });

    // Mapa dos dados recebidos, indexado pelo nome normalizado da coluna.
    var mapDados = {};
    Object.keys(dados).forEach(function (k) { mapDados[normalizar_(k)] = dados[k]; });
    function valorPara(header) {
      var v = mapDados[normalizar_(header)];
      return (v === undefined || v === null) ? '' : String(v).trim();
    }

    // N\u00ba Chamado \u00e9 obrigat\u00f3rio.
    var numero = valorPara('N\u00ba Chamado');
    if (!numero) return { erro: 'O n\u00famero do chamado \u00e9 obrigat\u00f3rio.' };

    // \u00cdndice da coluna N\u00ba Chamado (para checar duplicidade).
    var colNum = -1;
    for (var h = 0; h < headers.length; h++) {
      if (headers[h] && normalizar_(headers[h]) === normalizar_('N\u00ba Chamado')) { colNum = h; break; }
    }
    if (colNum >= 0 && sheet.getLastRow() > LINHA_CABECALHO) {
      var existentes = sheet.getRange(LINHA_CABECALHO + 1, colNum + 1, sheet.getLastRow() - LINHA_CABECALHO, 1).getValues();
      for (var r = 0; r < existentes.length; r++) {
        if (String(existentes[r][0] == null ? '' : existentes[r][0]).trim() === numero) {
          return { erro: 'J\u00e1 existe um chamado com o n\u00famero ' + numero + '.' };
        }
      }
    }

    var tz = Session.getScriptTimeZone();
    var hoje = new Date();

    // Monta a linha na ordem exata das colunas.
    var linha = [];
    for (var c = 0; c < headers.length; c++) {
      var col = headers[c];
      var nc = normalizar_(col);
      var val = col ? valorPara(col) : '';

      // Data de Abertura \u2192 Date (default: hoje).
      if (nc.indexOf('data de abertura') !== -1) {
        var dab = val ? parseDataFlex_(val) : hoje;
        linha.push(dab ? new Date(dab.getFullYear(), dab.getMonth(), dab.getDate()) : val);
        continue;
      }
      // Data de Encerramento \u2192 Date (vazio se n\u00e3o informado).
      if (nc.indexOf('data encerramento') !== -1 || nc.indexOf('data de encerramento') !== -1) {
        if (val) { var den = parseDataFlex_(val); linha.push(den ? new Date(den.getFullYear(), den.getMonth(), den.getDate()) : val); }
        else linha.push('');
        continue;
      }
      // Hora de Abertura \u2192 string HH:mm (default: agora).
      if (nc.indexOf('hora abertura') !== -1 || nc.indexOf('hora de abertura') !== -1) {
        linha.push(val || Utilities.formatDate(hoje, tz, 'HH:mm'));
        continue;
      }
      // Demais colunas (inclui "Data Prevista", que pode ser texto livre) \u2192 como veio.
      linha.push(val);
    }

    // Grava na primeira linha ap\u00f3s a \u00faltima preenchida.
    var destino = Math.max(LINHA_CABECALHO + 1, sheet.getLastRow() + 1);
    sheet.getRange(destino, 1, 1, headers.length).setValues([linha]);

    // Invalida o cache para a pr\u00f3xima leitura j\u00e1 trazer o novo registro.
    limparCacheChamados();

    return { ok: true, numero: numero, linha: destino };
  } catch (e) {
    return { erro: 'Erro ao gravar: ' + (e && e.message ? e.message : e) };
  }
}

/**
 * Converte 'aaaa-mm-dd' (input date) ou 'dd/mm/aaaa' em Date. Retorna null se inv\u00e1lido.
 */
function parseDataFlex_(v) {
  v = String(v || '').trim();
  var m = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) { var d1 = new Date(+m[1], +m[2] - 1, +m[3]); return isNaN(d1) ? null : d1; }
  m = v.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/);
  if (m) { var y = +m[3]; if (y < 100) y += 2000; var d2 = new Date(y, +m[2] - 1, +m[1]); return isNaN(d2) ? null : d2; }
  return null;
}
