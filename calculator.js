'use strict';

const PLACEHOLDER_OPTION = { value: '', label: '— выберите —' };
const VKR_PAGES_ANCHOR = 60;
const VKR_PAGE_RATE = 250;
const PROJECT_DOCS_VKR = 10000;

const SPEC_STD = [
  { value: 'simple', label: 'Простая — гуманитарная' },
  { value: 'medium', label: 'Средняя — экономика, менеджмент' },
  { value: 'hard', label: 'Сложная — программирование, строительство, техническая' },
];

const SPEC_WORK = [
  { value: 'simple', label: 'Простая работа' },
  { value: 'medium', label: 'Средняя работа' },
  { value: 'hard', label: 'Сложная работа' },
];

const UNIQ_STD = [
  { value: 'none', label: 'Без требований' },
  { value: 'standard', label: 'Стандартная уникальность' },
  { value: 'high', label: 'Повышенная уникальность' },
];

const UNIQ_AI = [
  { value: 'none', label: 'Просто снизить ИИ' },
  { value: 'standard', label: 'Нужно сильно снизить ИИ' },
  { value: 'high', label: 'Нужно максимально безопасно' },
];

const URG_VKR = [
  { value: 'normal', label: 'Обычный срок — от 14 дней' },
  { value: 'medium', label: 'Среднесрочно — 8–13 дней' },
  { value: 'urgent', label: 'Срочно — 4–7 дней' },
  { value: 'veryUrgent', label: 'Очень срочно — 1–3 дня' },
];

const URG_MID = [
  { value: 'normal', label: 'Обычный срок — от 7 дней' },
  { value: 'medium', label: 'Среднесрочно — 4–6 дней' },
  { value: 'urgent', label: 'Срочно — 2–3 дня' },
  { value: 'veryUrgent', label: 'Очень срочно — 1 день' },
];

const URG_SHORT = [
  { value: 'normal', label: 'Обычный срок — от 3 дней' },
  { value: 'medium', label: 'Среднесрочно — 2 дня' },
  { value: 'urgent', label: 'Срочно — 1 день' },
  { value: 'veryUrgent', label: 'Очень срочно — сегодня' },
];

const PROJECT_DOCS_FIELD = {
  key: 'projectDocs',
  label: '+ Проектная документация — чертежи / проектный код / эскизы и прочее',
  type: 'checkbox',
  highlight: true,
};

const DISCIPLINE_FIELD = {
  key: 'discipline',
  label: 'Дисциплина (необязательно)',
  type: 'text',
  optional: true,
  placeholder: 'Например: Математика',
};

