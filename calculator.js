'use strict';

const PLACEHOLDER_OPTION = { value: '', label: '— выберите —' };
const VKR_PAGES_ANCHOR = 60;
const VKR_PAGE_RATE_HARD = 250;
const VKR_PAGE_RATE_SOFT = 200;
const PROJECT_DOCS_VKR = 10000;
const FULL_PAYMENT_DISCOUNT = 0.07;
const LAST_CHANCE_DISCOUNT = 0.10;
const UNIVERSITY_VKR_MAX = 90000;
const UNIVERSITY_VKR_PAGE_RATE_HARD = 210;
const UNIVERSITY_VKR_PAGE_RATE_SOFT = 170;
const PROJECT_DOCS_UNIVERSITY_VKR = 10000;
const TEST_UNIT_PRICE = 990;

const inflateFromFullPayment = (target) => Math.round(target / (1 - FULL_PAYMENT_DISCOUNT));

const VKR_TARGETS_MAIN = {
  humanities: 44990,
  natural: 48990,
  economics: 49990,
  programming: 54990,
  technical: 57990,
  construction: 69990,
};

const VKR_TARGETS_UNIVERSITY = {
  humanities: 41990,
  natural: 43990,
  economics: 47990,
  programming: 49990,
  technical: 54990,
  construction: 59990,
};

const VKR_REQUIREMENTS_MAIN = {
  standardUniqueness: 5500,
  highUniqueness: 12000,
  presentation: 2500,
  speech: 1500,
  projectDocs: PROJECT_DOCS_VKR,
  economicsCalculations: 5000,
};

const VKR_REQUIREMENTS_UNIVERSITY = {
  standardUniqueness: 10000,
  highUniqueness: 12000,
  presentation: 2250,
  speech: 1350,
  projectDocs: PROJECT_DOCS_UNIVERSITY_VKR,
  economicsCalculations: 5000,
};

const VKR_BASE_MAIN = inflateFromFullPayment(VKR_TARGETS_MAIN.humanities)
  - VKR_REQUIREMENTS_MAIN.standardUniqueness
  - VKR_REQUIREMENTS_MAIN.presentation
  - VKR_REQUIREMENTS_MAIN.speech;
const UNIVERSITY_VKR_BASE = inflateFromFullPayment(VKR_TARGETS_UNIVERSITY.humanities)
  - VKR_REQUIREMENTS_UNIVERSITY.standardUniqueness
  - VKR_REQUIREMENTS_UNIVERSITY.presentation
  - VKR_REQUIREMENTS_UNIVERSITY.speech;

function specialtyLabel(value) {
  const item = SPECIALTIES.find((s) => s.value === value);
  return item ? item.label : 'Не выбрана';
}

function specialtyTarget(specialty, targets) {
  return targets[specialty] || targets.humanities;
}

function vkrPageRate(specialty) {
  return ['programming', 'technical', 'construction'].includes(specialty) ? VKR_PAGE_RATE_HARD : VKR_PAGE_RATE_SOFT;
}

function universityVkrPageRate(specialty) {
  return ['programming', 'technical', 'construction'].includes(specialty) ? UNIVERSITY_VKR_PAGE_RATE_HARD : UNIVERSITY_VKR_PAGE_RATE_SOFT;
}

function vkrUrgencySurcharge(specialty, urgency) {
  const hard = ['programming', 'technical', 'construction'].includes(specialty);
  return {
    normal: 0,
    medium: hard ? 7000 : 4000,
    urgent: hard ? 15000 : 8000,
    veryUrgent: hard ? 25000 : 14000,
  }[urgency] || 0;
}

function universityVkrUrgencySurcharge(specialty, urgency) {
  const hard = ['programming', 'technical', 'construction'].includes(specialty);
  const tariffs = {
    soft: { normal: 0, medium: 3200, urgent: 6500, veryUrgent: 11000 },
    hard: { normal: 0, medium: 5200, urgent: 10500, veryUrgent: 17500 },
  };
  return (hard ? tariffs.hard : tariffs.soft)[urgency] || 0;
}

function vkrUniquenessSurcharge(uniqueness, requirements) {
  return { none: 0, standard: requirements.standardUniqueness, high: requirements.highUniqueness }[uniqueness] || 0;
}

function vkrAutoRequirementSurcharge(specialty, requirements) {
  if (specialty === 'economics') return requirements.economicsCalculations;
  return 0;
}

