/* ============================================================
   Barra de navegação lateral (esquerda). Inclua em cada página:
     <script src="assets/js/nav.js"></script>
   No mobile vira uma barra inferior.
   ============================================================ */
(function () {
  var ITEMS = [
    { href: 'index.html',       ic: 'fa-gauge-high',     lbl: 'Dashboard' },
    { href: 'gantt.html',       ic: 'fa-bars-staggered', lbl: 'Gantt' },
    { href: 'calculadora.html', ic: 'fa-calculator',     lbl: 'Calculadora' },
    { href: 'config.html',      ic: 'fa-gear',           lbl: 'Configurações' }
  ];
  var cur = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (!cur) cur = 'index.html';

  var css = ''
    + '.nav-rail{position:fixed;left:0;top:0;bottom:0;width:66px;z-index:900;display:flex;flex-direction:column;'
    + 'align-items:center;gap:6px;padding:14px 0;background:#0c0c12;border-right:1px solid rgba(245,197,66,.14)}'
    + '.nav-rail .nlogo{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;color:#1a1405;font-size:18px;margin-bottom:10px;'
    + 'background:linear-gradient(135deg,#f5c542,#e0a818);box-shadow:0 0 22px rgba(245,197,66,.35)}'
    + '.nav-rail a{position:relative;width:46px;height:46px;border-radius:12px;display:grid;place-items:center;color:#a8a596;'
    + 'font-size:17px;text-decoration:none;transition:.18s}'
    + '.nav-rail a:hover{background:rgba(245,197,66,.12);color:#f5f3ea}'
    + '.nav-rail a.on{background:linear-gradient(135deg,rgba(245,197,66,.9),rgba(224,168,24,.9));color:#1a1405}'
    + '.nav-rail a .tip{position:absolute;left:56px;white-space:nowrap;background:#15151f;color:#f5f3ea;border:1px solid rgba(255,255,255,.12);'
    + 'padding:5px 10px;border-radius:8px;font-family:Inter,sans-serif;font-size:12px;opacity:0;pointer-events:none;transform:translateX(-6px);transition:.15s;z-index:5}'
    + '.nav-rail a:hover .tip{opacity:1;transform:none}'
    + 'body{padding-left:66px}'
    + '@media(max-width:720px){'
    + '.nav-rail{left:0;right:0;top:auto;bottom:0;width:auto;height:58px;flex-direction:row;justify-content:space-around;'
    + 'padding:0 6px;border-right:none;border-top:1px solid rgba(245,197,66,.14)}'
    + '.nav-rail .nlogo{display:none}.nav-rail a{width:52px;height:44px;font-size:16px}'
    + '.nav-rail a .tip{display:none}'
    + 'body{padding-left:0;padding-bottom:64px}}';

  var links = ITEMS.map(function (it) {
    var on = (cur === it.href) ? ' on' : '';
    return '<a class="' + on + '" href="' + it.href + '" title="' + it.lbl + '">'
      + '<i class="fa-solid ' + it.ic + '"></i><span class="tip">' + it.lbl + '</span></a>';
  }).join('');

  function mount() {
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var rail = document.createElement('nav'); rail.className = 'nav-rail';
    rail.innerHTML = '<div class="nlogo"><i class="fa-solid fa-headset"></i></div>' + links;
    document.body.appendChild(rail);
  }
  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