const SERVICES = {
  diploma: {
    label: 'Дипломная / ВКР',
    base: 35000,
    max: 120000,
    fields: [
      { key: 'pages', label: 'Количество страниц', type: 'number', min: 30, max: 100, placeholder: '60', step: 1, hint: 'База за 60 стр.; ±250 ₽ за каждую стр. от 60' },
      { key: 'specialization', label: 'Сложность специализации', type: 'select', options: SPEC_STD },
      { key: 'uniqueness', label: 'Требования по уникальности', type: 'select', options: UNIQ_STD },
      { key: 'urgency', label: 'Срок выполнения', type: 'select', options: URG_VKR },
      { key: 'presentation', label: 'Нужна презентация', type: 'checkbox', price: 2500 },
      { key: 'speech', label: 'Нужна речь к защите', type: 'checkbox', price: 1500 },
      { ...PROJECT_DOCS_FIELD, price: PROJECT_DOCS_VKR },
    ],
    breakdown(v) {
      const pages = Number(v.pages);
      const pagesDelta = (pages - VKR_PAGES_ANCHOR) * VKR_PAGE_RATE;
      const spec = { simple: 0, medium: 7000, hard: 15000 }[v.specialization];
      const uniq = { none: 0, standard: 7000, high: 15000 }[v.uniqueness];
      const urg = { normal: 0, medium: 7000, urgent: 15000, veryUrgent: 25000 }[v.urgency];
      return [
        { label: `Корректировка страниц (${pages} − ${VKR_PAGES_ANCHOR}) × ${VKR_PAGE_RATE} ₽`, value: pagesDelta },
        { label: 'Сложность специализации', value: spec },
        { label: 'Уникальность', value: uniq },
        { label: 'Срочность', value: urg },
        { label: 'Презентация', value: v.presentation ? 2500 : 0 },
        { label: 'Речь к защите', value: v.speech ? 1500 : 0 },
        { label: 'Проектная документация', value: v.projectDocs ? PROJECT_DOCS_VKR : 0 },
      ];
    },
  },

  coursework: {
    label: 'Курсовая',
    base: 6000,
    max: 21000,
    fields: [
      { key: 'pages', label: 'Количество страниц', type: 'number', min: 5, max: 60, placeholder: '20', step: 1, hint: '+240 ₽ за страницу' },
      { key: 'specialization', label: 'Сложность специализации', type: 'select', options: SPEC_STD },
      { key: 'uniqueness', label: 'Требования по уникальности', type: 'select', options: UNIQ_STD },
      { key: 'urgency', label: 'Срок выполнения', type: 'select', options: URG_MID },
      { key: 'calculations', label: 'Нужны расчёты', type: 'checkbox', price: 3750 },
      { ...PROJECT_DOCS_FIELD, price: 5000 },
    ],
    breakdown(v) {
      const pages = Number(v.pages);
      return [
        { label: `Страницы (${pages} × 240 ₽)`, value: pages * 240 },
        { label: 'Сложность специализации', value: { simple: 0, medium: 2250, hard: 4500 }[v.specialization] },
        { label: 'Уникальность', value: { none: 0, standard: 2250, high: 4500 }[v.uniqueness] },
        { label: 'Срочность', value: { normal: 0, medium: 1500, urgent: 3750, veryUrgent: 6750 }[v.urgency] },
        { label: 'Расчёты', value: v.calculations ? 3750 : 0 },
        { label: 'Проектная документация', value: v.projectDocs ? 5000 : 0 },
      ];
    },
  },

  practice: {
    label: 'Практика',
    base: 5990,
    max: 14990,
    fields: [
      DISCIPLINE_FIELD,
      { key: 'pages', label: 'Количество страниц', type: 'number', min: 5, max: 60, placeholder: '20', step: 1, hint: '+120 ₽ за страницу' },
      { key: 'specialization', label: 'Сложность специализации', type: 'select', options: SPEC_STD },
      { key: 'uniqueness', label: 'Требования по уникальности', type: 'select', options: UNIQ_STD },
      { key: 'urgency', label: 'Срок выполнения', type: 'select', options: URG_MID },
      { key: 'diary', label: 'Дневник практики', type: 'checkbox', price: 1500 },
      { key: 'characteristic', label: 'Характеристика', type: 'checkbox', price: 1200 },
      {
        key: 'projectDocs',
        label: '+ Доп. материалы к практике — чертежи / макеты / приложения и прочее',
        type: 'checkbox',
        price: 6000,
        highlight: true,
      },
    ],
    breakdown(v) {
      const pages = Number(v.pages);
      return [
        { label: `Страницы (${pages} × 120 ₽)`, value: pages * 120 },
        { label: 'Сложность специализации', value: { simple: 0, medium: 1000, hard: 2500 }[v.specialization] },
        { label: 'Уникальность', value: { none: 0, standard: 1000, high: 2000 }[v.uniqueness] },
        { label: 'Срочность', value: { normal: 0, medium: 1200, urgent: 2000, veryUrgent: 3500 }[v.urgency] },
        { label: 'Дневник практики', value: v.diary ? 1500 : 0 },
        { label: 'Характеристика', value: v.characteristic ? 1200 : 0 },
        { label: 'Доп. материалы', value: v.projectDocs ? 6000 : 0 },
      ];
    },
  },

  referat: {
    label: 'Реферат',
    base: 4000,
    max: 8000,
    fields: [
      { key: 'pages', label: 'Количество страниц', type: 'number', min: 3, max: 40, placeholder: '10', step: 1, hint: '+100 ₽ за страницу' },
      { key: 'specialization', label: 'Сложность специализации', type: 'select', options: SPEC_STD },
      { key: 'uniqueness', label: 'Требования по уникальности', type: 'select', options: UNIQ_STD },
      { key: 'urgency', label: 'Срок выполнения', type: 'select', options: URG_SHORT },
    ],
    breakdown(v) {
      const pages = Number(v.pages);
      return [
        { label: `Страницы (${pages} × 100 ₽)`, value: pages * 100 },
        { label: 'Сложность специализации', value: { simple: 0, medium: 500, hard: 1200 }[v.specialization] },
        { label: 'Уникальность', value: { none: 0, standard: 800, high: 1500 }[v.uniqueness] },
        { label: 'Срочность', value: { normal: 0, medium: 700, urgent: 1500, veryUrgent: 2500 }[v.urgency] },
      ];
    },
  },

  control: {
    label: 'Контрольная работа',
    base: 4000,
    max: 12000,
    fields: [
      { key: 'pages', label: 'Количество страниц', type: 'number', min: 3, max: 50, placeholder: '10', step: 1, hint: '+150 ₽ за страницу' },
      { key: 'specialization', label: 'Сложность специализации', type: 'select', options: SPEC_STD },
      { key: 'uniqueness', label: 'Требования по уникальности', type: 'select', options: UNIQ_STD },
      { key: 'urgency', label: 'Срок выполнения', type: 'select', options: URG_SHORT },
      { key: 'calculations', label: 'Есть расчёты', type: 'checkbox', price: 2000 },
    ],
    breakdown(v) {
      const pages = Number(v.pages);
      return [
        { label: `Страницы (${pages} × 150 ₽)`, value: pages * 150 },
        { label: 'Сложность специализации', value: { simple: 0, medium: 1000, hard: 2500 }[v.specialization] },
        { label: 'Уникальность', value: { none: 0, standard: 1000, high: 2000 }[v.uniqueness] },
        { label: 'Срочность', value: { normal: 0, medium: 1000, urgent: 2000, veryUrgent: 3500 }[v.urgency] },
        { label: 'Расчёты', value: v.calculations ? 2000 : 0 },
      ];
    },
  },

  aiCleaning: {
    label: 'Очистка от ИИ',
    base: 4000,
    max: 12000,
    fields: [
      { key: 'pages', label: 'Количество страниц', type: 'number', min: 3, max: 80, placeholder: '10', step: 1, hint: '+80 ₽ за страницу' },
      { key: 'specialization', label: 'Сложность работы', type: 'select', options: SPEC_WORK },
      { key: 'uniqueness', label: 'Задача по ИИ', type: 'select', options: UNIQ_AI },
      { key: 'urgency', label: 'Срок выполнения', type: 'select', options: URG_SHORT },
    ],
    breakdown(v) {
      const pages = Number(v.pages);
      return [
        { label: `Страницы (${pages} × 80 ₽)`, value: pages * 80 },
        { label: 'Сложность работы', value: { simple: 0, medium: 1000, hard: 2500 }[v.specialization] },
        { label: 'Задача по ИИ', value: { none: 0, standard: 1500, high: 3000 }[v.uniqueness] },
        { label: 'Срочность', value: { normal: 0, medium: 1000, urgent: 2000, veryUrgent: 3000 }[v.urgency] },
      ];
    },
  },

  test: {
    label: 'Тест',
    base: 4000,
    max: 12000,
    fields: [
      {
        key: 'synergyMti',
        label: 'Синергия / МТИ — фиксированная цена 990 ₽',
        type: 'checkbox',
        price: 990,
        highlight: true,
      },
      DISCIPLINE_FIELD,
      { key: 'testsCount', label: 'Количество тестов', type: 'number', min: 1, max: 30, placeholder: '1', step: 1, hint: '1 тест включён, далее +1 500 ₽ за тест' },
      { key: 'specialization', label: 'Сложность специализации', type: 'select', options: SPEC_STD },
      { key: 'urgency', label: 'Срок выполнения', type: 'select', options: URG_SHORT },
    ],
    override(v) {
      if (v.synergyMti) return 990;
      return null;
    },
    breakdown(v) {
      const testsCount = Number(v.testsCount);
      const extra = Math.max(0, testsCount - 1);
      return [
        { label: `Доп. тесты (${extra} × 1 500 ₽)`, value: extra * 1500 },
        { label: 'Сложность специализации', value: { simple: 0, medium: 1000, hard: 2500 }[v.specialization] },
        { label: 'Срочность', value: { normal: 0, medium: 500, urgent: 1000, veryUrgent: 2000 }[v.urgency] },
      ];
    },
  },
};

