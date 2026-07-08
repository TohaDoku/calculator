'use strict';

/* ---------- Вспомогательные наборы опций ---------- */

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

/* ---------- Конфигурация услуг ----------
   Каждая услуга имеет:
   - base: минимальная цена
   - max: потолок цены
   - fields: описание полей формы
   - calcExtra(values): сумма надбавок
   - breakdown(values): подробная расшифровка (для UI)
------------------------------------------- */

const SERVICES = {
  diploma: {
    label: 'Дипломная / ВКР',
    base: 35000,
    max: 120000,
    fields: [
      { key: 'pages', label: 'Количество страниц', type: 'number', min: 30, max: 100, def: 40, step: 1, hint: 'Включено до 40 стр., далее +250 ₽/стр.' },
      { key: 'specialization', label: 'Сложность специализации', type: 'select', options: SPEC_STD },
      { key: 'uniqueness', label: 'Требования по уникальности', type: 'select', options: UNIQ_STD },
      { key: 'urgency', label: 'Срок выполнения', type: 'select', options: URG_VKR },
      { key: 'presentation', label: 'Нужна презентация', type: 'checkbox', price: 2500 },
      { key: 'speech', label: 'Нужна речь к защите', type: 'checkbox', price: 1500 },
    ],
    breakdown(v) {
      const pages = Number(v.pages || 40);
      const spec = { simple: 0, medium: 7000, hard: 15000 }[v.specialization || 'simple'];
      const uniq = { none: 0, standard: 7000, high: 15000 }[v.uniqueness || 'none'];
      const urg = { normal: 0, medium: 7000, urgent: 15000, veryUrgent: 25000 }[v.urgency || 'normal'];
      return [
        { label: `Страницы сверх 40 (${Math.max(0, pages - 40)} × 250 ₽)`, value: Math.max(0, pages - 40) * 250 },
        { label: 'Сложность специализации', value: spec },
        { label: 'Уникальность', value: uniq },
        { label: 'Срочность', value: urg },
        { label: 'Презентация', value: v.presentation ? 2500 : 0 },
        { label: 'Речь к защите', value: v.speech ? 1500 : 0 },
      ];
    },
  },

  coursework: {
    label: 'Курсовая',
    base: 4000,
    max: 14000,
    fields: [
      { key: 'pages', label: 'Количество страниц', type: 'number', min: 5, max: 60, def: 20, step: 1, hint: '+160 ₽ за страницу' },
      { key: 'specialization', label: 'Сложность специализации', type: 'select', options: SPEC_STD },
      { key: 'uniqueness', label: 'Требования по уникальности', type: 'select', options: UNIQ_STD },
      { key: 'urgency', label: 'Срок выполнения', type: 'select', options: URG_MID },
      { key: 'calculations', label: 'Нужны расчёты', type: 'checkbox', price: 2500 },
    ],
    breakdown(v) {
      const pages = Number(v.pages || 20);
      return [
        { label: `Страницы (${pages} × 160 ₽)`, value: pages * 160 },
        { label: 'Сложность специализации', value: { simple: 0, medium: 1500, hard: 3000 }[v.specialization || 'simple'] },
        { label: 'Уникальность', value: { none: 0, standard: 1500, high: 3000 }[v.uniqueness || 'none'] },
        { label: 'Срочность', value: { normal: 0, medium: 1000, urgent: 2500, veryUrgent: 4500 }[v.urgency || 'normal'] },
        { label: 'Расчёты', value: v.calculations ? 2500 : 0 },
      ];
    },
  },

  practice: {
    label: 'Практика',
    base: 4000,
    max: 14000,
    fields: [
      { key: 'pages', label: 'Количество страниц', type: 'number', min: 5, max: 60, def: 20, step: 1, hint: '+120 ₽ за страницу' },
      { key: 'specialization', label: 'Сложность специализации', type: 'select', options: SPEC_STD },
      { key: 'uniqueness', label: 'Требования по уникальности', type: 'select', options: UNIQ_STD },
      { key: 'urgency', label: 'Срок выполнения', type: 'select', options: URG_MID },
      { key: 'diary', label: 'Дневник практики', type: 'checkbox', price: 1500 },
      { key: 'characteristic', label: 'Характеристика', type: 'checkbox', price: 1200 },
    ],
    breakdown(v) {
      const pages = Number(v.pages || 20);
      return [
        { label: `Страницы (${pages} × 120 ₽)`, value: pages * 120 },
        { label: 'Сложность специализации', value: { simple: 0, medium: 1000, hard: 2500 }[v.specialization || 'simple'] },
        { label: 'Уникальность', value: { none: 0, standard: 1000, high: 2000 }[v.uniqueness || 'none'] },
        { label: 'Срочность', value: { normal: 0, medium: 1200, urgent: 2000, veryUrgent: 3500 }[v.urgency || 'normal'] },
        { label: 'Дневник практики', value: v.diary ? 1500 : 0 },
        { label: 'Характеристика', value: v.characteristic ? 1200 : 0 },
      ];
    },
  },

  referat: {
    label: 'Реферат',
    base: 4000,
    max: 8000,
    fields: [
      { key: 'pages', label: 'Количество страниц', type: 'number', min: 3, max: 40, def: 10, step: 1, hint: '+100 ₽ за страницу' },
      { key: 'specialization', label: 'Сложность специализации', type: 'select', options: SPEC_STD },
      { key: 'uniqueness', label: 'Требования по уникальности', type: 'select', options: UNIQ_STD },
      { key: 'urgency', label: 'Срок выполнения', type: 'select', options: URG_SHORT },
    ],
    breakdown(v) {
      const pages = Number(v.pages || 10);
      return [
        { label: `Страницы (${pages} × 100 ₽)`, value: pages * 100 },
        { label: 'Сложность специализации', value: { simple: 0, medium: 500, hard: 1200 }[v.specialization || 'simple'] },
        { label: 'Уникальность', value: { none: 0, standard: 800, high: 1500 }[v.uniqueness || 'none'] },
        { label: 'Срочность', value: { normal: 0, medium: 700, urgent: 1500, veryUrgent: 2500 }[v.urgency || 'normal'] },
      ];
    },
  },

  control: {
    label: 'Контрольная работа',
    base: 4000,
    max: 12000,
    fields: [
      { key: 'pages', label: 'Количество страниц', type: 'number', min: 3, max: 50, def: 10, step: 1, hint: '+150 ₽ за страницу' },
      { key: 'specialization', label: 'Сложность специализации', type: 'select', options: SPEC_STD },
      { key: 'uniqueness', label: 'Требования по уникальности', type: 'select', options: UNIQ_STD },
      { key: 'urgency', label: 'Срок выполнения', type: 'select', options: URG_SHORT },
      { key: 'calculations', label: 'Есть расчёты', type: 'checkbox', price: 2000 },
    ],
    breakdown(v) {
      const pages = Number(v.pages || 10);
      return [
        { label: `Страницы (${pages} × 150 ₽)`, value: pages * 150 },
        { label: 'Сложность специализации', value: { simple: 0, medium: 1000, hard: 2500 }[v.specialization || 'simple'] },
        { label: 'Уникальность', value: { none: 0, standard: 1000, high: 2000 }[v.uniqueness || 'none'] },
        { label: 'Срочность', value: { normal: 0, medium: 1000, urgent: 2000, veryUrgent: 3500 }[v.urgency || 'normal'] },
        { label: 'Расчёты', value: v.calculations ? 2000 : 0 },
      ];
    },
  },

  aiCleaning: {
    label: 'Очистка от ИИ',
    base: 4000,
    max: 12000,
    fields: [
      { key: 'pages', label: 'Количество страниц', type: 'number', min: 3, max: 80, def: 10, step: 1, hint: '+80 ₽ за страницу' },
      { key: 'specialization', label: 'Сложность работы', type: 'select', options: SPEC_WORK },
      { key: 'uniqueness', label: 'Задача по ИИ', type: 'select', options: UNIQ_AI },
      { key: 'urgency', label: 'Срок выполнения', type: 'select', options: URG_SHORT },
    ],
    breakdown(v) {
      const pages = Number(v.pages || 10);
      return [
        { label: `Страницы (${pages} × 80 ₽)`, value: pages * 80 },
        { label: 'Сложность работы', value: { simple: 0, medium: 1000, hard: 2500 }[v.specialization || 'simple'] },
        { label: 'Задача по ИИ', value: { none: 0, standard: 1500, high: 3000 }[v.uniqueness || 'none'] },
        { label: 'Срочность', value: { normal: 0, medium: 1000, urgent: 2000, veryUrgent: 3000 }[v.urgency || 'normal'] },
      ];
    },
  },

  test: {
    label: 'Тест',
    base: 4000,
    max: 12000,
    fields: [
      { key: 'testsCount', label: 'Количество тестов', type: 'number', min: 1, max: 30, def: 1, step: 1, hint: '1 тест до 30 вопросов включён, далее +1 500 ₽ за тест' },
      { key: 'specialization', label: 'Сложность специализации', type: 'select', options: SPEC_STD },
      { key: 'urgency', label: 'Срок выполнения', type: 'select', options: URG_SHORT },
    ],
    breakdown(v) {
      const testsCount = Number(v.testsCount || 1);
      const extra = Math.max(0, testsCount - 1);
      return [
        { label: `Доп. тесты (${extra} × 1 500 ₽)`, value: extra * 1500 },
        { label: 'Сложность специализации', value: { simple: 0, medium: 1000, hard: 2500 }[v.specialization || 'simple'] },
        { label: 'Срочность', value: { normal: 0, medium: 500, urgent: 1000, veryUrgent: 2000 }[v.urgency || 'normal'] },
      ];
    },
  },
};

