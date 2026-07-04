/* ============================================================
   Tema claro/escuro. Inclua no <head> de cada página:
     <script src="assets/js/theme.js"></script>
   Guarda a escolha em localStorage e injeta um botão flutuante.
   Todas as telas usam as mesmas variáveis CSS (--bg, --card, --tx…),
   então um único bloco de override cobre o sistema inteiro.
   ============================================================ */
(function () {
  var KEY = 'go-theme';
  var LIGHT = [
    ':root[data-theme="light"]{',
    '--bg:#eef0f4;--bg2:#e4e7ee;--card:#ffffff;--card2:#f6f7f9;',
    '--s1:rgba(0,0,0,.08);--s2:rgba(0,0,0,.16);',
    '--tx:#1b1e26;--dm:#5b616e;--df:#8a909c;',
    '--cream:#20222b;--gold:#b8860b;--gold2:#996f00;}',
    ':root[data-theme="light"] input,:root[data-theme="light"] select,:root[data-theme="light"] textarea{background:#ffffff !important;color:#1b1e26 !important;border-color:rgba(0,0,0,.18) !important}',
    ':root[data-theme="light"] select option{background:#fff;color:#1b1e26}',
    ':root[data-theme="light"] .nav-rail{background:#ffffff}',
    ':root[data-theme="light"] .top{background:linear-gradient(120deg,rgba(245,197,66,.16),#ffffff)}',
    ':root[data-theme="light"] .dnav,:root[data-theme="light"] .pill{background:rgba(0,0,0,.05)}',
    ':root[data-theme="light"] .ms-btn,:root[data-theme="light"] .ms-panel,:root[data-theme="light"] .ms-tools{background:#ffffff}',
    ':root[data-theme="light"] .gtrack{background-image:repeating-linear-gradient(90deg,rgba(0,0,0,.07) 0 1px,transparent 1px)}',
    ':root[data-theme="light"] body::after{opacity:.22}'
  ].join('');
  var st = document.createElement('style'); st.textContent = LIGHT; document.head.appendChild(st);

  var saved = localStorage.getItem(KEY) || 'dark';
  document.documentElement.setAttribute('data-theme', saved);

  function mount() {
    if (document.getElementById('themeBtn')) return;
    var b = document.createElement('button');
    b.id = 'themeBtn'; b.type = 'button'; b.title = 'Alternar tema claro/escuro';
    b.style.cssText = 'position:fixed;bottom:16px;right:16px;z-index:1600;width:44px;height:44px;border-radius:50%;' +
      'border:1px solid var(--s2);background:var(--card);color:var(--gold);cursor:pointer;' +
      'box-shadow:0 12px 26px -12px rgba(0,0,0,.5);font-size:17px;display:grid;place-items:center';
    function icon() { b.innerHTML = document.documentElement.getAttribute('data-theme') === 'light' ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>'; }
    b.onclick = function () {
      var cur = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', cur);
      localStorage.setItem(KEY, cur); icon();
    };
    document.body.appendChild(b); icon();
  }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
})();