const CONSTRUCTOR_KINDS = {
  diploma: { label: 'ВКР', serviceKey: 'diploma' },
  coursework: { label: 'Курсовая', serviceKey: 'coursework' },
  practice: { label: 'Практика', preset: 'practice' },
  test: { label: 'Тест', preset: 'test' },
  aiCleaning: { label: 'Очистка от ИИ', serviceKey: 'aiCleaning' },
  custom: { label: 'Своя позиция', manual: true },
};

const PRACTICE_PRESETS = {
  standard: { label: 'Стандартная практика', price: 5990 },
  design: { label: 'Практика по дизайну', price: 14990 },
};

const TEST_UNIT_PRICE = 990;

const clamp = (n, lo, hi) => Math.min(Math.max(n, lo), hi);
const fmt = (n) => new Intl.NumberFormat('ru-RU').format(Math.round(n));
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

let itemIdCounter = 0;
function nextItemId() {
  itemIdCounter += 1;
  return 'item-' + itemIdCounter;
}

function emptyValues(serviceKey) {
  const values = {};
  for (const f of SERVICES[serviceKey].fields) {
    if (f.type === 'checkbox') values[f.key] = false;
    else values[f.key] = '';
  }
  return values;
}

function withDiscipline(label, values) {
  const disc = (values.discipline || '').trim();
  return disc ? `${label} — ${disc}` : label;
}