function vkrSpecialtySurcharge(specialty, targets, requirements, base) {
  const targetFull = inflateFromFullPayment(specialtyTarget(specialty, targets));
  const standardProjectDocs = ['programming', 'technical', 'construction'].includes(specialty) ? requirements.projectDocs : 0;
  const standardAuto = vkrAutoRequirementSurcharge(specialty, requirements);
  return targetFull
    - base
    - requirements.standardUniqueness
    - requirements.presentation
    - requirements.speech
    - standardProjectDocs
    - standardAuto;
}

function specialtyMultiplier(specialty, targets) {
  return specialtyTarget(specialty, targets) / targets.humanities;
}

function specialtySurcharge(serviceBase, specialty, targets) {
  return Math.round(serviceBase * (specialtyMultiplier(specialty, targets) - 1));
}

function fullPaymentPrice(fullPrice) {
  return Math.round((Number(fullPrice) || 0) * (1 - FULL_PAYMENT_DISCOUNT));
}

const SPECIALTIES = [
  { value: 'humanities', label: 'Гуманитарная' },
  { value: 'natural', label: 'Естественная' },
  { value: 'economics', label: 'Экономика' },
  { value: 'programming', label: 'Программирование' },
  { value: 'technical', label: 'Инженерная / техническая' },
  { value: 'construction', label: 'Строительство' },
];

const UNIQ_STD = [
  { value: 'none', label: 'Без требований' },
  { value: 'standard', label: 'Обычная уникальность — 60–75%' },
  { value: 'high', label: 'Повышенная уникальность — свыше 75%' },
];

const UNIQ_AI = [
  { value: 'none', label: 'Просто снизить ИИ' },
  { value: 'standard', label: 'Нужно сильно снизить ИИ' },
  { value: 'high', label: 'Нужно максимально безопасно' },
];

