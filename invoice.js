/* Генерация счёта .docx без ES-модулей (работает при открытии через file://) */

(function () {
  const COMPANY = 'Никольский Помощь';

  function invoiceNumber() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const rnd = String(Math.floor(Math.random() * 900) + 100);
    return 'СЧ-' + y + m + day + '-' + rnd;
  }

  function formatDate() {
    return new Date().toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  function formatMoney(n) {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(n));
  }

  function escapeXml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function amountInWords(num) {
    const n = Math.round(num);
    if (n === 0) return 'Ноль рублей 00 копеек';

    const ones = ['', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять'];
    const teens = ['десять', 'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать', 'пятнадцать', 'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать'];
    const tens = ['', '', 'двадцать', 'тридцать', 'сорок', 'пятьдесят', 'шестьдесят', 'семьдесят', 'восемьдесят', 'девяносто'];
    const hundreds = ['', 'сто', 'двести', 'триста', 'четыреста', 'пятьсот', 'шестьсот', 'семьсот', 'восемьсот', 'девятьсот'];

    function tripletToWords(v, feminine) {
      let r = hundreds[Math.floor(v / 100)] + ' ';
      const t = v % 100;
      if (t >= 10 && t < 20) {
        r += teens[t - 10] + ' ';
      } else {
        r += tens[Math.floor(t / 10)] + ' ';
        const o = t % 10;
        if (feminine && o === 1) r += 'одна ';
        else if (feminine && o === 2) r += 'две ';
        else r += ones[o] + ' ';
      }
      return r.trim();
    }

    function rubleForm(v) {
      const mod10 = v % 10;
      const mod100 = v % 100;
      if (mod100 >= 11 && mod100 <= 19) return 'рублей';
      if (mod10 === 1) return 'рубль';
      if (mod10 >= 2 && mod10 <= 4) return 'рубля';
      return 'рублей';
    }

    const thousands = Math.floor((n % 1000000) / 1000);
    const rest = n % 1000;
    let words = '';
    if (thousands > 0) words += tripletToWords(thousands, true) + ' тысяч ';
    if (rest > 0 || n < 1000) words += tripletToWords(rest, false) + ' ';
    return (words.trim() + ' ' + rubleForm(n) + ' 00 копеек').replace(/\s+/g, ' ').trim();
  }

  function paragraph(text, opts) {
    opts = opts || {};
    const align = opts.center ? 'center' : opts.right ? 'right' : 'left';
    const bold = opts.bold ? '<w:b/>' : '';
    const size = opts.size || 22;
    return (
      '<w:p><w:pPr><w:jc w:val="' + align + '"/></w:pPr>' +
      '<w:r><w:rPr>' + bold + '<w:sz w:val="' + size + '"/></w:rPr>' +
      '<w:t xml:space="preserve">' + escapeXml(text) + '</w:t></w:r></w:p>'
    );
  }

  function tableCell(text, opts) {
    opts = opts || {};
    const bold = opts.bold ? '<w:b/>' : '';
    const align = opts.center ? 'center' : opts.right ? 'right' : 'left';
    return (
      '<w:tc><w:tcPr><w:tcW w:w="2000" w:type="dxa"/></w:tcPr>' +
      '<w:p><w:pPr><w:jc w:val="' + align + '"/></w:pPr>' +
      '<w:r><w:rPr>' + bold + '</w:rPr><w:t>' + escapeXml(text) + '</w:t></w:r></w:p></w:tc>'
    );
  }

  function buildDocumentXml(payload) {
    const number = invoiceNumber();
    const dateStr = formatDate();
    const rows = payload.items.map(function (item, i) {
      return (
        '<w:tr>' +
        tableCell(String(i + 1), { center: true }) +
        tableCell(item.name) +
        tableCell(String(item.qty || 1), { center: true }) +
        tableCell(formatMoney(item.unitPrice), { right: true }) +
        tableCell(formatMoney(item.amount), { right: true }) +
        '</w:tr>'
      );
    }).join('');

    return (
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
      '<w:body>' +
      paragraph(COMPANY, { center: true, bold: true, size: 36 }) +
      paragraph('СЧЁТ НА ОПЛАТУ', { center: true, bold: true, size: 28 }) +
      paragraph('№ ' + number + ' от ' + dateStr) +
      '<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/></w:tblPr>' +
      '<w:tr>' +
      tableCell('№', { bold: true, center: true }) +
      tableCell('Наименование', { bold: true }) +
      tableCell('Кол-во', { bold: true, center: true }) +
      tableCell('Цена, ₽', { bold: true, right: true }) +
      tableCell('Сумма, ₽', { bold: true, right: true }) +
      '</w:tr>' +
      rows +
      '</w:tbl>' +
      paragraph('Итого: ' + formatMoney(payload.total) + ' ₽', { right: true, bold: true, size: 26 }) +
      paragraph('Всего к оплате: ' + amountInWords(payload.total)) +
      paragraph('Документ сформирован внутренним калькулятором.', { size: 20 }) +
      '</w:body></w:document>'
    );
  }

  const CONTENT_TYPES =
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
    '</Types>';

  const RELS_ROOT =
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
    '</Relationships>';

  const RELS_DOC =
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>';

  function buildWithJsZip(payload) {
    const zip = new JSZip();
    zip.file('[Content_Types].xml', CONTENT_TYPES);
    zip.folder('_rels').file('.rels', RELS_ROOT);
    zip.folder('word').file('document.xml', buildDocumentXml(payload));
    zip.folder('word').folder('_rels').file('document.xml.rels', RELS_DOC);
    return zip.generateAsync({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
  }

  function buildWordHtml(payload) {
    const number = invoiceNumber();
    const dateStr = formatDate();
    const rows = payload.items.map(function (item, i) {
      return (
        '<tr>' +
        '<td style="text-align:center">' + (i + 1) + '</td>' +
        '<td>' + escapeXml(item.name) + '</td>' +
        '<td style="text-align:center">' + (item.qty || 1) + '</td>' +
        '<td style="text-align:right">' + formatMoney(item.unitPrice) + '</td>' +
        '<td style="text-align:right">' + formatMoney(item.amount) + '</td>' +
        '</tr>'
      );
    }).join('');

    return (
      '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">' +
      '<head><meta charset="utf-8"><title>Счёт</title></head><body>' +
      '<h2 style="text-align:center">' + COMPANY + '</h2>' +
      '<h3 style="text-align:center">СЧЁТ НА ОПЛАТУ</h3>' +
      '<p>№ ' + number + ' от ' + dateStr + '</p>' +
      '<table border="1" cellpadding="6" cellspacing="0" width="100%">' +
      '<tr><th>№</th><th>Наименование</th><th>Кол-во</th><th>Цена, ₽</th><th>Сумма, ₽</th></tr>' +
      rows +
      '</table>' +
      '<p style="text-align:right"><b>Итого: ' + formatMoney(payload.total) + ' ₽</b></p>' +
      '<p><i>Всего к оплате: ' + amountInWords(payload.total) + '</i></p>' +
      '</body></html>'
    );
  }

  function saveBlob(blob, filename) {
    if (window.navigator && typeof window.navigator.msSaveOrOpenBlob === 'function') {
      window.navigator.msSaveOrOpenBlob(blob, filename);
      return;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);

    let saved = false;
    try {
      link.click();
      saved = true;
    } catch (err) {
      saved = false;
    }

    if (!saved) {
      const opened = window.open(url, '_blank');
      if (!opened) {
        URL.revokeObjectURL(url);
        document.body.removeChild(link);
        throw new Error(
          'Браузер заблокировал скачивание. Разрешите загрузки для этой страницы или откройте калькулятор через локальный сервер (например: python -m http.server).'
        );
      }
    }

    setTimeout(function () {
      if (link.parentNode) document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 3000);
  }

  async function download(payload) {
    if (!payload || !payload.items || !payload.items.length) {
      throw new Error('Нет данных для счёта');
    }

    const filename = 'schet-' + Date.now();

    if (typeof JSZip !== 'undefined') {
      try {
        const blob = await buildWithJsZip(payload);
        saveBlob(blob, filename + '.docx');
        return;
      } catch (err) {
        console.warn('DOCX generation failed, falling back to .doc:', err);
      }
    }

    const html = buildWordHtml(payload);
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    saveBlob(blob, filename + '.doc');
  }

  window.InvoiceApp = { download: download };
})();