function isFormComplete(serviceKey, values) {
  const svc = SERVICES[serviceKey];
  if (svc.override) {
    const fixed = svc.override(values);
    if (fixed !== null && fixed !== undefined) return true;
  }
  for (const f of svc.fields) {
    if (f.optional || f.type === 'checkbox') continue;
    if (f.type === 'select') {
      if (!values[f.key]) return false;
    } else if (f.type === 'number') {
      const n = Number(values[f.key]);
      if (values[f.key] === '' || Number.isNaN(n)) return false;
    }
  }
  return true;
}

function computePrice(serviceKey, values) {
  const svc = SERVICES[serviceKey];
  if (!isFormComplete(serviceKey, values)) {
    return { price: 0, raw: 0, rows: [], clamped: false, override: false, incomplete: true };
  }
  if (svc.override) {
    const fixed = svc.override(values);
    if (fixed !== null && fixed !== undefined) {
      return {
        price: fixed,
        raw: fixed,
        rows: [{ label: 'Фиксированная цена', value: fixed }],
        clamped: false,
        override: true,
        incomplete: false,
      };
    }
  }
  const rows = svc.breakdown(values);
  const extra = rows.reduce((s, r) => s + r.value, 0);
  const raw = svc.base + extra;
  const price = clamp(raw, svc.base, svc.max);
  return {
    price,
    raw,
    rows,
    clamped: raw > svc.max || raw < svc.base,
    override: false,
    incomplete: false,
  };
}

function computeOrderItemPrice(item) {
  const kind = CONSTRUCTOR_KINDS[item.kind];
  if (!kind) return { price: 0, label: 'Неизвестно', rows: [], incomplete: true };

  if (kind.manual) {
    const price = Math.max(0, Number(item.values.manualPrice) || 0);
    const title = (item.values.title || '').trim() || 'Своя позиция';
    if (!title || price <= 0) return { price: 0, label: title || 'Своя позиция', rows: [], incomplete: true };
    return { price, label: title, rows: [{ label: title, value: price }], incomplete: false };
  }

  if (kind.preset === 'practice') {
    const qtyRaw = item.values.quantity;
    const qty = Number(qtyRaw);
    if (qtyRaw === '' || Number.isNaN(qty) || qty < 1) {
      return { price: 0, label: kind.label, rows: [], incomplete: true };
    }
    const q = clamp(Math.round(qty), 1, 10);
    const preset = PRACTICE_PRESETS[item.values.practiceType || 'standard'];
    const unit = preset ? preset.price : 5990;
    const price = unit * q;
    const label = withDiscipline(q > 1 ? `${preset.label} × ${q}` : preset.label, item.values);
    return {
      price,
      label,
      rows: [{ label: `${preset.label} (${q} × ${fmt(unit)} ₽)`, value: price }],
      incomplete: false,
    };
  }

  if (kind.preset === 'test') {
    const qtyRaw = item.values.quantity;
    const qty = Number(qtyRaw);
    if (qtyRaw === '' || Number.isNaN(qty) || qty < 1) {
      return { price: 0, label: kind.label, rows: [], incomplete: true };
    }
    const q = clamp(Math.round(qty), 1, 30);
    const price = TEST_UNIT_PRICE * q;
    const label = withDiscipline(q > 1 ? `Тест × ${q}` : 'Тест', item.values);
    return {
      price,
      label,
      rows: [{ label: `Тест (${q} × ${fmt(TEST_UNIT_PRICE)} ₽)`, value: price }],
      incomplete: false,
    };
  }

  if (kind.serviceKey) {
    const result = computePrice(kind.serviceKey, item.values);
    const label = withDiscipline(SERVICES[kind.serviceKey].label, item.values);
    return {
      price: result.price,
      label,
      rows: result.rows,
      clamped: result.clamped,
      incomplete: result.incomplete,
    };
  }

  return { price: 0, label: kind.label, rows: [], incomplete: true };
}