const URG_VKR = [
  { value: 'normal', label: 'Стандартно — 4 недели' },
  { value: 'medium', label: 'Немного срочно — 3–4 недели' },
  { value: 'urgent', label: 'Срочно — 1–2 недели' },
  { value: 'veryUrgent', label: 'Очень срочно — менее 1 недели' },
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
    base: VKR_BASE_MAIN,
    max: 120000,
    fields: [
      { key: 'pages', label: 'Количество страниц', type: 'number', min: 30, max: 100, placeholder: '60', step: 1, hint: 'База за 60 стр.; типичный диапазон 50–80 стр.; ±200–250 ₽ за каждую стр. от 60' },
      { key: 'specialization', label: 'Специальность', type: 'select', options: SPECIALTIES },
      { key: 'uniqueness', label: 'Требования по уникальности', type: 'select', options: UNIQ_STD },
      { key: 'urgency', label: 'Срок выполнения', type: 'select', options: URG_VKR },
      { key: 'presentation', label: 'Нужна презентация', type: 'addonChoice', price: 2500 },
      { key: 'speech', label: 'Нужна речь к защите', type: 'addonChoice', price: 1500 },
      { key: 'projectDocs', label: PROJECT_DOCS_FIELD.label, type: 'addonChoice', price: PROJECT_DOCS_VKR, highlight: true },
    ],
    breakdown(v) {
      const pages = Number(v.pages);
      const pageRate = vkrPageRate(v.specialization);
      const pagesDelta = (pages - VKR_PAGES_ANCHOR) * pageRate;
      const spec = vkrSpecialtySurcharge(v.specialization, VKR_TARGETS_MAIN, VKR_REQUIREMENTS_MAIN, VKR_BASE_MAIN);
      const uniq = vkrUniquenessSurcharge(v.uniqueness, VKR_REQUIREMENTS_MAIN);
      const urg = vkrUrgencySurcharge(v.specialization, v.urgency);
      const auto = vkrAutoRequirementSurcharge(v.specialization, VKR_REQUIREMENTS_MAIN);
      return [
        { label: `Корректировка страниц (${pages} − ${VKR_PAGES_ANCHOR}) × ${pageRate} ₽`, value: pagesDelta },
        { label: `Специальность — ${specialtyLabel(v.specialization)}`, value: spec },
        { label: 'Уникальность', value: uniq },
        { label: 'Срочность', value: urg },
        { label: 'Расчёты по экономике', value: auto },
        { label: 'Презентация', value: v.presentation === 'yes' ? 2500 : 0 },
        { label: 'Речь к защите', value: v.speech === 'yes' ? 1500 : 0 },
        { label: 'Проектная документация', value: v.projectDocs === 'yes' ? PROJECT_DOCS_VKR : 0 },
      ];
    },
  },

  universityDiploma: {
    label: 'ВКР МТИ / Синергия',
    base: UNIVERSITY_VKR_BASE,
    max: UNIVERSITY_VKR_MAX,
    hidden: true,
    fields: [
      DISCIPLINE_FIELD,
      { key: 'pages', label: 'Количество страниц', type: 'number', min: 30, max: 100, placeholder: '60', step: 1, hint: 'База 29 990 ₽ за 60 стр.; ±170–210 ₽ за каждую стр. от 60' },
      { key: 'specialization', label: 'Специальность', type: 'select', options: SPECIALTIES },
      { key: 'uniqueness', label: 'Требования по уникальности', type: 'select', options: UNIQ_STD },
      { key: 'urgency', label: 'Срок выполнения', type: 'select', options: URG_VKR },
      { key: 'presentation', label: 'Нужна презентация', type: 'addonChoice', price: 2250 },
      { key: 'speech', label: 'Нужна речь к защите', type: 'addonChoice', price: 1350 },
      { key: 'projectDocs', label: PROJECT_DOCS_FIELD.label, type: 'addonChoice', price: PROJECT_DOCS_UNIVERSITY_VKR, highlight: true },
    ],
    breakdown(v) {
      const pages = Number(v.pages);
      const pageRate = universityVkrPageRate(v.specialization);
      const pagesDelta = (pages - VKR_PAGES_ANCHOR) * pageRate;
      const spec = vkrSpecialtySurcharge(v.specialization, VKR_TARGETS_UNIVERSITY, VKR_REQUIREMENTS_UNIVERSITY, UNIVERSITY_VKR_BASE);
      const uniq = vkrUniquenessSurcharge(v.uniqueness, VKR_REQUIREMENTS_UNIVERSITY);
      const urg = universityVkrUrgencySurcharge(v.specialization, v.urgency);
      const auto = vkrAutoRequirementSurcharge(v.specialization, VKR_REQUIREMENTS_UNIVERSITY);
      return [
        { label: `Корректировка страниц (${pages} − ${VKR_PAGES_ANCHOR}) × ${pageRate} ₽`, value: pagesDelta },
        { label: `Специальность — ${specialtyLabel(v.specialization)}`, value: spec },
        { label: 'Уникальность', value: uniq },
        { label: 'Срочность', value: urg },
        { label: 'Расчёты по экономике', value: auto },
        { label: 'Презентация', value: v.presentation === 'yes' ? 2250 : 0 },
        { label: 'Речь к защите', value: v.speech === 'yes' ? 1350 : 0 },
        { label: 'Проектная документация', value: v.projectDocs === 'yes' ? PROJECT_DOCS_UNIVERSITY_VKR : 0 },
      ];
    },
  },

  coursework: {
    label: 'Курсовая',
    base: 4400,
    max: 19990,
    fields: [
      { key: 'pages', label: 'Количество страниц', type: 'number', min: 5, max: 60, placeholder: '20', step: 1, hint: '+100 ₽ за страницу' },
      { key: 'specialization', label: 'Специальность', type: 'select', options: SPECIALTIES },
      { key: 'uniqueness', label: 'Требования по уникальности', type: 'select', options: UNIQ_STD },
      { key: 'urgency', label: 'Срок выполнения', type: 'select', options: URG_MID },
      { key: 'calculations', label: 'Нужны расчёты', type: 'checkbox', price: 3750 },
      { ...PROJECT_DOCS_FIELD, price: 5000 },
    ],
    breakdown(v) {
      const pages = Number(v.pages);
      return [
        { label: `Страницы (${pages} × 100 ₽)`, value: pages * 100 },
        { label: `Специальность — ${specialtyLabel(v.specialization)}`, value: specialtySurcharge(4400, v.specialization, VKR_TARGETS_MAIN) },
        { label: 'Уникальность', value: { none: 0, standard: 1300, high: 2900 }[v.uniqueness] },
        { label: 'Срочность', value: { normal: 0, medium: 1000, urgent: 2400, veryUrgent: 4300 }[v.urgency] },
        { label: 'Расчёты', value: v.calculations ? 3750 : 0 },
        { label: 'Проектная документация', value: v.projectDocs ? 5000 : 0 },
      ];
    },
  },

  practice: {
    label: 'Практика',
    base: 5000,
    max: 13200,
    fields: [
      DISCIPLINE_FIELD,
      { key: 'pages', label: 'Количество страниц', type: 'number', min: 5, max: 60, placeholder: '20', step: 1, hint: '+80 ₽ за страницу' },
      { key: 'specialization', label: 'Специальность', type: 'select', options: SPECIALTIES },
      { key: 'uniqueness', label: 'Требования по уникальности', type: 'select', options: UNIQ_STD },
      { key: 'urgency', label: 'Срок выполнения', type: 'select', options: URG_MID },
      { key: 'diary', label: 'Дневник практики', type: 'checkbox', price: 1275 },
      { key: 'characteristic', label: 'Характеристика', type: 'checkbox', price: 1020 },
      {
        key: 'projectDocs',
        label: '+ Доп. материалы к практике — чертежи / макеты / приложения и прочее',
        type: 'checkbox',
        price: 5100,
        highlight: true,
      },
    ],
    breakdown(v) {
      const pages = Number(v.pages);
      return [
        { label: `Страницы (${pages} × 80 ₽)`, value: pages * 80 },
        { label: `Специальность — ${specialtyLabel(v.specialization)}`, value: specialtySurcharge(5000, v.specialization, VKR_TARGETS_MAIN) },
        { label: 'Уникальность', value: { none: 0, standard: 800, high: 1500 }[v.uniqueness] },
        { label: 'Срочность', value: { normal: 0, medium: 900, urgent: 1500, veryUrgent: 2600 }[v.urgency] },
        { label: 'Дневник практики', value: v.diary ? 1275 : 0 },
        { label: 'Характеристика', value: v.characteristic ? 1020 : 0 },
        { label: 'Доп. материалы', value: v.projectDocs ? 5100 : 0 },
      ];
    },
  },

  referat: {
    label: 'Реферат',
    base: 2700,
    max: 5500,
    fields: [
      { key: 'pages', label: 'Количество страниц', type: 'number', min: 3, max: 40, placeholder: '10', step: 1, hint: '+60 ₽ за страницу' },
      { key: 'specialization', label: 'Специальность', type: 'select', options: SPECIALTIES },
      { key: 'uniqueness', label: 'Требования по уникальности', type: 'select', options: UNIQ_STD },
      { key: 'urgency', label: 'Срок выполнения', type: 'select', options: URG_SHORT },
    ],
    breakdown(v) {
      const pages = Number(v.pages);
      return [
        { label: `Страницы (${pages} × 60 ₽)`, value: pages * 60 },
        { label: `Специальность — ${specialtyLabel(v.specialization)}`, value: specialtySurcharge(2700, v.specialization, VKR_TARGETS_MAIN) },
        { label: 'Уникальность', value: { none: 0, standard: 500, high: 950 }[v.uniqueness] },
        { label: 'Срочность', value: { normal: 0, medium: 450, urgent: 950, veryUrgent: 1600 }[v.urgency] },
      ];
    },
  },

  control: {
    label: 'Контрольная работа',
    base: 2700,
    max: 5500,
    fields: [
      { key: 'pages', label: 'Количество страниц', type: 'number', min: 3, max: 50, placeholder: '10', step: 1, hint: '+90 ₽ за страницу' },
      { key: 'specialization', label: 'Специальность', type: 'select', options: SPECIALTIES },
      { key: 'uniqueness', label: 'Требования по уникальности', type: 'select', options: UNIQ_STD },
      { key: 'urgency', label: 'Срок выполнения', type: 'select', options: URG_SHORT },
      { key: 'calculations', label: 'Есть расчёты', type: 'checkbox', price: 2000 },
    ],
    breakdown(v) {
      const pages = Number(v.pages);
      return [
        { label: `Страницы (${pages} × 90 ₽)`, value: pages * 90 },
        { label: `Специальность — ${specialtyLabel(v.specialization)}`, value: specialtySurcharge(2700, v.specialization, VKR_TARGETS_MAIN) },
        { label: 'Уникальность', value: { none: 0, standard: 650, high: 1250 }[v.uniqueness] },
        { label: 'Срочность', value: { normal: 0, medium: 650, urgent: 1250, veryUrgent: 2200 }[v.urgency] },
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
      { key: 'specialization', label: 'Специальность', type: 'select', options: SPECIALTIES },
      { key: 'uniqueness', label: 'Задача по ИИ', type: 'select', options: UNIQ_AI },
      { key: 'urgency', label: 'Срок выполнения', type: 'select', options: URG_SHORT },
    ],
    breakdown(v) {
      const pages = Number(v.pages);
      return [
        { label: `Страницы (${pages} × 80 ₽)`, value: pages * 80 },
        { label: `Специальность — ${specialtyLabel(v.specialization)}`, value: specialtySurcharge(4000, v.specialization, VKR_TARGETS_MAIN) },
        { label: 'Задача по ИИ', value: { none: 0, standard: 1500, high: 3000 }[v.uniqueness] },
        { label: 'Срочность', value: { normal: 0, medium: 1000, urgent: 2000, veryUrgent: 3000 }[v.urgency] },
      ];
    },
  },

  test: {
    label: 'Тест',
    base: TEST_UNIT_PRICE,
    max: 35000,
    fields: [
      DISCIPLINE_FIELD,
      {
        key: 'testsCount',
        label: 'Количество тестов',
        type: 'number',
        min: 1,
        max: 30,
        placeholder: '1',
        step: 1,
        hint: '990 ₽ за каждый тест (единая цена для всех вузов)',
      },
    ],
    breakdown(v) {
      const testsCount = Number(v.testsCount);
      const extra = Math.max(0, testsCount - 1) * TEST_UNIT_PRICE;
      if (testsCount <= 1) return [];
      return [
        { label: `Доп. тесты (${testsCount - 1} × ${TEST_UNIT_PRICE} ₽)`, value: extra },
      ];
    },
  },
};

