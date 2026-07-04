/* ============================================================
   Recibo do cálculo de USS de um chamado — PDF e imagem (PNG).
   Requer jsPDF (window.jspdf) para o PDF e, opcionalmente, o logo
   (window.OROS_LOGO / window.OROS_LOGO_IMG de assets/js/logo.js).
   Uso: reciboUssPDF(chamado) / reciboUssIMG(chamado)
   ============================================================ */
(function () {
  function linhas(det) { return (det || '').split(' | ').filter(Boolean); }
  function fmtData(d) { if (!d) return '—'; var s = String(d); var m = s.match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? (m[3] + '/' + m[2] + '/' + m[1]) : s; }
  function campos(c) {
    return [
      ['Nº do Chamado', c.num_chamado || '—'],
      ['Escola', c.escola || '—'],
      ['Município', c.municipio || '—'],
      ['Técnico', c.encerrado_por || c.tecnico || '—'],
      ['Tipo de atendimento', c.tipo_atendimento || '—'],
      ['Encerrado em', fmtData(c.data_encerramento || c.encerrado_em)]
    ];
  }
  function logoAR() {
    var im = window.OROS_LOGO_IMG;
    return (im && im.naturalWidth && im.naturalHeight) ? (im.naturalWidth / im.naturalHeight) : 2.26;
  }

  window.reciboUssPDF = function (c) {
    if (!window.jspdf || !window.jspdf.jsPDF) { alert('Biblioteca de PDF não carregada.'); return; }
    var doc = new window.jspdf.jsPDF({ unit: 'pt', format: 'a4' });
    var W = doc.internal.pageSize.getWidth(), band = 76;
    doc.setFillColor(245, 197, 66); doc.rect(0, 0, W, band, 'F');
    doc.setTextColor(26, 20, 5); doc.setFont('helvetica', 'bold'); doc.setFontSize(15);
    doc.text('Base de Cálculo — USS (Item 07)', 40, 32);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(11);
    doc.text('Chamado nº ' + (c.num_chamado || '—'), 40, 54);
    try {
      if (window.OROS_LOGO) {
        var lh = 36, lw = lh * logoAR();
        doc.setFillColor(255, 246, 230); doc.roundedRect(W - 40 - lw - 12, 20, lw + 12, lh + 8, 5, 5, 'F');
        doc.addImage(window.OROS_LOGO, 'PNG', W - 40 - lw - 6, 24, lw, lh);
      }
    } catch (e) { /* ignora falha do logo */ }

    var y = band + 28; doc.setTextColor(40, 40, 40); doc.setFontSize(10.5);
    campos(c).forEach(function (f) {
      doc.setFont('helvetica', 'bold'); doc.text(f[0] + ':', 40, y);
      doc.setFont('helvetica', 'normal'); doc.text(String(f[1]), 210, y); y += 20;
    });
    y += 10; doc.setFont('helvetica', 'bold'); doc.text('Atividades / Deslocamento', 40, y); y += 18;
    doc.setFont('helvetica', 'normal');
    var ls = linhas(c.uss_detalhe);
    if (!ls.length) { doc.text('—', 48, y); y += 16; }
    ls.forEach(function (l) { var w = doc.splitTextToSize('• ' + l, W - 90); doc.text(w, 48, y); y += 14 * w.length; });

    y += 16; doc.setFillColor(245, 197, 66); doc.rect(40, y - 15, W - 80, 30, 'F');
    doc.setTextColor(26, 20, 5); doc.setFont('helvetica', 'bold'); doc.setFontSize(13);
    doc.text('TOTAL USS: ' + (c.uss_total != null ? c.uss_total : '—'), 54, y + 5);

    doc.setFontSize(8); doc.setTextColor(120, 120, 120);
    doc.text('OROS Soluções Educacionais · Documento gerado em ' + new Date().toLocaleString('pt-BR'), 40, doc.internal.pageSize.getHeight() - 30);
    doc.save('USS_chamado_' + (c.num_chamado || 'sn') + '.pdf');
  };

  window.reciboUssIMG = function (c) {
    var ls = linhas(c.uss_detalhe), infos = campos(c), pad = 28, W = 760, lh = 26, hdr = 74;
    var H = hdr + pad + infos.length * lh + 44 + Math.max(1, ls.length) * lh + 74;
    var cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    var x = cv.getContext('2d');
    x.fillStyle = '#15151f'; x.fillRect(0, 0, W, H);
    x.fillStyle = '#f5c542'; x.fillRect(0, 0, W, hdr);
    x.fillStyle = '#1a1405'; x.font = 'bold 22px Arial'; x.fillText('Base de Cálculo — USS', pad, 34);
    x.font = '15px Arial'; x.fillText('Chamado nº ' + (c.num_chamado || '—'), pad, 58);
    try {
      var im = window.OROS_LOGO_IMG;
      if (im && im.complete && im.naturalWidth) {
        var lgh = 42, lgw = lgh * logoAR();
        x.fillStyle = '#fff6e6'; x.fillRect(W - pad - lgw - 12, 14, lgw + 12, lgh + 8);
        x.drawImage(im, W - pad - lgw - 6, 18, lgw, lgh);
      }
    } catch (e) { /* ignora */ }

    var y = hdr + pad + 8;
    infos.forEach(function (f) {
      x.font = 'bold 14px Arial'; x.fillStyle = '#a8a596'; x.fillText(f[0] + ':', pad, y);
      x.font = '14px Arial'; x.fillStyle = '#f5f3ea'; x.fillText(String(f[1]), pad + 210, y); y += lh;
    });
    y += 12; x.font = 'bold 14px Arial'; x.fillStyle = '#a8a596'; x.fillText('Atividades / Deslocamento:', pad, y); y += lh;
    x.font = '14px Arial'; x.fillStyle = '#f5f3ea';
    (ls.length ? ls : ['—']).forEach(function (l) {
      var s = '• ' + l; if (x.measureText(s).width > W - pad * 2) { while (x.measureText(s + '…').width > W - pad * 2 && s.length > 4) s = s.slice(0, -1); s += '…'; }
      x.fillText(s, pad + 6, y); y += lh;
    });
    y += 8; x.fillStyle = '#f5c542'; x.fillRect(pad, y - 6, W - pad * 2, 40);
    x.fillStyle = '#1a1405'; x.font = 'bold 20px Arial'; x.fillText('TOTAL USS: ' + (c.uss_total != null ? c.uss_total : '—'), pad + 14, y + 20);
    var a = document.createElement('a'); a.href = cv.toDataURL('image/png'); a.download = 'USS_chamado_' + (c.num_chamado || 'sn') + '.png'; a.click();
  };
})();