function renderNumberField(wrap, f, values, onChange) {
  const row = document.createElement('div');
  row.className = 'stepper';
  const dec = document.createElement('button');
  dec.type = 'button';
  dec.className = 'step-btn';
  dec.textContent = '−';
  const input = document.createElement('input');
  input.type = 'number';
  input.className = 'input';
  input.min = f.min;
  input.max = f.max;
  input.step = f.step || 1;
  if (f.placeholder) input.placeholder = f.placeholder;
  input.value = values[f.key] === '' || values[f.key] === undefined ? '' : values[f.key];

  const inc = document.createElement('button');
  inc.type = 'button';
  inc.className = 'step-btn';
  inc.textContent = '+';

  const commit = (val, allowEmpty) => {
    if (val === '' || val === null || val === undefined) {
      if (allowEmpty) {
        values[f.key] = '';
        input.value = '';
        onChange();
        return;
      }
      values[f.key] = '';
      input.value = '';
      onChange();
      return;
    }
    let n = Number(val);
    if (Number.isNaN(n)) {
      values[f.key] = '';
      input.value = '';
      onChange();
      return;
    }
    n = clamp(Math.round(n), f.min, f.max);
    values[f.key] = n;
    input.value = n;
    onChange();
  };

  input.addEventListener('input', () => {
    if (input.value === '') {
      values[f.key] = '';
      onChange();
      return;
    }
    const n = Number(input.value);
    if (!Number.isNaN(n)) {
      values[f.key] = input.value;
      onChange();
    }
  });
  input.addEventListener('blur', () => commit(input.value, true));
  dec.addEventListener('click', () => {
    const base = values[f.key] === '' ? Number(f.placeholder || f.min) : Number(values[f.key]);
    commit(base - 1, false);
  });
  inc.addEventListener('click', () => {
    const base = values[f.key] === '' ? Number(f.placeholder || f.min) - 1 : Number(values[f.key]);
    commit(base + 1, false);
  });

  row.appendChild(dec);
  row.appendChild(input);
  row.appendChild(inc);
  wrap.appendChild(row);
}

function renderServiceFields(container, serviceKey, values, onChange) {
  const svc = SERVICES[serviceKey];
  container.innerHTML = '';

  for (const f of svc.fields) {
    const wrap = document.createElement('label');
    wrap.className = 'field';

    if (f.type === 'checkbox') {
      wrap.className = 'field field-checkbox' + (f.highlight ? ' field-highlight' : '');
      if (f.highlight) {
        const badge = document.createElement('span');
        badge.className = 'highlight-badge';
        badge.textContent = 'Важно — не пропустите';
        wrap.appendChild(badge);
      }
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.alignItems = 'flex-start';
      row.style.gap = '12px';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = !!values[f.key];
      input.addEventListener('change', () => {
        values[f.key] = input.checked;
        onChange();
      });
      const span = document.createElement('span');
      span.className = 'checkbox-label';
      let priceChip = '';
      if (f.key === 'synergyMti') {
        priceChip = ` <em class="chip">${fmt(990)} ₽ итого</em>`;
      } else if (f.price) {
        priceChip = ` <em class="chip">+${fmt(f.price)} ₽</em>`;
      }
      span.innerHTML = f.label + priceChip;
      row.appendChild(input);
      row.appendChild(span);
      wrap.appendChild(row);
    } else {
      const labelSpan = document.createElement('span');
      labelSpan.className = 'field-label';
      labelSpan.textContent = f.label;
      wrap.appendChild(labelSpan);

      if (f.type === 'number') {
        renderNumberField(wrap, f, values, onChange);
      } else if (f.type === 'select') {
        const select = document.createElement('select');
        select.className = 'select';
        const ph = document.createElement('option');
        ph.value = '';
        ph.textContent = PLACEHOLDER_OPTION.label;
        select.appendChild(ph);
        for (const o of f.options) {
          const opt = document.createElement('option');
          opt.value = o.value;
          opt.textContent = o.label;
          select.appendChild(opt);
        }
        select.value = values[f.key] || '';
        select.addEventListener('change', () => {
          values[f.key] = select.value;
          onChange();
        });
        wrap.appendChild(select);
      } else if (f.type === 'text') {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'input input-text';
        input.placeholder = f.placeholder || '';
        input.value = values[f.key] || '';
        input.addEventListener('input', () => {
          values[f.key] = input.value;
          onChange();
        });
        wrap.appendChild(input);
      }

      if (f.hint) {
        const hint = document.createElement('span');
        hint.className = 'field-hint';
        hint.textContent = f.hint;
        wrap.appendChild(hint);
      }
    }

    container.appendChild(wrap);
  }
}