const CONSTRUCTOR_KINDS = {
  diploma: { label: 'ВКР', serviceKey: 'universityDiploma' },
  coursework: { label: 'Курсовая', preset: 'coursework' },
  practice: { label: 'Практика', preset: 'practice' },
  test: { label: 'Тест', preset: 'test' },
  aiCleaning: { label: 'Очистка от ИИ', serviceKey: 'aiCleaning' },
  custom: { label: 'Своя позиция', manual: true },
};

const PRACTICE_PRESETS = {
  standard: { label: 'Базовая практика', price: 5990 },
  design: { label: 'Сложная практика / дизайн', price: 14990 },
};

const COURSEWORK_PRESETS = {
  standard: { label: 'Простая курсовая МТИ / Синергия', price: 9990 },
  hard: { label: 'Сложная курсовая МТИ / Синергия', price: 14990 },
};

const clamp = (n, lo, hi) => Math.min(Math.max(n, lo), hi);
const fmt = (n) => new Intl.NumberFormat('ru-RU').format(Math.round(n));
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function paymentInfo(discountedPrice, fullPrice) {
  const discounted = Math.max(0, Math.round(Number(discountedPrice) || 0));
  const amount = Math.max(0, Math.round(Number(fullPrice || discountedPrice) || 0));
  if (discounted <= 0 || amount <= 0) {
    return {
      discountPrice: 0,
      discountText: 'Скидка 7% при полной оплате появится после расчёта.',
      partsText: 'Схема оплаты появится после расчёта.',
      lastChanceText: '',
    };
  }

  let partsText = `Можно оплатить заказ до 3 частей по ${fmt(amount / 3)} ₽.`;
  if (amount <= 3000) {
    partsText = 'До 3 000 ₽ — только полная оплата.';
  } else if (amount <= 10000) {
    partsText = `До 10 000 ₽ — можно оплатить 2 частями по ${fmt(amount / 2)} ₽.`;
  }

  return {
    discountPrice: discounted,
    fullPrice: amount,
    discountText: `Цена при полной оплате со скидкой 7%: ${fmt(discounted)} ₽.`,
    partsText: `При оплате частями цена без скидки: ${fmt(amount)} ₽. ${partsText}`,
    lastChanceText: `Скидка последней надежды 10%: ${fmt(discounted * (1 - LAST_CHANCE_DISCOUNT))} ₽, если клиент решил подумать или не отвечает 2 часа.`,
  };
}