// Общая надбавка = сумма всех строк расшифровки
function calcExtra(serviceKey, values) {
  return SERVICES[serviceKey].breakdown(values).reduce((sum, row) => sum + row.value, 0);
}

/* ---------- Матрица ВКР для МТИ / Синергия ---------- */
const VKR_PRICES = {
  simple: { college: 35000, bachelor: 42000, master: 47000 },
  hard: { college: 45000, bachelor: 52000, master: 60000 },
};

/* ---------- Утилиты ---------- */
const clamp = (n, lo, hi) => Math.min(Math.max(n, lo), hi);
const fmt = (n) => new Intl.NumberFormat('ru-RU').format(Math.round(n));

/* ---------- Состояние ---------- */
let currentService = 'diploma';
const state = {}; // serviceKey -> values

function defaultValues(serviceKey) {
  const values = {};
  for (const f of SERVICES[serviceKey].fields) {
    if (f.type === 'number') values[f.key] = f.def;
    else if (f.type === 'select') values[f.key] = f.options[0].value;
    else if (f.type === 'checkbox') values[f.key] = false;
  }
  return values;
}

/* ---------- DOM ---------- */
const $ = (sel) => document.querySelector(sel);

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
    renderFields();
    recalc();
  });
}

function renderFields() {
  const svc = SERVICES[currentService];
  if (!state[currentService]) state[currentService] = defaultValues(currentService);
  const values = state[currentService];

  const container = $('#fields-container');
  container.innerHTML = '';

  for (const f of svc.fields) {
    const wrap = document.createElement('label');
    wrap.className = 'field';

    if (f.type === 'checkbox') {
      wrap.className = 'field field-checkbox';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = !!values[f.key];
      input.addEventListener('change', () => {
        values[f.key] = input.checked;
        recalc();
      });
      const span = document.createElement('span');
      span.className = 'checkbox-label';
      span.innerHTML = `${f.label} <em class="chip">+${fmt(f.price)} ₽</em>`;
      wrap.appendChild(input);
      wrap.appendChild(span);
    } else {
      const labelSpan = document.createElement('span');
      labelSpan.className = 'field-label';
      labelSpan.textContent = f.label;
      wrap.appendChild(labelSpan);

      if (f.type === 'number') {
        const row = document.createElement('div');
        row.className = 'stepper';
        const dec = document.createElement('button');
        dec.type = 'button';
        dec.className = 'step-btn';
        dec.textContent = '−';
        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'input';
        input.min = f.min; input.max = f.max; input.step = f.step || 1;
        input.value = values[f.key];
        const inc = document.createElement('button');
        inc.type = 'button';
        inc.className = 'step-btn';
        inc.textContent = '+';

        const commit = (val) => {
          let n = Number(val);
          if (Number.isNaN(n)) n = f.min;
          n = clamp(Math.round(n), f.min, f.max);
          values[f.key] = n;
          input.value = n;
          recalc();
        };
        input.addEventListener('input', () => {
          const n = Number(input.value);
          if (!Number.isNaN(n)) { values[f.key] = n; recalc(); }
        });
        input.addEventListener('blur', () => commit(input.value));
        dec.addEventListener('click', () => commit(Number(input.value) - 1));
        inc.addEventListener('click', () => commit(Number(input.value) + 1));

        row.appendChild(dec);
        row.appendChild(input);
        row.appendChild(inc);
        wrap.appendChild(row);
      } else if (f.type === 'select') {
        const select = document.createElement('select');
        select.className = 'select';
        for (const o of f.options) {
          const opt = document.createElement('option');
          opt.value = o.value;
          opt.textContent = o.label;
          select.appendChild(opt);
        }
        select.value = values[f.key];
        select.addEventListener('change', () => { values[f.key] = select.value; recalc(); });
        wrap.appendChild(select);
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

function recalc() {
  const svc = SERVICES[currentService];
  const values = state[currentService];

  const rows = svc.breakdown(values);
  const extra = rows.reduce((s, r) => s + r.value, 0);
  const raw = svc.base + extra;
  const price = clamp(raw, svc.base, svc.max);

  $('#price-value').textContent = fmt(price);
  $('#price-value-2').textContent = fmt(price);
  $('#price-min').textContent = fmt(svc.base);
  $('#price-max').textContent = fmt(svc.max);

  // Расшифровка
  const list = $('#breakdown-list');
  list.innerHTML = '';
  const baseLi = document.createElement('li');
  baseLi.innerHTML = `<span>База (${svc.label})</span><span>${fmt(svc.base)} ₽</span>`;
  list.appendChild(baseLi);
  for (const r of rows) {
    if (r.value === 0) continue;
    const li = document.createElement('li');
    li.innerHTML = `<span>${r.label}</span><span>+${fmt(r.value)} ₽</span>`;
    list.appendChild(li);
  }

  // Бейдж клампа
  const badge = $('#clamp-badge');
  if (raw > svc.max) {
    badge.textContent = 'Достигнут потолок';
    badge.classList.remove('hidden');
  } else if (raw < svc.base) {
    badge.textContent = 'Минимальная цена';
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

/* ---------- МТИ / Синергия ---------- */
function recalcUniversity() {
  const level = $('#uni-level').value;
  const complexity = $('#uni-complexity').value;
  const price = VKR_PRICES[complexity][level];
  $('#uni-price').textContent = fmt(price);

  const levelLabel = { college: 'Колледж', bachelor: 'Бакалавр / специалист', master: 'Магистр' }[level];
  const compLabel = { simple: 'Простая', hard: 'Сложная' }[complexity];
  $('#uni-desc').textContent = `${compLabel} ВКР · ${levelLabel}`;
}

/* ---------- Переключение режимов ---------- */
function initTabs() {
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
      document.querySelectorAll('.mode').forEach((m) => m.classList.remove('active'));
      tab.classList.add('active');
      $('#mode-' + tab.dataset.mode).classList.add('active');
    });
  });
}

/* ---------- Инициализация ---------- */
document.addEventListener('DOMContentLoaded', () => {
  $('#year').textContent = new Date().getFullYear();
  initTabs();
  initServiceSelect();
  renderFields();
  recalc();

  $('#uni-level').addEventListener('change', recalcUniversity);
  $('#uni-complexity').addEventListener('change', recalcUniversity);
  recalcUniversity();

  document.querySelectorAll('.btn-primary').forEach((btn) => {
    btn.addEventListener('click', () => {
      btn.classList.add('pulse');
      setTimeout(() => btn.classList.remove('pulse'), 400);
    });
  });
});