function renderBreakdownList(listEl, serviceKey, result) {
  listEl.innerHTML = '';
  if (result.incomplete || result.price === 0 && !result.override) return;
  const svc = SERVICES[serviceKey];
  const baseLi = document.createElement('li');
  baseLi.innerHTML = `<span>База (${svc.label})</span><span>${fmt(svc.base)} ₽</span>`;
  listEl.appendChild(baseLi);
  for (const r of result.rows) {
    if (r.value === 0) continue;
    const sign = r.value > 0 ? '+' : '';
    const li = document.createElement('li');
    li.innerHTML = `<span>${r.label}</span><span>${sign}${fmt(r.value)} ₽</span>`;
    listEl.appendChild(li);
  }
}

let currentService = 'diploma';
const state = {};

function initServiceSelect() {
  const sel = $('#service-select');
  sel.innerHTML = '';
  for (const [key, svc] of Object.entries(SERVICES)) {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = svc.label;
    sel.appendChild(opt);
  }
  sel.value = currentService;
  sel.addEventListener('change', () => {
    currentService = sel.value;
    state[currentService] = emptyValues(currentService);
    renderMainFields();
    recalcMain();
  });
}

function renderMainFields() {
  if (!state[currentService]) state[currentService] = emptyValues(currentService);
  renderServiceFields($('#fields-container'), currentService, state[currentService], recalcMain);
}