function renderPaymentInfo(el, discountedPrice, fullPrice, guidanceText) {
  if (!el || discountedPrice <= 0) {
    if (el) {
      el.classList.add('hidden');
      el.innerHTML = '';
    }
    return;
  }

  const info = paymentInfo(discountedPrice, fullPrice);
  const guidance = guidanceText ? `<span>${guidanceText}</span>` : '';
  el.innerHTML = `
    <span><strong>${info.discountText}</strong></span>
    <span>${info.partsText}</span>
    <span>${info.lastChanceText}</span>
    ${guidance}
  `;
  el.classList.remove('hidden');
}

function managerGuidance(values) {
  if (!values || !values.specialization) return '';
  const bySpecialty = {
    humanities: 'Аргумент менеджеру: цена держится на объёме, логике текста и прохождении уникальности 60–75%+ без рискованных заимствований.',
    natural: 'Аргумент менеджеру: естественная специальность требует проверки терминов, источников и корректной структуры, поэтому работа дороже гуманитарной.',
    economics: 'Аргумент менеджеру: в экономике важны расчёты, таблицы и выводы по цифрам, это не просто текстовая работа.',
    programming: 'Аргумент менеджеру: в программировании важны язык, стек, код, тестирование и связка практической части с текстом ВКР.',
    technical: 'Аргумент менеджеру: инженерная работа требует технических расчётов, нормативов, схем и точной терминологии.',
    construction: 'Аргумент менеджеру: строительство включает чертежи, нагрузки, нормативы и проверку проектной логики.',
  };
  return `${bySpecialty[values.specialization] || ''} Преподаватель перед защитой проведёт консультацию и подготовит клиента к вопросам комиссии.`;
}

function optionLabel(options, value) {
  const item = (options || []).find((o) => o.value === value);
  return item ? item.label : value;
}

function describeValue(field, value) {
  if (field.type === 'select') return optionLabel(field.options, value);
  if (field.type === 'addonChoice') return value === 'yes' ? 'Надо' : 'Не надо';
  if (field.type === 'checkbox') return value ? 'Да' : 'Нет';
  return value;
}

function serviceParams(serviceKey, values) {
  const svc = SERVICES[serviceKey];
  return svc.fields
    .filter((field) => field.key && !field.optional)
    .map((field) => `${field.label}: ${describeValue(field, values[field.key])}`);
}

function paymentNotes(discountedPrice, fullPrice, values) {
  const info = paymentInfo(discountedPrice, fullPrice);
  const notes = [
    info.discountText,
    info.partsText,
    info.lastChanceText,
  ];
  const guidance = managerGuidance(values);
  if (guidance) notes.push(guidance);
  return notes;
}

let itemIdCounter = 0;
function nextItemId() {
  itemIdCounter += 1;
  return 'item-' + itemIdCounter;
}

function emptyValues(serviceKey) {
  const values = {};
  for (const f of SERVICES[serviceKey].fields) {
    if (!f.key) continue;
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
    } else if (f.type === 'addonChoice') {
      if (values[f.key] !== 'yes' && values[f.key] !== 'no') return false;
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
    return { price: 0, fullPrice: 0, raw: 0, rows: [], clamped: false, override: false, incomplete: true };
  }
  if (svc.override) {
    const fixed = svc.override(values);
    if (fixed !== null && fixed !== undefined) {
      const price = fullPaymentPrice(fixed);
      return {
        price,
        fullPrice: fixed,
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
  const fullPrice = clamp(raw, svc.base, svc.max);
  const price = fullPaymentPrice(fullPrice);
  return {
    price,
    fullPrice,
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
    const fullPrice = Math.max(0, Number(item.values.manualPrice) || 0);
    const price = fullPaymentPrice(fullPrice);
    const title = (item.values.title || '').trim() || 'Своя позиция';
    if (!title || fullPrice <= 0) return { price: 0, fullPrice: 0, label: title || 'Своя позиция', rows: [], incomplete: true };
    return { price, fullPrice, label: title, rows: [{ label: title, value: fullPrice }], incomplete: false };
  }

  if (kind.preset === 'practice') {
    const qtyRaw = item.values.quantity;
    const qty = Number(qtyRaw);
    if (qtyRaw === '' || Number.isNaN(qty) || qty < 1) {
      return { price: 0, fullPrice: 0, label: kind.label, rows: [], incomplete: true };
    }
    const q = clamp(Math.round(qty), 1, 10);
    const preset = PRACTICE_PRESETS[item.values.practiceType || 'standard'];
    const unit = preset ? preset.price : PRACTICE_PRESETS.standard.price;
    const fullPrice = unit * q;
    const price = fullPaymentPrice(fullPrice);
    const label = withDiscipline(q > 1 ? `${preset.label} × ${q}` : preset.label, item.values);
    return {
      price,
      fullPrice,
      label,
      rows: [{ label: `${preset.label} (${q} × ${fmt(unit)} ₽)`, value: fullPrice }],
      incomplete: false,
    };
  }

  if (kind.preset === 'coursework') {
    const qtyRaw = item.values.quantity;
    const qty = Number(qtyRaw);
    if (qtyRaw === '' || Number.isNaN(qty) || qty < 1) {
      return { price: 0, fullPrice: 0, label: kind.label, rows: [], incomplete: true };
    }
    const q = clamp(Math.round(qty), 1, 10);
    const preset = COURSEWORK_PRESETS[item.values.courseworkType || 'standard'];
    const unit = preset ? preset.price : COURSEWORK_PRESETS.standard.price;
    const fullPrice = unit * q;
    const price = fullPaymentPrice(fullPrice);
    const label = withDiscipline(q > 1 ? `${preset.label} × ${q}` : preset.label, item.values);
    return {
      price,
      fullPrice,
      label,
      rows: [{ label: `${preset.label} (${q} × ${fmt(unit)} ₽)`, value: fullPrice }],
      incomplete: false,
    };
  }

  if (kind.preset === 'test') {
    const qtyRaw = item.values.quantity;
    const qty = Number(qtyRaw);
    if (qtyRaw === '' || Number.isNaN(qty) || qty < 1) {
      return { price: 0, fullPrice: 0, label: kind.label, rows: [], incomplete: true };
    }
    const q = clamp(Math.round(qty), 1, 30);
    const fullPrice = TEST_UNIT_PRICE * q;
    const price = fullPaymentPrice(fullPrice);
    const label = withDiscipline(q > 1 ? `Тест × ${q}` : 'Тест', item.values);
    return {
      price,
      fullPrice,
      label,
      rows: [{ label: `Тест (${q} × ${fmt(TEST_UNIT_PRICE)} ₽)`, value: fullPrice }],
      incomplete: false,
    };
  }

  if (kind.serviceKey) {
    const result = computePrice(kind.serviceKey, item.values);
    const label = withDiscipline(SERVICES[kind.serviceKey].label, item.values);
    return {
      price: result.price,
      fullPrice: result.fullPrice,
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

function renderAddonChoiceField(wrap, f, values, onChange) {
  wrap.className = 'field field-addon-choice' + (f.highlight ? ' field-highlight' : '');
  if (f.highlight) {
    const badge = document.createElement('span');
    badge.className = 'highlight-badge';
    badge.textContent = 'Важно — не пропустите';
    wrap.appendChild(badge);
  }

  const labelSpan = document.createElement('span');
  labelSpan.className = 'field-label addon-choice-label';
  let priceChip = '';
  if (f.price) {
    priceChip = ` <em class="chip">+${fmt(f.price)} ₽</em>`;
  }
  labelSpan.innerHTML = f.label + priceChip;
  wrap.appendChild(labelSpan);

  const buttons = document.createElement('div');
  buttons.className = 'addon-choice-buttons';

  const noBtn = document.createElement('button');
  noBtn.type = 'button';
  noBtn.className = 'addon-choice-btn addon-choice-no';
  noBtn.textContent = '✕ Не надо';

  const yesBtn = document.createElement('button');
  yesBtn.type = 'button';
  yesBtn.className = 'addon-choice-btn addon-choice-yes';
  yesBtn.textContent = '✓ Надо';

  const sync = () => {
    noBtn.classList.toggle('active', values[f.key] === 'no');
    yesBtn.classList.toggle('active', values[f.key] === 'yes');
  };

  noBtn.addEventListener('click', () => {
    values[f.key] = 'no';
    sync();
    onChange();
  });
  yesBtn.addEventListener('click', () => {
    values[f.key] = 'yes';
    sync();
    onChange();
  });

  sync();
  buttons.appendChild(noBtn);
  buttons.appendChild(yesBtn);
  wrap.appendChild(buttons);
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
      if (f.price) {
        priceChip = ` <em class="chip">+${fmt(f.price)} ₽</em>`;
      }
      span.innerHTML = f.label + priceChip;
      row.appendChild(input);
      row.appendChild(span);
      wrap.appendChild(row);
    } else if (f.type === 'addonChoice') {
      renderAddonChoiceField(wrap, f, values, onChange);
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
    if (svc.hidden) continue;
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
  $('#price-min').textContent = fmt(fullPaymentPrice(svc.base));
  $('#price-max').textContent = fmt(fullPaymentPrice(svc.max));

  renderBreakdownList($('#breakdown-list'), currentService, result);
  renderPaymentInfo($('#payment-info-main'), result.incomplete ? 0 : result.price, result.fullPrice, managerGuidance(values));

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
  if (cfg.preset === 'coursework') return { courseworkType: 'standard', quantity: '', discipline: '' };
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

function renderPresetTypeFields(container, values, onChange, presets, typeKey, typeLabel, defaultType) {
  const typeField = document.createElement('label');
  typeField.className = 'field';
  typeField.innerHTML = `<span class="field-label">${typeLabel}</span>`;
  const typeSelect = document.createElement('select');
  typeSelect.className = 'select';
  for (const [key, preset] of Object.entries(presets)) {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = `${preset.label} — ${fmt(preset.price)} ₽`;
    typeSelect.appendChild(opt);
  }
  typeSelect.value = values[typeKey] || defaultType;
  typeSelect.addEventListener('change', () => {
    values[typeKey] = typeSelect.value;
    onChange();
  });
  typeField.appendChild(typeSelect);
  container.appendChild(typeField);
}

function renderPracticePresetFields(container, values, onChange) {
  container.innerHTML = '';
  renderDisciplineField(container, values, onChange);
  renderPresetTypeFields(container, values, onChange, PRACTICE_PRESETS, 'practiceType', 'Тип практики', 'standard');

  const qtyField = document.createElement('label');
  qtyField.className = 'field';
  qtyField.innerHTML = '<span class="field-label">Количество</span>';
  renderNumberField(qtyField, { key: 'quantity', min: 1, max: 10, step: 1, placeholder: '1' }, values, onChange);
  container.appendChild(qtyField);
}

function renderCourseworkPresetFields(container, values, onChange) {
  container.innerHTML = '';
  renderDisciplineField(container, values, onChange);
  renderPresetTypeFields(container, values, onChange, COURSEWORK_PRESETS, 'courseworkType', 'Тип курсовой', 'standard');

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
  } else if (cfg.preset === 'coursework') {
    renderCourseworkPresetFields(fieldsWrap, item.values, onChange);
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
  let fullTotal = 0;
  const breakdownEl = $('#order-breakdown');
  breakdownEl.innerHTML = '';

  for (const item of orderItems) {
    const computed = computeOrderItemPrice(item);
    total += computed.price;
    fullTotal += computed.fullPrice || computed.price;
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
  renderPaymentInfo($('#payment-info-order'), total, fullTotal);
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
    items: [{
      name: label,
      qty: 1,
      unitPrice: result.price,
      amount: result.price,
      fullPrice: result.fullPrice,
      details,
      params: serviceParams(currentService, values),
    }],
    total: result.price,
    fullTotal: result.fullPrice,
    notes: paymentNotes(result.price, result.fullPrice, values),
  };
}

function buildOrderInvoicePayload() {
  if (orderItems.length === 0) return null;

  const items = [];
  let total = 0;
  let fullTotal = 0;
  const notes = [];

  for (const item of orderItems) {
    const computed = computeOrderItemPrice(item);
    if (computed.incomplete || computed.price <= 0) continue;
    total += computed.price;
    fullTotal += computed.fullPrice || computed.price;
    const kind = CONSTRUCTOR_KINDS[item.kind];
    const params = kind && kind.serviceKey ? serviceParams(kind.serviceKey, item.values) : [];
    items.push({
      name: computed.label,
      qty: 1,
      unitPrice: computed.price,
      amount: computed.price,
      fullPrice: computed.fullPrice || computed.price,
      details: computed.rows || [],
      params,
    });
    if (kind && kind.serviceKey && item.values.specialization) {
      notes.push(managerGuidance(item.values));
    }
  }

  if (items.length === 0 || total <= 0) return null;
  return { items, total, fullTotal, notes: paymentNotes(total, fullTotal, {}).concat(notes) };
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