function recalcMain() {
  const svc = SERVICES[currentService];
  const values = state[currentService];
  const result = computePrice(currentService, values);

  $('#price-value').textContent = fmt(result.price);
  $('#price-value-2').textContent = fmt(result.price);
  $('#price-min').textContent = fmt(svc.base);
  $('#price-max').textContent = fmt(svc.max);

  renderBreakdownList($('#breakdown-list'), currentService, result);

  const badge = $('#clamp-badge');
  if (result.incomplete) {
    badge.textContent = 'Заполните параметры';
    badge.classList.remove('hidden');
  } else if (result.override) {
    badge.textContent = 'Фиксированная цена';
    badge.classList.remove('hidden');
  } else if (result.raw > svc.max) {
    badge.textContent = 'Достигнут потолок';
    badge.classList.remove('hidden');
  } else if (result.raw < svc.base) {
    badge.textContent = 'Минимальная цена';
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

const orderItems = [];

function defaultOrderValues(kind) {
  const cfg = CONSTRUCTOR_KINDS[kind];
  if (cfg.manual) return { title: '', manualPrice: '' };
  if (cfg.preset === 'practice') return { practiceType: 'standard', quantity: '', discipline: '' };
  if (cfg.preset === 'test') return { quantity: '', discipline: '' };
  if (cfg.serviceKey) return emptyValues(cfg.serviceKey);
  return {};
}

function addOrderItem(kind) {
  orderItems.unshift({ id: nextItemId(), kind, values: defaultOrderValues(kind) });
  renderOrder();
}

function removeOrderItem(id) {
  const idx = orderItems.findIndex((i) => i.id === id);
  if (idx >= 0) orderItems.splice(idx, 1);
  renderOrder();
}

function renderDisciplineField(container, values, onChange) {
  const field = document.createElement('label');
  field.className = 'field';
  field.innerHTML = '<span class="field-label">Дисциплина (необязательно)</span>';
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'input input-text';
  input.placeholder = 'Например: Математика';
  input.value = values.discipline || '';
  input.addEventListener('input', () => {
    values.discipline = input.value;
    onChange();
  });
  field.appendChild(input);
  container.appendChild(field);
}

function renderPracticePresetFields(container, values, onChange) {
  container.innerHTML = '';
  renderDisciplineField(container, values, onChange);

  const typeField = document.createElement('label');
  typeField.className = 'field';
  typeField.innerHTML = '<span class="field-label">Тип практики</span>';
  const typeSelect = document.createElement('select');
  typeSelect.className = 'select';
  for (const [key, preset] of Object.entries(PRACTICE_PRESETS)) {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = `${preset.label} — ${fmt(preset.price)} ₽`;
    typeSelect.appendChild(opt);
  }
  typeSelect.value = values.practiceType || 'standard';
  typeSelect.addEventListener('change', () => {
    values.practiceType = typeSelect.value;
    onChange();
  });
  typeField.appendChild(typeSelect);
  container.appendChild(typeField);

  const qtyField = document.createElement('label');
  qtyField.className = 'field';
  qtyField.innerHTML = '<span class="field-label">Количество</span>';
  renderNumberField(qtyField, { key: 'quantity', min: 1, max: 10, step: 1, placeholder: '1' }, values, onChange);
  container.appendChild(qtyField);
}

function renderTestPresetFields(container, values, onChange) {
  container.innerHTML = '';
  renderDisciplineField(container, values, onChange);

  const qtyField = document.createElement('label');
  qtyField.className = 'field';
  qtyField.innerHTML = `<span class="field-label">Количество тестов</span><span class="field-hint">${fmt(TEST_UNIT_PRICE)} ₽ за каждый</span>`;
  renderNumberField(qtyField, { key: 'quantity', min: 1, max: 30, step: 1, placeholder: '1' }, values, onChange);
  container.appendChild(qtyField);
}

function renderCustomFields(container, values, onChange) {
  container.innerHTML = '';

  const titleField = document.createElement('label');
  titleField.className = 'field';
  titleField.innerHTML = '<span class="field-label">Название работы</span>';
  const titleInput = document.createElement('input');
  titleInput.type = 'text';
  titleInput.className = 'input input-text';
  titleInput.placeholder = 'Например: реферат по маркетингу';
  titleInput.value = values.title || '';
  titleInput.addEventListener('input', () => {
    values.title = titleInput.value;
    onChange();
  });
  titleField.appendChild(titleInput);
  container.appendChild(titleField);

  const priceField = document.createElement('label');
  priceField.className = 'field';
  priceField.innerHTML = '<span class="field-label">Цена, ₽</span>';
  renderNumberField(priceField, { key: 'manualPrice', min: 0, max: 9999999, step: 100, placeholder: '0' }, values, onChange);
  container.appendChild(priceField);
}

function renderOrderItemCard(item) {
  const cfg = CONSTRUCTOR_KINDS[item.kind];
  const computed = computeOrderItemPrice(item);

  const card = document.createElement('div');
  card.className = 'order-item';
  card.dataset.id = item.id;

  const head = document.createElement('div');
  head.className = 'order-item-head';
  head.innerHTML = `
    <h3 class="order-item-title">${cfg.label}</h3>
    <span class="order-item-price">${fmt(computed.price)} ₽</span>
  `;
  card.appendChild(head);

  const fieldsWrap = document.createElement('div');
  fieldsWrap.className = 'order-item-fields';
  const onChange = () => refreshOrderPrices();

  if (cfg.manual) {
    renderCustomFields(fieldsWrap, item.values, onChange);
  } else if (cfg.preset === 'practice') {
    renderPracticePresetFields(fieldsWrap, item.values, onChange);
  } else if (cfg.preset === 'test') {
    renderTestPresetFields(fieldsWrap, item.values, onChange);
  } else if (cfg.serviceKey) {
    renderServiceFields(fieldsWrap, cfg.serviceKey, item.values, onChange);
  }

  card.appendChild(fieldsWrap);

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'btn-danger';
  removeBtn.textContent = 'Удалить позицию';
  removeBtn.style.marginTop = '14px';
  removeBtn.addEventListener('click', () => removeOrderItem(item.id));
  card.appendChild(removeBtn);

  return card;
}

function refreshOrderPrices() {
  for (const item of orderItems) {
    const card = document.querySelector('.order-item[data-id="' + item.id + '"]');
    if (!card) continue;
    const computed = computeOrderItemPrice(item);
    const priceEl = card.querySelector('.order-item-price');
    if (priceEl) priceEl.textContent = fmt(computed.price) + ' ₽';
  }
  recalcOrder();
}

function renderOrder() {
  const container = $('#order-items');
  const emptyEl = $('#order-empty');
  container.querySelectorAll('.order-item').forEach((el) => el.remove());

  if (orderItems.length === 0) {
    emptyEl.style.display = 'block';
  } else {
    emptyEl.style.display = 'none';
    for (const item of orderItems) {
      container.appendChild(renderOrderItemCard(item));
    }
  }
  recalcOrder();
}

function recalcOrder() {
  let total = 0;
  const breakdownEl = $('#order-breakdown');
  breakdownEl.innerHTML = '';

  for (const item of orderItems) {
    const computed = computeOrderItemPrice(item);
    total += computed.price;
    const li = document.createElement('li');
    li.innerHTML = `<span>${computed.label}</span><span>${fmt(computed.price)} ₽</span>`;
    breakdownEl.appendChild(li);
  }

  if (orderItems.length === 0) {
    const li = document.createElement('li');
    li.innerHTML = '<span>Добавьте позиции</span><span>—</span>';
    breakdownEl.appendChild(li);
  }

  $('#order-total').textContent = fmt(total);
  $('#order-total-2').textContent = fmt(total);
  const n = orderItems.length;
  const word = n === 1 ? 'позиция' : n >= 2 && n <= 4 ? 'позиции' : 'позиций';
  $('#order-desc').textContent = n ? `${n} ${word} в заказе` : '0 позиций';
}

function buildMainInvoicePayload() {
  const svc = SERVICES[currentService];
  const values = state[currentService];
  const result = computePrice(currentService, values);
  if (result.incomplete || result.price <= 0) return null;

  const label = withDiscipline(svc.label, values);
  const details = [{ name: 'База', amount: svc.base }];
  for (const r of result.rows) {
    if (r.value !== 0) details.push({ name: r.label, amount: r.value });
  }

  return {
    items: [{ name: label, qty: 1, unitPrice: result.price, amount: result.price, details }],
    total: result.price,
  };
}

function buildOrderInvoicePayload() {
  if (orderItems.length === 0) return null;

  const items = [];
  let total = 0;

  for (const item of orderItems) {
    const computed = computeOrderItemPrice(item);
    if (computed.incomplete || computed.price <= 0) continue;
    total += computed.price;
    items.push({
      name: computed.label,
      qty: 1,
      unitPrice: computed.price,
      amount: computed.price,
    });
  }

  if (items.length === 0 || total <= 0) return null;
  return { items, total };
}

function initConstructor() {
  $$('.constructor-toolbar [data-add]').forEach((btn) => {
    btn.addEventListener('click', () => addOrderItem(btn.dataset.add));
  });
  renderOrder();
}

function initTabs() {
  $$('.tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      $$('.tab').forEach((t) => t.classList.remove('active'));
      $$('.mode').forEach((m) => m.classList.remove('active'));
      tab.classList.add('active');
      $('#mode-' + tab.dataset.mode).classList.add('active');
    });
  });
}

async function handleInvoiceDownload(buildPayload, emptyMessage, button) {
  const payload = buildPayload();
  if (!payload) {
    alert(emptyMessage);
    return;
  }

  const label = button.textContent;
  button.disabled = true;
  button.textContent = 'Формируем счёт…';

  try {
    if (!window.InvoiceApp) throw new Error('Модуль счёта не загружен. Проверьте подключение к интернету и обновите страницу.');
    await window.InvoiceApp.download(payload);
  } catch (err) {
    alert('Не удалось сформировать счёт: ' + (err.message || err));
  } finally {
    button.disabled = false;
    button.textContent = label;
  }
}

function initInvoiceButtons() {
  $('#btn-invoice-main').addEventListener('click', function () {
    handleInvoiceDownload(
      buildMainInvoicePayload,
      'Заполните все обязательные поля и дождитесь расчёта цены.',
      this
    );
  });

  $('#btn-invoice-order').addEventListener('click', function () {
    handleInvoiceDownload(
      buildOrderInvoicePayload,
      'Добавьте позиции с заполненными параметрами и ненулевой ценой.',
      this
    );
  });
}

window.CalculatorApp = {
  buildMainInvoicePayload,
  buildOrderInvoicePayload,
  fmt,
};

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initServiceSelect();
  state[currentService] = emptyValues(currentService);
  renderMainFields();
  recalcMain();
  initConstructor();
  initInvoiceButtons();
});
