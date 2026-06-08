#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const DEFAULT_TARGET = '/Users/romansuslin_1/Downloads/All_Code/mbs-mixology-cup';
const TARGET_DIR = process.argv[2] || DEFAULT_TARGET;
const REPORT_PATH = path.join(ROOT, 'reports', 'mbs-mixology-cup-clients-2026-06-05T18-04-17.clients.json');
const VERSION = '20260605-1';
const HOSTED_URL = `https://api.barista-school.ru/api/mbs-mixology-cup.html?v=${VERSION}`;
const PUBLIC_DATA_URL = 'https://api.barista-school.ru/api/mbs-mixology-cup-data.json';
const CHAMPIONSHIPS_GALLERY_URL = 'https://api.barista-school.ru/api/championships-gallery.json';
const HOSTED_HTML_NAME = 'mbs-mixology-cup.html';

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function publicParticipant(row) {
  const status = String(row.mixology_records || '');
  const dates = String(row.mixology_dates || '').split(/,\s*/).filter(Boolean);
  const bookingDates = parseRecordStatuses(status).map((record) => record.date);
  return {
    name: String(row.name || 'Без имени').trim(),
    cupVisits: Number(row.mixology_active_visits) || 0,
    cupBookings: Number(row.mixology_bookings_in_range) || 0,
    schoolVisits: Number(row.total_active_visits) || 0,
    firstCupDate: row.first_cup_date || '',
    dates,
    bookingDates,
    segment: row.community_segment || '',
    status
  };
}

function normalizeParticipants(rows) {
  return rows
    .map(publicParticipant)
    .sort((a, b) => {
      return b.cupVisits - a.cupVisits
        || b.schoolVisits - a.schoolVisits
        || a.name.localeCompare(b.name, 'ru');
    });
}

function statusCount(participants, date, status) {
  return participants.filter((item) => {
    return parseRecordStatuses(item.status).some((record) => record.date === date && record.status === status);
  }).length;
}

function bookingCount(participants, date) {
  return participants.filter((item) => item.status.includes(`${date} `)).length;
}

function formatDate(date) {
  const parts = String(date || '').split('-');
  if (parts.length !== 3) return date || '';
  return `${parts[2]}.${parts[1]}.${parts[0]}`;
}

function seasonParticipants(participants, date) {
  return participants
    .filter((item) => item.status.includes(`${date} `))
    .map((item) => ({
      name: item.name,
      active: item.dates.includes(date),
      cupVisits: item.cupVisits
    }))
    .sort((a, b) => Number(b.active) - Number(a.active) || b.cupVisits - a.cupVisits || a.name.localeCompare(b.name, 'ru'));
}

function parseRecordStatuses(value) {
  return String(value || '')
    .split(' | ')
    .map((part) => {
      const match = part.match(/^(\d{4}-\d{2}-\d{2})\s+\d{2}:\d{2}\s+([a-z_]+)/);
      return match ? { date: match[1], status: match[2] } : null;
    })
    .filter(Boolean);
}

function stripPrivateRuntimeFields(participants) {
  return participants.map((item) => ({
    name: item.name,
    cupVisits: item.cupVisits,
    cupBookings: item.cupBookings,
    firstCupDate: item.firstCupDate,
    dates: item.dates,
    bookingDates: item.bookingDates || item.dates || [],
    segment: item.segment,
    awards: item.awards || [],
    achievements: item.achievements || {
      wins: 0,
      prizePlaces: 0,
      bestPlace: null,
      hasJudging: false,
      bestJudgingPlace: null,
      bestJudgingTotal: null
    },
    judging: item.judging || null
  }));
}

const CUP3_JUDGES = [
  'Анастасия Кадушкина и Денис',
  'Евгений Шашин и Рамиль',
  'Илья Стрельник и Арсен'
];

const CUP3_JUDGE_PROFILES = [
  {
    id: 'cup-3-judge-1',
    seasonId: 'cup-3',
    name: 'Анастасия Кадушкина и Денис',
    role: 'Судейская пара Cup #3',
    bio: 'Информация о судье будет добавлена.'
  },
  {
    id: 'cup-3-judge-2',
    seasonId: 'cup-3',
    name: 'Евгений Шашин и Рамиль',
    role: 'Судейская пара Cup #3',
    bio: 'Информация о судье будет добавлена.'
  },
  {
    id: 'cup-3-judge-3',
    seasonId: 'cup-3',
    name: 'Илья Стрельник и Арсен',
    role: 'Судейская пара Cup #3',
    bio: 'Информация о судье будет добавлена.'
  }
];

const CUP3_JUDGE_GROUPS = {
  group1: {
    label: 'Группа 1',
    judgeNames: ['Анастасия Кадушкина', 'Евгений Шашин', 'Стрельчик Илья'],
    participants: [
      'Екатерина Виноградова',
      'Юлия Поастамакина',
      'Яна Завальнюк',
      'Дмитрий Митяев',
      'Александр Иванов',
      'Валерия Батыршина',
      'Ангелина Баева',
      'Мария Марченко',
      'Андрей Руснак',
      'Полина Панферова',
      'Дмитрий Юрченко',
      'Евгения Пашнина',
      'Анна Рожкова',
      'Амина Серегина'
    ]
  },
  group2: {
    label: 'Группа 2',
    judgeNames: ['Денис Ефремов', 'Рамиль Рзаев', 'Арсен Эмирян'],
    participants: [
      'Дарья Дуганова',
      'Андрей Огнихин',
      'Александр Лякишев',
      'Данила Макаров',
      'Дмитрий Безсметрный',
      'Артемий Астанин',
      'Егор Запивалов',
      'Яков Смирнов',
      'Кирилл Алексеев',
      'Дарья Пляшкевич',
      'Андрей Шевелëв',
      'Варвара Чилиевич'
    ]
  }
};

function normalizeCup3JudgeName(value) {
  return String(value || '').trim().toLowerCase().replace(/ё/g, 'е');
}

function cup3JudgeGroupForParticipant(name) {
  const normalizedName = normalizeCup3JudgeName(name);
  return Object.values(CUP3_JUDGE_GROUPS).find((group) => {
    return group.participants.some((participant) => normalizeCup3JudgeName(participant) === normalizedName);
  }) || null;
}

function withCup3JudgeData(item) {
  const group = cup3JudgeGroupForParticipant(item.name);
  if (!group) return item;
  return {
    ...item,
    judgeGroup: group.label,
    judgeNames: group.judgeNames
  };
}

const CUP3_WINNERS = [
  {
    id: 'cup-3-winner-1',
    place: 1,
    name: 'Данила Макаров',
    project: 'Inspiro',
    total: 74,
    judgeScores: [26, 25, 23],
    drink: {
      title: 'Название напитка добавить',
      presentation: 'Добавить описание подачи, идею напитка и фото с чемпионата.',
      photos: []
    },
    criteria: [
      { label: 'Презентация', value: 4.2 },
      { label: 'Визуальная подача', value: 4.5 },
      { label: 'Вкус', value: 3.8 },
      { label: 'Баланс', value: 3.7 },
      { label: 'Креативность', value: 4.8 },
      { label: 'Общее впечатление', value: 3.7 }
    ]
  },
  {
    id: 'cup-3-winner-2',
    place: 2,
    name: 'Дмитрий Безсметрный',
    project: '',
    total: 66,
    judgeScores: [22, 22.5, 21.5],
    drink: {
      title: 'Название напитка добавить',
      presentation: 'Добавить описание подачи, идею напитка и фото с чемпионата.',
      photos: []
    },
    criteria: [
      { label: 'Презентация', value: 4 },
      { label: 'Визуальная подача', value: 5 },
      { label: 'Вкус', value: 2.5 },
      { label: 'Баланс', value: 2.2 },
      { label: 'Креативность', value: 4.5 },
      { label: 'Общее впечатление', value: 3.8 }
    ]
  },
  {
    id: 'cup-3-winner-3',
    place: 3,
    name: 'Анна Рожкова',
    project: 'Etlon Coffee',
    total: 65,
    judgeScores: [23.5, 23, 18.5],
    drink: {
      title: 'Название напитка добавить',
      presentation: 'Добавить описание подачи, идею напитка и фото с чемпионата.',
      photos: []
    },
    criteria: [
      { label: 'Презентация', value: 3.8 },
      { label: 'Визуальная подача', value: 3.3 },
      { label: 'Вкус', value: 4.2 },
      { label: 'Баланс', value: 3.5 },
      { label: 'Креативность', value: 3.5 },
      { label: 'Общее впечатление', value: 3.7 }
    ]
  }
].map(withCup3JudgeData);

const CUP3_RESULTS = [
  { place: 1, number: 18, name: 'Данила Макаров', project: 'Inspiro', judgeScores: [26, 25, 23], total: 74, status: 'Готово' },
  { place: 2, number: 4, name: 'Дмитрий Безсметрный', project: '', judgeScores: [22, 22.5, 21.5], total: 66, status: 'Готово' },
  { place: 3, number: 6, name: 'Анна Рожкова', project: 'Etlon Coffee', judgeScores: [23.5, 23, 18.5], total: 65, status: 'Готово' },
  { place: 4, number: 8, name: 'Яна Завальнюк', project: 'Сойка напела', judgeScores: [19, 22, 20], total: 61, status: 'Готово' },
  { place: 4, number: 23, name: 'Дмитрий Митяев', project: 'ODZU', judgeScores: [21, 20, 20], total: 61, status: 'Готово' },
  { place: 6, number: 3, name: 'Валерия Батыршина', project: 'Просвет', judgeScores: [20, 20, 20], total: 60, status: 'Готово' },
  { place: 7, number: 15, name: 'Евгения Пашнина', project: 'Rockets', judgeScores: [19, 19, 17.5], total: 55.5, status: 'Готово' },
  { place: 8, number: 7, name: 'Дарья Дуганова', project: 'ПроМоре', judgeScores: [17.5, 17, 18.5], total: 53, status: 'Готово', note: 'Дисквалификация' },
  { place: 8, number: 17, name: 'Варвара Чилиевич', project: 'Roast', judgeScores: [15.5, 18.5, 19], total: 53, status: 'Готово' },
  { place: 10, number: 25, name: 'Егор Запивалов', project: 'Barista Buro', judgeScores: [16, 15.5, 16.5], total: 48, status: 'Готово', note: 'Дисквалификация' },
  { place: 11, number: 21, name: 'Ангелина Баева', project: 'Surf Coffee', judgeScores: [15, 14.5, 15.5], total: 45, status: 'Готово', note: 'Дисквалификация' },
  { place: 12, number: 11, name: 'Полина Панферова', project: 'Coffee Workshop', judgeScores: [13, 13.5, 12], total: 38.5, status: 'Готово' },
  { place: 13, number: 20, name: 'Александр Лякишев', project: 'Mikale', judgeScores: [13, 12.5, 12], total: 37.5, status: 'Готово' },
  { place: 14, number: 9, name: 'Андрей Шевелëв', project: 'Cosmic latte', judgeScores: [11, 11, 9], total: 31, status: 'Готово' },
  { place: 15, number: 26, name: 'Мария Марченко', project: 'Smorodina', judgeScores: [11, 11.5, 7], total: 29.5, status: 'Готово' },
  { place: 16, number: 24, name: 'Артемий Астанин', project: 'My sweet dust', judgeScores: [8.5, 10.5, 9.5], total: 28.5, status: 'Готово' },
  { place: 17, number: 1, name: 'Яков Смирнов', project: 'Кофемания', judgeScores: [7.5, 9, 9.5], total: 26, status: 'Готово' },
  { place: 18, number: 19, name: 'Екатерина Виноградова', project: 'Ruma’s', judgeScores: [0.5, 2, 2], total: 4.5, status: 'Готово' },
  { place: 19, number: 28, name: 'Дмитрий Юрченко', project: 'кофейня Комод', judgeScores: [1, 1.5, 0.5], total: 3, status: 'Готово' },
  { place: 20, number: 10, name: 'Александр Иванов', project: 'Krakatau', judgeScores: [0.5, 1, -0.5], total: 1, status: 'Готово' },
  { place: null, number: 16, name: 'Федор Курганский', project: 'Ресторан Муссон', judgeScores: [0, 0, 0], total: 0, status: 'Не все оценки', note: 'Не пришёл' },
  { place: null, number: 22, name: 'Руслан Катков', project: 'Бар-Буфет «Молодежный»', judgeScores: [0, 0, 0], total: 0, status: 'Не все оценки', note: 'Не пришёл' },
  { place: null, number: 27, name: 'Андрей Руснак', project: 'Blue Hawaii Roast', judgeScores: [0, 0, 0], total: 0, status: 'Не все оценки', note: 'Не пришёл' },
  { place: 21, number: 13, name: 'Андрей Огнихин', project: 'Ava bistro', judgeScores: [-1.5, -1, -1], total: -3.5, status: 'Готово' },
  { place: 22, number: 5, name: 'Амина Серегина', project: 'One Price Coffee', judgeScores: [-5.5, -3.5, -6.5], total: -15.5, status: 'Готово' },
  { place: 23, number: 14, name: 'Юлия Поастамакина', project: 'Rockets', judgeScores: [-5, -10, -7], total: -22, status: 'Готово' },
  { place: 24, number: 2, name: 'Кирилл Алексеев', project: 'Алеф Трейд', judgeScores: [-9, -7, -6.5], total: -22.5, status: 'Готово' },
  { place: 25, number: 12, name: 'Дарья Пляшкевич', project: 'Lebo Professional', judgeScores: [-24.5, -23.5, -27], total: -75, status: 'Готово' }
].map(withCup3JudgeData);

const CUP3_JUDGING = {
  source: 'Судейские листы MBS MIXOLOGY CUP #3',
  participants: 28,
  ready: 25,
  remaining: 3,
  averageTotal: 28.1,
  bestTotal: 74,
  minTotal: -75,
  results: CUP3_RESULTS,
  topResults: CUP3_RESULTS.filter((item) => item.place).slice(0, 5)
};

const CUP3_PARTNER_PROFILES = [
  {
    id: 'cafestore',
    name: 'CafeStore',
    logo: 'https://static.tildacdn.com/tild6137-6163-4936-b161-333238313531/3ab92f63-0333-49b6-a.png',
    description: 'Партнёр MBS MIXOLOGY CUP #3.',
    provided: ['Вклад в призовой фонд нужно уточнить.'],
    source: 'Логотип взят из Tilda-страницы чемпионата.'
  },
  {
    id: 'mhw-3bomber',
    name: 'MHW-3Bomber',
    logo: 'https://static.tildacdn.com/tild3866-3661-4134-b462-356361356531/mhw-3bomber.jpg',
    description: 'Партнёр MBS MIXOLOGY CUP #3.',
    provided: ['Вклад в призовой фонд нужно уточнить.'],
    source: 'Логотип взят из Tilda-страницы чемпионата.'
  },
  {
    id: 'vkusov-lab',
    name: 'Вкусов Лаб',
    logo: 'https://static.tildacdn.com/tild3933-3138-4465-b235-396434623235/_404.svg',
    description: 'Партнёр MBS MIXOLOGY CUP #3.',
    provided: ['Вклад в призовой фонд нужно уточнить.'],
    source: 'Логотип взят из Tilda-страницы чемпионата.'
  },
  {
    id: 'drink-supply',
    name: 'DRINK SUPPLY',
    logo: 'https://static.tildacdn.com/tild6136-6337-4636-b539-336565646262/Asset_412.svg',
    description: 'Партнёр MBS MIXOLOGY CUP #3.',
    provided: ['Вклад в призовой фонд нужно уточнить.'],
    source: 'Логотип взят из Tilda-страницы чемпионата.'
  },
  {
    id: 'cocktail-design',
    name: 'Cocktail Design',
    logo: 'https://static.tildacdn.com/tild6631-6538-4639-a436-343435373363/Asset_413.svg',
    description: 'Партнёр MBS MIXOLOGY CUP #3 и поставщик барного инвентаря для призового фонда.',
    provided: [
      'Барные ложки Cocktail Design 41 см Monstera, 40 см Moon и 40 см Archie.',
      'Джиггер Aero 25/50 мл.',
      'Брелок Circle с гравировкой логотипа.'
    ],
    source: 'Призы взяты из Tilda-блока чемпионата.'
  },
  {
    id: 'tasty-coffee',
    name: 'Tasty Coffee',
    logo: 'https://static.tildacdn.com/tild3739-3164-4563-b934-343865663438/TASTY_NEW.svg',
    description: 'Партнёр MBS MIXOLOGY CUP #3.',
    provided: ['Вклад в призовой фонд нужно уточнить.'],
    source: 'Логотип взят из Tilda-страницы чемпионата.'
  },
  {
    id: 'incava',
    name: 'Инкава',
    logo: 'https://static.tildacdn.com/tild6535-3931-4062-a666-353063386539/Asset_2.svg',
    description: 'Партнёр MBS MIXOLOGY CUP #3.',
    provided: ['Вклад в призовой фонд нужно уточнить.'],
    source: 'Логотип взят из Tilda-страницы чемпионата.'
  },
  {
    id: 'gourmet-style',
    name: 'Gourmet Style',
    logo: 'https://static.tildacdn.com/tild3330-6131-4433-b465-393736356663/_406.svg',
    description: 'Партнёр MBS MIXOLOGY CUP #3.',
    provided: ['Вклад в призовой фонд нужно уточнить.'],
    source: 'Логотип взят из Tilda-страницы чемпионата.'
  },
  {
    id: 'liu',
    name: '[ЛЬЮ]',
    logo: 'https://static.tildacdn.com/tild6466-6136-4937-b232-616231313331/Asset_415.svg',
    description: 'Партнёр MBS MIXOLOGY CUP #3.',
    provided: ['Вклад в призовой фонд нужно уточнить.'],
    source: 'Логотип взят из Tilda-страницы чемпионата.'
  },
  {
    id: 'rockets-coffee',
    name: 'rockets.coffee',
    logo: 'https://static.tildacdn.com/tild3434-3065-4463-b065-656365653938/_407.svg',
    description: 'Партнёр MBS MIXOLOGY CUP #3.',
    provided: ['Вклад в призовой фонд нужно уточнить.'],
    source: 'Логотип взят из Tilda-страницы чемпионата.'
  },
  {
    id: 'the-welder-catherine',
    name: 'THE WELDER CATHERINE',
    logo: 'https://static.tildacdn.com/tild3236-3234-4135-b665-393362396565/wlSQBFXNf2s.jpg',
    description: 'Партнёр MBS MIXOLOGY CUP #3.',
    provided: ['Вклад в призовой фонд нужно уточнить.'],
    source: 'Логотип взят из Tilda-страницы чемпионата.'
  }
];

const MIXOLOGY_ALBUMS = [
  {
    seasonId: 'cup-1',
    sourceId: '6',
    title: 'MBS Mixology CUP 2025',
    date: '2025-06-07',
    dateLabel: '7 июня 2025',
    coverUrl: 'https://lh3.googleusercontent.com/d/1_Vu_I_ZtVB0XFsmlJP_cZ0GcHSGrDPkq',
    photosCount: 262,
    description: 'Первый чемпионат по безалкогольной миксологии MBS Mixology Cup 2025. В публичном фотоархиве указаны победители: Данила Макаров, Ульяна Ашер, Валерия Батыршина.',
    winnersText: 'Данила Макаров, Ульяна Ашер, Валерия Батыршина',
    note: '',
    previewPhotos: [
      'https://lh3.googleusercontent.com/d/1InxZBy1VGbYcI5aXVzIguDqAhrfqueSO',
      'https://lh3.googleusercontent.com/d/1fuJ1GsdrUZoXqWK13q6e9MjRK6Isv6T_',
      'https://lh3.googleusercontent.com/d/1Y_42QAiv8cYAMf-fXFhq4s4FcbAHGOv0',
      'https://lh3.googleusercontent.com/d/1Zzfq0ufdPAZROPLEJI6oG_JMViy0MUHk'
    ]
  },
  {
    seasonId: 'cup-2',
    sourceId: '7',
    title: 'MBS Mixology CUP 2026',
    date: '2026-01-18',
    dateLabel: '18 января 2026',
    coverUrl: 'https://lh3.googleusercontent.com/d/1nsA5TfP_6l4qTXF0eoSC2c2WyqDWaDK5',
    photosCount: 543,
    description: 'Второй чемпионат по миксологии MBS Mixology Cup 2026. В публичном фотоархиве указаны победители: Ульяна Ашер, Дмитрий Безсметрный, Артём Янин.',
    winnersText: 'Ульяна Ашер, Дмитрий Безсметрный, Артём Янин',
    note: '',
    previewPhotos: [
      'https://lh3.googleusercontent.com/d/1iStTdmDuloh6W78qU4QnTGbk2MRI33Gs',
      'https://lh3.googleusercontent.com/d/1bDCwsKym5dHZ1huNKS8fZ3_sF44zQMK3',
      'https://lh3.googleusercontent.com/d/1SlcLx3AF6n0J7MWVbHeJHynBFits-eUN',
      'https://lh3.googleusercontent.com/d/1Ksk6Pcn8G5Rwy6CH10yE3GTN4_sopTsD'
    ]
  }
];

function mixologyAlbumForSeason(seasonId) {
  return MIXOLOGY_ALBUMS.find((album) => album.seasonId === seasonId) || null;
}

function nameTokens(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^a-zа-я0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function namesMatch(left, right) {
  const leftTokens = nameTokens(left);
  const rightTokens = nameTokens(right);
  if (!leftTokens.length || !rightTokens.length) return false;
  if (leftTokens.length < 2 || rightTokens.length < 2) {
    return leftTokens.join(' ') === rightTokens.join(' ');
  }
  const shorter = leftTokens.length <= rightTokens.length ? leftTokens : rightTokens;
  const longer = leftTokens.length > rightTokens.length ? leftTokens : rightTokens;
  return shorter.every((token) => longer.includes(token));
}

function findResultForParticipant(participantName, results) {
  return results.find((result) => namesMatch(participantName, result.name)) || null;
}

function collectAwards(participantName, seasons) {
  const awards = [];
  seasons.forEach((season) => {
    (season.winners || []).forEach((winner) => {
      if (winner && typeof winner === 'object' && namesMatch(participantName, winner.name)) {
        awards.push({
          seasonId: season.id,
          seasonTitle: season.title,
          place: winner.place,
          total: winner.total
        });
      }
    });
  });
  return awards;
}

function enrichParticipantsWithPublicResults(participants, seasons) {
  return participants.map((participant) => {
    const awards = collectAwards(participant.name, seasons);
    const judging = findResultForParticipant(participant.name, CUP3_RESULTS);
    const wins = awards.filter((award) => award.place === 1).length;
    const prizePlaces = awards.filter((award) => award.place >= 1 && award.place <= 3).length;
    return {
      ...participant,
      awards,
      achievements: {
        wins,
        prizePlaces,
        bestPlace: awards.length ? Math.min(...awards.map((award) => award.place)) : null,
        hasJudging: Boolean(judging && judging.status === 'Готово'),
        bestJudgingPlace: judging && judging.place ? judging.place : null,
        bestJudgingTotal: judging ? judging.total : null
      },
      judging: judging ? {
        seasonId: 'cup-3',
        place: judging.place,
        project: judging.project,
        total: judging.total,
        status: judging.status,
        note: judging.note || '',
        judgeGroup: judging.judgeGroup || '',
        judgeNames: judging.judgeNames || []
      } : null
    };
  });
}

function buildData(participants) {
  const seasonsBase = [
    {
      id: 'cup-1',
      number: 1,
      title: 'MBS MIXOLOGY CUP #1',
      date: '2025-06-07',
      time: '10:00',
      short: 'Первый сезон, с которого началась история чемпионата.',
      winners: ['добавить победителя', 'добавить 2 место', 'добавить 3 место'],
      judges: ['добавить состав судей'],
      prizes: ['добавить призовой фонд'],
      partners: ['добавить партнёров'],
      album: 'публичный фотоальбом подключён',
      gallery: mixologyAlbumForSeason('cup-1')
    },
    {
      id: 'cup-2',
      number: 2,
      title: 'MBS MIXOLOGY CUP #2',
      date: '2026-01-18',
      time: '11:00',
      short: 'Второй сезон расширил комьюнити и вернул часть участников первого Cup.',
      winners: ['добавить победителя', 'добавить 2 место', 'добавить 3 место'],
      judges: ['добавить состав судей'],
      prizes: ['добавить призовой фонд'],
      partners: ['добавить партнёров'],
      album: 'публичный фотоальбом подключён',
      gallery: mixologyAlbumForSeason('cup-2')
    },
    {
      id: 'cup-3',
      number: 3,
      title: 'MBS MIXOLOGY CUP #3',
      date: '2026-06-03',
      time: '10:00',
      short: 'Третий сезон с регламентом, обязательным продуктом и партнёрами чемпионата.',
      winners: CUP3_WINNERS,
      judges: CUP3_JUDGES,
      prizes: [
        'Барный инвентарь Cocktail Design',
        'Каппинговые ложки',
        'Яркие лоты под фильтр',
        'Шопперы, футболки, стикеры и подарочные боксы',
        'Набор дрипов Drip Mix',
        'Наборы пробников и приятные бонусы'
      ],
      partners: CUP3_PARTNER_PROFILES,
      album: 'добавить фото сезона',
      gallery: mixologyAlbumForSeason('cup-3'),
      judging: CUP3_JUDGING
    }
  ];

  const seasons = seasonsBase.map((season) => ({
    ...season,
    booked: bookingCount(participants, season.date),
    visited: statusCount(participants, season.date, 'visited'),
    noShow: statusCount(participants, season.date, 'no_show'),
    participants: seasonParticipants(participants, season.date)
  }));
  const enrichedParticipants = enrichParticipantsWithPublicResults(participants, seasons);

  return {
    generatedAt: new Date().toISOString(),
    publicDataUrl: PUBLIC_DATA_URL,
    judgeProfiles: CUP3_JUDGE_PROFILES,
    seasons,
    participants: stripPrivateRuntimeFields(enrichedParticipants),
    stats: {
      seasons: seasons.length,
      uniqueParticipants: participants.length,
      multiCup: participants.filter((item) => item.cupVisits >= 2).length,
      bookedWithoutActiveCup: participants.filter((item) => item.cupVisits === 0 && item.cupBookings > 0).length
    }
  };
}

function html(data) {
  const dataJson = JSON.stringify({
    generatedAt: data.generatedAt,
    gallerySourceUrl: CHAMPIONSHIPS_GALLERY_URL,
    judgeProfiles: data.judgeProfiles,
    seasons: data.seasons,
    participants: data.participants,
    stats: data.stats
  });

  return `<!-- ============================================================
  HOSTED TILDA BLOCK — MBS MIXOLOGY CUP
  Public data future endpoint: ${PUBLIC_DATA_URL}
  Current mode: static safe data embedded from prepared public report
============================================================ -->

<style>
  @import url('https://fonts.googleapis.com/css2?family=Mulish:wght@400;500;600;700;800;900&display=swap');

  .mbs-mixology-cup {
    --mbs-green-dark: #417033;
    --mbs-green: #4F883E;
    --mbs-green-light: #B6D8AB;
    --mbs-bg-green: #E7F2E3;
    --mbs-red: #CC2841;
    --mbs-red-soft: #D83D54;
    --mbs-pink: #F8DDE1;
    --mbs-bg: #F5F5F5;
    --mbs-black: #1F1F1F;
    --mbs-gray: #555555;
    --mbs-white: #FFFFFF;
    --mbs-line: #DAE5D5;
    font-family: 'Mulish', Arial, sans-serif;
    color: var(--mbs-black);
    background: var(--mbs-white);
  }
  .mbs-mixology-cup * { box-sizing: border-box; }
  .mbs-mixology-cup a { text-decoration: none !important; color: inherit; }
  .mbs-mixology-cup button,
  .mbs-mixology-cup input,
  .mbs-mixology-cup select { font: inherit; }
  .mbs-mixology-cup__wrap {
    width: min(1100px, calc(100% - 40px));
    margin: 0 auto;
  }
  .mbs-mixology-cup__label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 14px;
    padding: 7px 16px;
    border-radius: 999px;
    background: rgba(231, 242, 227, .95);
    color: var(--mbs-green-dark);
    font-size: 13px;
    line-height: 1;
    font-weight: 900;
  }
  .mbs-mixology-cup__title {
    margin: 0 0 10px;
    color: var(--mbs-black);
    font-size: 34px;
    line-height: 1;
    font-weight: 900;
    letter-spacing: 0;
  }
  .mbs-mixology-cup__sub {
    max-width: 760px;
    margin: 0 0 34px;
    color: var(--mbs-gray);
    font-size: 16px;
    line-height: 1.55;
    font-weight: 500;
  }
  .mbs-mixology-cup__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 58px;
    padding: 0 32px;
    border: 0;
    border-radius: 999px;
    background: var(--mbs-red);
    color: #fff !important;
    font-size: 16px;
    font-weight: 900;
    line-height: 1;
    cursor: pointer;
    text-decoration: none !important;
    transition: background .2s, transform .2s;
    white-space: nowrap;
  }
  .mbs-mixology-cup__btn:hover { background: var(--mbs-red-soft); transform: translateY(-1px); }
  .mbs-mixology-cup__btn-secondary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 58px;
    padding: 0 30px;
    border: 2px solid var(--mbs-green-dark);
    border-radius: 999px;
    background: transparent;
    color: var(--mbs-green-dark) !important;
    font-size: 16px;
    font-weight: 900;
    text-decoration: none !important;
    transition: background .2s, color .2s, transform .2s;
    white-space: nowrap;
  }
  .mbs-mixology-cup__btn-secondary:hover {
    background: var(--mbs-green-dark);
    color: #fff !important;
    transform: translateY(-1px);
  }
  .mbs-mixology-cup-hero {
    padding: 48px 20px;
    background: #fff;
  }
  .mbs-mixology-cup-hero__card {
    position: relative;
    width: min(1320px, 100%);
    min-height: 620px;
    margin: 0 auto;
    padding: 72px 76px;
    border-radius: 28px;
    background:
      linear-gradient(90deg, rgba(255,255,255,.98) 0%, rgba(255,255,255,.93) 47%, rgba(231,242,227,.78) 100%),
      linear-gradient(135deg, #F7F7F7 0%, #FFFFFF 58%, #F8DDE1 100%);
    overflow: hidden;
    isolation: isolate;
  }
  .mbs-mixology-cup-hero__card::after {
    content: '';
    position: absolute;
    right: -90px;
    bottom: -120px;
    width: 430px;
    height: 430px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(204, 40, 65, .13), rgba(65, 112, 51, .05) 55%, transparent 70%);
    pointer-events: none;
  }
  .mbs-mixology-cup-hero__grid {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: minmax(0, 1.25fr) minmax(320px, .75fr);
    gap: 52px;
    align-items: center;
    min-height: 476px;
  }
  .mbs-mixology-cup-hero__kicker {
    display: inline-flex;
    margin: 0 0 18px;
    padding: 8px 16px;
    border-radius: 999px;
    background: var(--mbs-bg-green);
    color: var(--mbs-green-dark);
    font-size: 13px;
    font-weight: 900;
  }
  .mbs-mixology-cup-hero h1 {
    max-width: 760px;
    margin: 0;
    color: var(--mbs-black);
    font-size: 82px;
    line-height: .92;
    font-weight: 900;
    letter-spacing: 0;
  }
  .mbs-mixology-cup-hero__lead {
    max-width: 720px;
    margin: 22px 0 0;
    color: var(--mbs-black);
    font-size: 27px;
    line-height: 1.27;
    font-weight: 500;
    letter-spacing: 0;
  }
  .mbs-mixology-cup-hero__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 34px;
  }
  .mbs-mixology-cup-hero__panel {
    display: grid;
    gap: 10px;
    align-self: center;
  }
  .mbs-mixology-cup-hero__stat {
    min-height: 76px;
    padding: 14px 16px;
    border-radius: 16px;
    background: rgba(255, 255, 255, .9);
    border: 1px solid rgba(65, 112, 51, .12);
    box-shadow: 0 14px 34px rgba(31, 31, 31, .08);
  }
  .mbs-mixology-cup-hero__stat span {
    display: block;
    margin-bottom: 6px;
    color: var(--mbs-gray);
    font-size: 12px;
    font-weight: 800;
  }
  .mbs-mixology-cup-hero__stat strong {
    display: block;
    color: var(--mbs-black);
    font-size: 27px;
    line-height: 1;
    font-weight: 900;
  }
  .mbs-mixology-cup-info,
  .mbs-mixology-cup-seasons,
  .mbs-mixology-cup-rules,
  .mbs-mixology-cup-community,
  .mbs-mixology-cup-season-detail,
  .mbs-mixology-cup-archive-tools,
  .mbs-mixology-cup-final {
    padding: 90px 20px;
  }
  .mbs-mixology-cup-info,
  .mbs-mixology-cup-community,
  .mbs-mixology-cup-archive-tools { background: var(--mbs-bg); }
  .mbs-mixology-cup-seasons,
  .mbs-mixology-cup-rules,
  .mbs-mixology-cup-season-detail,
  .mbs-mixology-cup-final { background: #fff; }
  .mbs-mixology-cup-info__grid,
  .mbs-mixology-cup-seasons__grid,
  .mbs-mixology-cup-tools__grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
  }
  .mbs-mixology-cup-card {
    min-height: 100%;
    padding: 26px;
    border-radius: 20px;
    background: #fff;
    border: 1px solid rgba(65, 112, 51, .08);
  }
  .mbs-mixology-cup-card--green { background: var(--mbs-bg-green); }
  .mbs-mixology-cup-card h3 {
    margin: 0 0 10px;
    color: var(--mbs-black);
    font-size: 19px;
    line-height: 1.2;
    font-weight: 900;
  }
  .mbs-mixology-cup-card p {
    margin: 0;
    color: var(--mbs-gray);
    font-size: 15px;
    line-height: 1.5;
    font-weight: 600;
  }
  .mbs-mixology-cup-season-card {
    display: flex;
    flex-direction: column;
    min-height: 100%;
    padding: 26px;
    border-radius: 20px;
    background: #fff;
    border: 1px solid var(--mbs-line);
    box-shadow: 0 10px 28px rgba(65, 112, 51, .06);
  }
  .mbs-mixology-cup-season-card__top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 18px;
  }
  .mbs-mixology-cup-season-card h3 {
    margin: 0;
    font-size: 24px;
    line-height: 1.05;
    font-weight: 900;
  }
  .mbs-mixology-cup-season-card__date {
    color: var(--mbs-green-dark);
    font-size: 13px;
    font-weight: 900;
    white-space: nowrap;
  }
  .mbs-mixology-cup-season-card__stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin: 18px 0;
  }
  .mbs-mixology-cup-mini-stat {
    padding: 12px;
    border-radius: 14px;
    background: var(--mbs-bg);
  }
  .mbs-mixology-cup-mini-stat strong {
    display: block;
    color: var(--mbs-black);
    font-size: 22px;
    line-height: 1;
    font-weight: 900;
  }
  .mbs-mixology-cup-mini-stat span {
    display: block;
    margin-top: 5px;
    color: var(--mbs-gray);
    font-size: 11px;
    line-height: 1.2;
    font-weight: 800;
  }
  .mbs-mixology-cup-season-card__meta {
    display: grid;
    gap: 8px;
    margin-top: auto;
    color: var(--mbs-gray);
    font-size: 13px;
    line-height: 1.45;
    font-weight: 600;
  }
  .mbs-mixology-cup-season-card__meta b { color: var(--mbs-black); font-weight: 900; }
  .mbs-mixology-cup-season-card__link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 42px;
    margin-top: 18px;
    padding: 0 18px;
    border-radius: 999px;
    background: var(--mbs-green);
    color: #fff !important;
    font-size: 14px;
    font-weight: 900;
    text-decoration: none !important;
  }
  .mbs-mixology-cup-rules__box {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 24px;
    align-items: center;
    padding: 34px;
    border-radius: 24px;
    background: var(--mbs-bg-green);
  }
  .mbs-mixology-cup-rules__box p {
    max-width: 760px;
    margin: 0;
    color: var(--mbs-gray);
    font-size: 16px;
    line-height: 1.55;
    font-weight: 600;
  }
  .mbs-mixology-cup-rules__grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin-top: 18px;
  }
  .mbs-mixology-cup-rule {
    padding: 18px;
    border-radius: 16px;
    background: #fff;
    border: 1px solid rgba(65, 112, 51, .12);
  }
  .mbs-mixology-cup-rule strong {
    display: block;
    color: var(--mbs-green-dark);
    font-size: 28px;
    line-height: 1;
    font-weight: 900;
  }
  .mbs-mixology-cup-rule span {
    display: block;
    margin-top: 8px;
    color: var(--mbs-gray);
    font-size: 13px;
    line-height: 1.35;
    font-weight: 700;
  }
  .mbs-mixology-cup-community__tools {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 18px;
  }
  .mbs-mixology-cup-community__tools input,
  .mbs-mixology-cup-community__tools select {
    min-height: 46px;
    padding: 0 14px;
    border: 1px solid var(--mbs-line);
    border-radius: 14px;
    background: #fff;
    color: var(--mbs-black);
    font-size: 14px;
    font-weight: 800;
    outline: none;
  }
  .mbs-mixology-cup-community__tools input {
    width: min(100%, 340px);
  }
  .mbs-mixology-cup-community__tools input:focus,
  .mbs-mixology-cup-community__tools select:focus {
    border-color: var(--mbs-green);
    box-shadow: 0 0 0 3px rgba(79, 136, 62, .12);
  }
  .mbs-mixology-cup-table-wrap {
    overflow: auto;
    border-radius: 20px;
    background: #fff;
    border: 1px solid var(--mbs-line);
  }
  .mbs-mixology-cup-table {
    width: 100%;
    min-width: 860px;
    border-collapse: collapse;
  }
  .mbs-mixology-cup-table th,
  .mbs-mixology-cup-table td {
    padding: 15px 16px;
    border-bottom: 1px solid #E8EEE5;
    text-align: left;
    vertical-align: middle;
    font-size: 14px;
  }
  .mbs-mixology-cup-table th {
    position: sticky;
    top: 0;
    z-index: 1;
    background: #F9FBF8;
    color: var(--mbs-gray);
    font-size: 12px;
    font-weight: 900;
    text-transform: uppercase;
  }
  .mbs-mixology-cup-table tr:last-child td { border-bottom: 0; }
  .mbs-mixology-cup-rank {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border-radius: 999px;
    background: var(--mbs-bg-green);
    color: var(--mbs-green-dark);
    font-weight: 900;
  }
  .mbs-mixology-cup-name { font-weight: 900; color: var(--mbs-black); }
  .mbs-mixology-cup-count {
    color: var(--mbs-red);
    font-size: 20px;
    line-height: 1;
    font-weight: 900;
  }
  .mbs-mixology-cup-years,
  .mbs-mixology-cup-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .mbs-mixology-cup-pill {
    display: inline-flex;
    align-items: center;
    min-height: 26px;
    padding: 0 10px;
    border-radius: 999px;
    background: var(--mbs-bg-green);
    color: var(--mbs-green-dark);
    font-size: 12px;
    font-weight: 900;
  }
  .mbs-mixology-cup-pill.is-red {
    background: var(--mbs-pink);
    color: var(--mbs-red);
  }
  .mbs-mixology-cup-empty {
    padding: 36px 22px;
    color: var(--mbs-gray);
    font-size: 15px;
    font-weight: 800;
    text-align: center;
  }
  .mbs-mixology-cup-season-detail__item {
    margin-top: 16px;
    padding: 28px;
    border-radius: 22px;
    background: var(--mbs-bg);
  }
  .mbs-mixology-cup-season-detail__head {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 16px;
    align-items: start;
    margin-bottom: 22px;
  }
  .mbs-mixology-cup-season-detail__head h3 {
    margin: 0 0 8px;
    font-size: 28px;
    line-height: 1;
    font-weight: 900;
  }
  .mbs-mixology-cup-season-detail__head p {
    margin: 0;
    color: var(--mbs-gray);
    font-size: 15px;
    line-height: 1.5;
    font-weight: 600;
  }
  .mbs-mixology-cup-season-detail__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }
  .mbs-mixology-cup-panel {
    padding: 20px;
    border-radius: 18px;
    background: #fff;
    border: 1px solid rgba(65, 112, 51, .08);
  }
  .mbs-mixology-cup-panel h4 {
    margin: 0 0 12px;
    font-size: 16px;
    line-height: 1.2;
    font-weight: 900;
  }
  .mbs-mixology-cup-panel ul {
    margin: 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: 8px;
  }
  .mbs-mixology-cup-panel li {
    color: var(--mbs-gray);
    font-size: 14px;
    line-height: 1.4;
    font-weight: 700;
  }
  .mbs-mixology-cup-panel li::before {
    content: '';
    display: inline-block;
    width: 7px;
    height: 7px;
    margin-right: 8px;
    border-radius: 999px;
    background: var(--mbs-green);
    vertical-align: 1px;
  }
  .mbs-mixology-cup-season-tools {
    display: grid;
    gap: 10px;
    margin-bottom: 12px;
  }
  .mbs-mixology-cup-season-tools input {
    width: 100%;
    min-height: 42px;
    padding: 0 14px;
    border: 1px solid rgba(65, 112, 51, .16);
    border-radius: 14px;
    background: var(--mbs-bg);
    color: var(--mbs-black);
    font-size: 14px;
    font-weight: 700;
    outline: none;
  }
  .mbs-mixology-cup-filter-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .mbs-mixology-cup-filter-btn {
    min-height: 32px;
    padding: 0 11px;
    border: 1px solid rgba(65, 112, 51, .14);
    border-radius: 999px;
    background: #fff;
    color: var(--mbs-gray);
    font-size: 12px;
    font-weight: 900;
    cursor: pointer;
    transition: background .2s, color .2s, border-color .2s;
  }
  .mbs-mixology-cup-filter-btn.is-active {
    border-color: transparent;
    background: var(--mbs-bg-green);
    color: var(--mbs-green-dark);
  }
  .mbs-mixology-cup-season-participants {
    display: grid;
    gap: 8px;
    min-height: 430px;
    max-height: 430px;
    align-content: start;
    overflow: auto;
    padding-right: 4px;
  }
  .mbs-mixology-cup-season-participant-panel {
    min-height: 650px;
    display: grid;
    grid-template-rows: auto 1fr;
  }
  .mbs-mixology-cup-season-participant {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 10px;
    align-items: center;
    width: 100%;
    padding: 11px 12px;
    border: 1px solid rgba(65, 112, 51, .1);
    border-radius: 14px;
    background: var(--mbs-bg);
    color: var(--mbs-black);
    text-align: left;
    cursor: pointer;
  }
  .mbs-mixology-cup-season-participant:hover,
  .mbs-mixology-cup-result-row:hover,
  .mbs-mixology-cup-judge-btn:hover {
    border-color: rgba(65, 112, 51, .32);
    box-shadow: 0 10px 22px rgba(31, 31, 31, .06);
  }
  .mbs-mixology-cup-season-participant__name {
    display: block;
    font-size: 14px;
    line-height: 1.2;
    font-weight: 900;
  }
  .mbs-mixology-cup-season-participant__meta {
    display: block;
    margin-top: 4px;
    color: var(--mbs-gray);
    font-size: 12px;
    line-height: 1.25;
    font-weight: 700;
  }
  .mbs-mixology-cup-season-participant__score {
    color: var(--mbs-green-dark);
    font-size: 18px;
    font-weight: 900;
    white-space: nowrap;
  }
  .mbs-mixology-cup-results-table {
    width: 100%;
    border-collapse: collapse;
  }
  .mbs-mixology-cup-results-table th,
  .mbs-mixology-cup-results-table td {
    padding: 9px 8px;
    border-top: 1px solid rgba(65, 112, 51, .1);
    font-size: 13px;
    text-align: left;
    vertical-align: middle;
  }
  .mbs-mixology-cup-results-table th {
    border-top: 0;
    color: var(--mbs-gray);
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
  }
  .mbs-mixology-cup-results-table td:last-child,
  .mbs-mixology-cup-results-table th:last-child {
    text-align: right;
  }
  .mbs-mixology-cup-result-row {
    cursor: pointer;
  }
  .mbs-mixology-cup-judge-list,
  .mbs-mixology-cup-partner-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .mbs-mixology-cup-partner-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .mbs-mixology-cup-judge-btn,
  .mbs-mixology-cup-partner-card {
    display: inline-flex;
    align-items: center;
    min-height: 38px;
    padding: 0 12px;
    border: 1px solid rgba(65, 112, 51, .14);
    border-radius: 14px;
    background: var(--mbs-bg);
    color: var(--mbs-black);
    font-size: 13px;
    font-weight: 900;
  }
  .mbs-mixology-cup-judge-btn {
    cursor: pointer;
  }
  .mbs-mixology-cup-partner-logo {
    position: relative;
    display: grid;
    grid-template-rows: 1fr auto;
    place-items: center;
    gap: 10px;
    min-height: 82px;
    padding: 14px;
    border: 1px solid rgba(65, 112, 51, .18);
    border-radius: 14px;
    background: #fff;
    cursor: pointer;
    overflow: hidden;
    transition: border-color .2s, box-shadow .2s, transform .2s;
  }
  .mbs-mixology-cup-partner-logo::before {
    content: '';
    position: absolute;
    inset: 0 0 auto;
    height: 4px;
    background: linear-gradient(90deg, var(--mbs-green-dark), var(--mbs-green-light));
    opacity: .75;
  }
  .mbs-mixology-cup-partner-logo:hover {
    border-color: rgba(65, 112, 51, .34);
    box-shadow: 0 12px 24px rgba(65, 112, 51, .1);
    transform: translateY(-1px);
  }
  .mbs-mixology-cup-partner-logo img {
    display: block;
    width: 100%;
    max-width: 150px;
    max-height: 48px;
    object-fit: contain;
    filter: grayscale(1) contrast(1.05);
  }
  .mbs-mixology-cup-partner-logo:hover img {
    filter: grayscale(0);
  }
  .mbs-mixology-cup-partner-logo__name {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    max-width: 100%;
    padding: 5px 9px;
    border-radius: 999px;
    background: var(--mbs-bg-green);
    color: var(--mbs-green-dark);
    font-size: 10px;
    line-height: 1;
    font-weight: 900;
    text-transform: uppercase;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .mbs-mixology-cup-partner-modal-logo {
    display: grid;
    place-items: center;
    min-height: 180px;
    border-radius: 16px;
    background: #fff;
    border: 1px solid rgba(65, 112, 51, .14);
  }
  .mbs-mixology-cup-partner-modal-logo img {
    width: min(260px, 82%);
    max-height: 110px;
    object-fit: contain;
    filter: grayscale(1) contrast(1.05);
  }
  .mbs-mixology-cup-partner-modal-note {
    display: inline-flex;
    align-items: center;
    margin-top: 12px;
    padding: 7px 11px;
    border-radius: 999px;
    background: var(--mbs-bg-green);
    color: var(--mbs-green-dark);
    font-size: 12px;
    line-height: 1;
    font-weight: 900;
  }
  .mbs-mixology-cup-prize-box {
    margin-top: 12px;
    padding: 12px;
    border-radius: 14px;
    background: var(--mbs-bg);
    color: var(--mbs-gray);
    font-size: 13px;
    line-height: 1.4;
    font-weight: 800;
  }
  .mbs-mixology-cup-season-album {
    display: grid;
    gap: 12px;
  }
  .mbs-mixology-cup-season-album__cover {
    position: relative;
    min-height: 190px;
    overflow: hidden;
    border: 0;
    border-radius: 16px;
    background: var(--mbs-bg);
    cursor: pointer;
  }
  .mbs-mixology-cup-season-album__cover img {
    width: 100%;
    height: 100%;
    min-height: 190px;
    object-fit: cover;
    display: block;
  }
  .mbs-mixology-cup-season-album__cover span {
    position: absolute;
    right: 12px;
    bottom: 12px;
    padding: 7px 11px;
    border-radius: 999px;
    background: rgba(31, 31, 31, .72);
    color: #fff;
    font-size: 12px;
    font-weight: 900;
  }
  .mbs-mixology-cup-season-album__placeholder {
    min-height: 190px;
    padding: 18px;
    border-radius: 16px;
    background: var(--mbs-bg);
    color: var(--mbs-gray);
    font-size: 14px;
    line-height: 1.45;
    font-weight: 800;
    display: grid;
    align-content: center;
  }
  .mbs-mixology-cup-season-album__thumbs {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 6px;
  }
  .mbs-mixology-cup-season-album__thumbs img {
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
    border-radius: 10px;
    display: block;
  }
  .mbs-mixology-cup-hidden { display: none !important; }
  .mbs-mixology-cup-winners {
    display: grid;
    gap: 10px;
  }
  .mbs-mixology-cup-winner-card {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: 12px;
    align-items: center;
    width: 100%;
    min-height: 70px;
    padding: 12px;
    border: 1px solid rgba(65, 112, 51, .16);
    border-radius: 16px;
    background: #fff;
    color: var(--mbs-black);
    text-align: left;
    cursor: pointer;
    transition: border-color .2s, box-shadow .2s, transform .2s;
  }
  .mbs-mixology-cup-winner-card:hover {
    border-color: rgba(204, 40, 65, .38);
    box-shadow: 0 12px 26px rgba(31, 31, 31, .08);
    transform: translateY(-1px);
  }
  .mbs-mixology-cup-winner-card__place {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    border-radius: 999px;
    background: var(--mbs-pink);
    color: var(--mbs-red);
    font-size: 18px;
    font-weight: 900;
  }
  .mbs-mixology-cup-winner-card__name {
    display: block;
    margin-bottom: 4px;
    font-size: 15px;
    line-height: 1.15;
    font-weight: 900;
  }
  .mbs-mixology-cup-winner-card__meta {
    display: block;
    color: var(--mbs-gray);
    font-size: 12px;
    line-height: 1.25;
    font-weight: 700;
  }
  .mbs-mixology-cup-winner-card__score {
    color: var(--mbs-green-dark);
    font-size: 22px;
    line-height: 1;
    font-weight: 900;
    white-space: nowrap;
  }
  .mbs-mixology-cup-judging-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
    margin-bottom: 14px;
  }
  .mbs-mixology-cup-judging-stat {
    padding: 12px;
    border-radius: 14px;
    background: var(--mbs-bg);
  }
  .mbs-mixology-cup-judging-stat strong {
    display: block;
    color: var(--mbs-black);
    font-size: 20px;
    line-height: 1;
    font-weight: 900;
  }
  .mbs-mixology-cup-judging-stat span {
    display: block;
    margin-top: 5px;
    color: var(--mbs-gray);
    font-size: 11px;
    line-height: 1.2;
    font-weight: 800;
  }
  .mbs-mixology-cup-results-list {
    margin: 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: 8px;
  }
  .mbs-mixology-cup-results-list li {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: 8px;
    align-items: center;
  }
  .mbs-mixology-cup-results-list li::before { display: none; }
  .mbs-mixology-cup-modal[hidden] { display: none; }
  .mbs-mixology-cup-modal {
    position: fixed;
    inset: 0;
    z-index: 99999;
    display: grid;
    place-items: center;
    padding: 18px;
  }
  .mbs-mixology-cup-modal__backdrop {
    position: absolute;
    inset: 0;
    background: rgba(31, 31, 31, .46);
  }
  .mbs-mixology-cup-modal__dialog {
    position: relative;
    width: min(860px, 100%);
    max-height: min(760px, calc(100vh - 36px));
    overflow: auto;
    padding: 28px;
    border-radius: 24px;
    background: #fff;
    box-shadow: 0 24px 90px rgba(31, 31, 31, .24);
  }
  .mbs-mixology-cup-modal__close {
    position: absolute;
    top: 14px;
    right: 14px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border: 0;
    border-radius: 999px;
    background: var(--mbs-bg);
    color: var(--mbs-black);
    font-size: 24px;
    line-height: 1;
    font-weight: 700;
    cursor: pointer;
  }
  .mbs-mixology-cup-modal__head {
    display: grid;
    gap: 8px;
    margin: 0 44px 20px 0;
  }
  .mbs-mixology-cup-modal__head h3 {
    margin: 0;
    font-size: 30px;
    line-height: 1;
    font-weight: 900;
  }
  .mbs-mixology-cup-modal__head p {
    margin: 0;
    color: var(--mbs-gray);
    font-size: 14px;
    line-height: 1.45;
    font-weight: 700;
  }
  .mbs-mixology-cup-modal__grid {
    display: grid;
    grid-template-columns: minmax(0, .95fr) minmax(0, 1.05fr);
    gap: 14px;
  }
  .mbs-mixology-cup-modal__panel {
    padding: 18px;
    border-radius: 18px;
    background: var(--mbs-bg);
  }
  .mbs-mixology-cup-modal__panel h4 {
    margin: 0 0 12px;
    font-size: 15px;
    line-height: 1.2;
    font-weight: 900;
  }
  .mbs-mixology-cup-modal__photo {
    display: grid;
    place-items: center;
    min-height: 210px;
    border-radius: 16px;
    border: 1px dashed rgba(65, 112, 51, .35);
    background: linear-gradient(135deg, rgba(231, 242, 227, .8), rgba(248, 221, 225, .55));
    color: var(--mbs-gray);
    font-size: 13px;
    line-height: 1.35;
    font-weight: 800;
    text-align: center;
  }
  .mbs-mixology-cup-modal__panel img {
    display: block;
    width: 100%;
    height: auto;
    border-radius: 16px;
  }
  .mbs-mixology-cup-score-list,
  .mbs-mixology-cup-criteria-list,
  .mbs-mixology-cup-achievement-list {
    display: grid;
    gap: 8px;
  }
  .mbs-mixology-cup-score-row,
  .mbs-mixology-cup-criteria-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    color: var(--mbs-gray);
    font-size: 13px;
    line-height: 1.25;
    font-weight: 800;
  }
  .mbs-mixology-cup-score-row strong,
  .mbs-mixology-cup-criteria-row strong {
    color: var(--mbs-black);
    font-size: 15px;
    font-weight: 900;
    white-space: nowrap;
  }
  .mbs-mixology-cup-achievement-card {
    display: grid;
    gap: 3px;
    padding: 10px 12px;
    border: 1px solid rgba(65, 112, 51, .1);
    border-radius: 14px;
    background: #fff;
  }
  .mbs-mixology-cup-achievement-card strong {
    color: var(--mbs-black);
    font-size: 13px;
    line-height: 1.2;
    font-weight: 900;
  }
  .mbs-mixology-cup-achievement-card span {
    color: var(--mbs-gray);
    font-size: 12px;
    line-height: 1.25;
    font-weight: 800;
  }
  .mbs-mixology-cup-photo-grid {
    display: grid;
    grid-template-columns: 1.25fr 1fr;
    gap: 14px;
  }
  .mbs-mixology-cup-photo {
    min-height: 170px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 18px;
    border-radius: 18px;
    border: 1px dashed rgba(65, 112, 51, .35);
    background: linear-gradient(135deg, rgba(231, 242, 227, .8), rgba(248, 221, 225, .55));
  }
  .mbs-mixology-cup-photo.is-large { min-height: 354px; }
  .mbs-mixology-cup-photo strong {
    font-size: 18px;
    line-height: 1.15;
    font-weight: 900;
  }
  .mbs-mixology-cup-photo span {
    margin-top: 8px;
    color: var(--mbs-gray);
    font-size: 13px;
    line-height: 1.35;
    font-weight: 700;
  }
  .mbs-mixology-cup-albums {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
    align-items: stretch;
  }
  .mbs-mixology-cup-album-summary {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 0 0 16px;
  }
  .mbs-mixology-cup-album-summary__item {
    display: inline-flex;
    align-items: center;
    min-height: 34px;
    padding: 0 12px;
    border-radius: 999px;
    background: #fff;
    color: var(--mbs-black);
    font-size: 13px;
    line-height: 1;
    font-weight: 900;
    box-shadow: 0 8px 22px rgba(31, 31, 31, .05);
  }
  .mbs-mixology-cup-album-summary__item.is-muted {
    background: var(--mbs-bg-green);
    color: var(--mbs-green-dark);
  }
  .mbs-mixology-cup-album-card {
    display: flex;
    min-height: 0;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid rgba(65, 112, 51, .14);
    border-radius: 18px;
    background: #fff;
    box-shadow: 0 12px 36px rgba(31, 31, 31, .06);
  }
  .mbs-mixology-cup-album-card__cover {
    position: relative;
    display: block;
    width: 100%;
    border: 0;
    padding: 0;
    aspect-ratio: 16 / 11;
    min-height: 0;
    overflow: hidden;
    background: var(--mbs-bg);
    cursor: pointer;
  }
  .mbs-mixology-cup-album-card__cover img {
    position: absolute;
    inset: 0;
    display: block;
    width: 100%;
    height: 100%;
    min-height: 0;
    object-fit: cover;
    transition: transform .35s ease;
  }
  .mbs-mixology-cup-album-card:hover .mbs-mixology-cup-album-card__cover img {
    transform: scale(1.035);
  }
  .mbs-mixology-cup-album-card__badge {
    position: absolute;
    left: 12px;
    top: 12px;
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba(31, 31, 31, .68);
    color: #fff;
    font-size: 12px;
    line-height: 1;
    font-weight: 900;
  }
  .mbs-mixology-cup-album-card__body {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 10px;
    padding: 16px;
  }
  .mbs-mixology-cup-album-card__body h3 {
    margin: 0;
    font-size: 18px;
    line-height: 1.08;
    font-weight: 900;
  }
  .mbs-mixology-cup-album-card__body p {
    margin: 0;
    color: var(--mbs-gray);
    font-size: 14px;
    line-height: 1.45;
    font-weight: 700;
  }
  .mbs-mixology-cup-album-card__meta {
    display: grid;
    gap: 6px;
  }
  .mbs-mixology-cup-album-card__meta-row {
    display: grid;
    grid-template-columns: 86px minmax(0, 1fr);
    gap: 10px;
    padding: 8px 0;
    border-top: 1px solid rgba(65, 112, 51, .12);
    color: var(--mbs-gray);
    font-size: 13px;
    line-height: 1.3;
    font-weight: 800;
  }
  .mbs-mixology-cup-album-card__meta-row strong {
    color: var(--mbs-black);
    font-size: 13px;
    font-weight: 900;
    text-align: left;
  }
  .mbs-mixology-cup-album-card__thumbs {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 5px;
    margin-top: auto;
  }
  .mbs-mixology-cup-album-card__thumbs img {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 8px;
    object-fit: cover;
    background: var(--mbs-bg);
  }
  .mbs-mixology-cup-album-card__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    justify-content: flex-start;
    margin-top: 2px;
  }
  .mbs-mixology-cup-album-card__link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 40px;
    padding: 0 12px;
    border: 0;
    border-radius: 999px;
    background: var(--mbs-green);
    color: #fff !important;
    font-family: inherit;
    font-size: 12px;
    line-height: 1;
    font-weight: 900;
    text-decoration: none !important;
    cursor: pointer;
    transition: background .2s, transform .2s;
  }
  .mbs-mixology-cup-album-card__link:hover {
    background: var(--mbs-green-dark);
    color: #fff !important;
    transform: translateY(-1px);
  }
  .mbs-mixology-cup-album-card__link.is-secondary {
    background: var(--mbs-bg-green);
    color: var(--mbs-green-dark) !important;
  }
  .mbs-mixology-cup-album-card__link.is-secondary:hover {
    background: var(--mbs-green-dark);
    color: #fff !important;
  }
  .mbs-mixology-cup-album-card__note {
    color: var(--mbs-gray);
    font-size: 12px;
    line-height: 1.3;
    font-weight: 800;
  }
  .mbs-mixology-cup-album-placeholder {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    min-height: 0;
    height: 100%;
    gap: 10px;
    margin-top: 0;
    padding: 16px;
    border: 1px dashed rgba(65, 112, 51, .35);
    border-radius: 14px;
    background: linear-gradient(135deg, rgba(231, 242, 227, .8), rgba(248, 221, 225, .55));
  }
  .mbs-mixology-cup-album-placeholder h3 {
    margin: 0;
    font-size: 18px;
    line-height: 1.1;
    font-weight: 900;
  }
  .mbs-mixology-cup-album-placeholder p {
    margin: 0;
    color: var(--mbs-gray);
    font-size: 14px;
    line-height: 1.45;
    font-weight: 700;
  }
  .mbs-mixology-cup-gallery-modal[hidden] { display: none; }
  .mbs-mixology-cup-gallery-modal {
    position: fixed;
    inset: 0;
    z-index: 100000;
    display: grid;
    place-items: center;
    padding: 18px;
  }
  .mbs-mixology-cup-gallery-modal__backdrop {
    position: absolute;
    inset: 0;
    background: rgba(31, 31, 31, .68);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }
  .mbs-mixology-cup-gallery-modal__dialog {
    position: relative;
    width: min(960px, 100%);
    max-height: min(820px, calc(100vh - 36px));
    overflow: hidden;
    display: flex;
    flex-direction: column;
    border-radius: 20px;
    background: #fff;
    box-shadow: 0 24px 90px rgba(31, 31, 31, .28);
  }
  .mbs-mixology-cup-gallery-modal__close {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 5;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border: 0;
    border-radius: 999px;
    background: rgba(31, 31, 31, .64);
    color: #fff;
    font-size: 24px;
    line-height: 1;
    font-weight: 700;
    cursor: pointer;
  }
  .mbs-mixology-cup-gallery-modal__stage {
    position: relative;
    aspect-ratio: 16 / 9;
    min-height: 320px;
    background: #111;
    overflow: hidden;
  }
  .mbs-mixology-cup-gallery-modal__stage img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .mbs-mixology-cup-gallery-modal__nav {
    position: absolute;
    top: 50%;
    z-index: 4;
    transform: translateY(-50%);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    border: 0;
    border-radius: 12px;
    background: rgba(255, 255, 255, .72);
    color: var(--mbs-black);
    font-size: 28px;
    line-height: 1;
    font-weight: 800;
    cursor: pointer;
  }
  .mbs-mixology-cup-gallery-modal__nav:hover {
    background: rgba(255, 255, 255, .92);
  }
  .mbs-mixology-cup-gallery-modal__nav.is-prev { left: 12px; }
  .mbs-mixology-cup-gallery-modal__nav.is-next { right: 12px; }
  .mbs-mixology-cup-gallery-modal__counter {
    position: absolute;
    left: 50%;
    bottom: 12px;
    z-index: 4;
    transform: translateX(-50%);
    padding: 6px 12px;
    border-radius: 999px;
    background: rgba(31, 31, 31, .66);
    color: #fff;
    font-size: 12px;
    line-height: 1;
    font-weight: 900;
  }
  .mbs-mixology-cup-gallery-modal__body {
    display: grid;
    gap: 12px;
    padding: 16px 18px 18px;
    overflow: auto;
  }
  .mbs-mixology-cup-gallery-modal__head {
    display: grid;
    gap: 4px;
  }
  .mbs-mixology-cup-gallery-modal__head h3 {
    margin: 0;
    font-size: 22px;
    line-height: 1.12;
    font-weight: 900;
  }
  .mbs-mixology-cup-gallery-modal__head p {
    margin: 0;
    color: var(--mbs-gray);
    font-size: 13px;
    line-height: 1.4;
    font-weight: 800;
  }
  .mbs-mixology-cup-gallery-modal__thumbs {
    display: flex;
    gap: 6px;
    overflow-x: auto;
    padding: 2px 0 4px;
    -webkit-overflow-scrolling: touch;
  }
  .mbs-mixology-cup-gallery-modal__thumb {
    flex: 0 0 auto;
    width: 72px;
    height: 54px;
    overflow: hidden;
    border: 2px solid transparent;
    border-radius: 8px;
    padding: 0;
    background: var(--mbs-bg);
    cursor: pointer;
    opacity: .72;
  }
  .mbs-mixology-cup-gallery-modal__thumb.is-active {
    border-color: var(--mbs-green-dark);
    opacity: 1;
  }
  .mbs-mixology-cup-gallery-modal__thumb img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .mbs-mixology-cup-gallery-modal__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }
  .mbs-mixology-cup-final__box {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 24px;
    align-items: center;
    padding: 48px;
    border-radius: 28px;
    background: var(--mbs-bg-green);
  }
  .mbs-mixology-cup-final__box h2 {
    margin: 0 0 10px;
    font-size: 34px;
    line-height: 1;
    font-weight: 900;
  }
  .mbs-mixology-cup-final__box p {
    max-width: 690px;
    margin: 0;
    color: var(--mbs-gray);
    font-size: 16px;
    line-height: 1.55;
    font-weight: 600;
  }
  @media (max-width: 1180px) {
    .mbs-mixology-cup-hero__card {
      min-height: auto;
      padding: 56px 52px;
    }
    .mbs-mixology-cup-hero__grid {
      grid-template-columns: 1fr;
      min-height: auto;
    }
    .mbs-mixology-cup-hero h1 { font-size: 68px; }
    .mbs-mixology-cup-hero__panel {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
  @media (max-width: 860px) {
    .mbs-mixology-cup-hero { padding: 14px 12px; }
    .mbs-mixology-cup-hero__card {
      padding: 28px 18px;
      border-radius: 22px;
    }
    .mbs-mixology-cup-hero h1 {
      font-size: 40px;
      line-height: .98;
    }
    .mbs-mixology-cup-hero__lead {
      font-size: 16px;
      line-height: 1.4;
    }
    .mbs-mixology-cup-hero__panel,
    .mbs-mixology-cup-info__grid,
    .mbs-mixology-cup-seasons__grid,
    .mbs-mixology-cup-rules__grid,
    .mbs-mixology-cup-season-detail__head,
    .mbs-mixology-cup-season-detail__grid,
    .mbs-mixology-cup-judging-grid,
    .mbs-mixology-cup-modal__grid,
    .mbs-mixology-cup-photo-grid,
    .mbs-mixology-cup-albums,
    .mbs-mixology-cup-tools__grid,
    .mbs-mixology-cup-final__box,
    .mbs-mixology-cup-rules__box {
      grid-template-columns: 1fr;
    }
    .mbs-mixology-cup-info,
    .mbs-mixology-cup-seasons,
    .mbs-mixology-cup-rules,
    .mbs-mixology-cup-community,
    .mbs-mixology-cup-season-detail,
    .mbs-mixology-cup-archive-tools,
    .mbs-mixology-cup-final {
      padding: 64px 14px;
    }
    .mbs-mixology-cup__wrap {
      width: 100%;
    }
    .mbs-mixology-cup__title,
    .mbs-mixology-cup-final__box h2 {
      font-size: 26px;
    }
    .mbs-mixology-cup__btn,
    .mbs-mixology-cup__btn-secondary,
    .mbs-mixology-cup-community__tools input,
    .mbs-mixology-cup-community__tools select {
      width: 100%;
    }
    .mbs-mixology-cup-season-detail__item {
      padding: 18px;
    }
    .mbs-mixology-cup-winner-card {
      grid-template-columns: auto minmax(0, 1fr);
    }
    .mbs-mixology-cup-winner-card__score {
      grid-column: 2;
      font-size: 18px;
    }
    .mbs-mixology-cup-modal__dialog {
      padding: 22px 16px;
      border-radius: 20px;
    }
    .mbs-mixology-cup-gallery-modal__dialog {
      max-height: calc(100vh - 24px);
      border-radius: 18px;
    }
    .mbs-mixology-cup-gallery-modal__stage {
      min-height: 220px;
    }
    .mbs-mixology-cup-modal__head h3 {
      font-size: 24px;
    }
    .mbs-mixology-cup-photo.is-large {
      min-height: 230px;
    }
    .mbs-mixology-cup-partner-grid {
      grid-template-columns: 1fr;
    }
  }
</style>

<div class="mbs-mixology-cup" id="mbs-mixology-cup"
     data-api-url="${PUBLIC_DATA_URL}"
     data-rules-url="#mbs-mixology-cup-rules">
  <section class="mbs-mixology-cup-hero">
    <div class="mbs-mixology-cup-hero__card">
      <div class="mbs-mixology-cup-hero__grid">
        <div>
          <div class="mbs-mixology-cup-hero__kicker">Главная страница направления миксологии</div>
          <h1>MBS MIXOLOGY CUP</h1>
          <p class="mbs-mixology-cup-hero__lead">Архив чемпионатов, общая таблица участников и база комьюнити Московской школы бариста вокруг авторских безалкогольных напитков.</p>
          <div class="mbs-mixology-cup-hero__actions">
            <a class="mbs-mixology-cup__btn" href="#mbs-mixology-cup-seasons">Смотреть сезоны</a>
            <a class="mbs-mixology-cup__btn-secondary" href="#mbs-mixology-cup-community">Таблица участников</a>
            <a class="mbs-mixology-cup__btn-secondary" href="#mbs-mixology-cup-rules">Регламенты</a>
          </div>
        </div>
        <div class="mbs-mixology-cup-hero__panel">
          <div class="mbs-mixology-cup-hero__stat"><span>Проведено</span><strong data-mixology-stat-seasons>—</strong></div>
          <div class="mbs-mixology-cup-hero__stat"><span>Участники в базе</span><strong data-mixology-stat-participants>—</strong></div>
          <div class="mbs-mixology-cup-hero__stat"><span>Были на 2+ Cup</span><strong data-mixology-stat-multi>—</strong></div>
        </div>
      </div>
    </div>
  </section>

  <section class="mbs-mixology-cup-info">
    <div class="mbs-mixology-cup__wrap">
      <div class="mbs-mixology-cup__label">О направлении</div>
      <h2 class="mbs-mixology-cup__title">Не разовая страница, а центр истории чемпионатов</h2>
      <p class="mbs-mixology-cup__sub">Эта страница собирает сезоны MBS MIXOLOGY CUP в один понятный архив: кто участвовал, какие правила действовали, кто судил, какие партнёры поддерживали чемпионат и как развивалось комьюнити.</p>
      <div class="mbs-mixology-cup-info__grid">
        <article class="mbs-mixology-cup-card"><h3>История сезонов</h3><p>Каждый чемпионат получает отдельную карточку и место под будущую страницу сезона.</p></article>
        <article class="mbs-mixology-cup-card"><h3>Комьюнити участников</h3><p>Общая таблица показывает, кто был на Cup несколько раз и кто возвращается на чемпионаты.</p></article>
        <article class="mbs-mixology-cup-card mbs-mixology-cup-card--green"><h3>Регламенты и архив</h3><p>Правила, партнёры, судьи, призы и фотоальбомы будут собраны в одном месте.</p></article>
      </div>
    </div>
  </section>

  <section class="mbs-mixology-cup-seasons" id="mbs-mixology-cup-seasons">
    <div class="mbs-mixology-cup__wrap">
      <div class="mbs-mixology-cup__label">Сезоны</div>
      <h2 class="mbs-mixology-cup__title">Чемпионаты MBS MIXOLOGY CUP</h2>
      <p class="mbs-mixology-cup__sub">Пока карточки ведут к разделам на этой странице. После наполнения можно вынести каждый сезон в отдельную страницу.</p>
      <div class="mbs-mixology-cup-seasons__grid" data-mixology-seasons-root></div>
    </div>
  </section>

  <section class="mbs-mixology-cup-rules" id="mbs-mixology-cup-rules">
    <div class="mbs-mixology-cup__wrap">
      <div class="mbs-mixology-cup-rules__box">
        <div>
          <div class="mbs-mixology-cup__label">Регламенты</div>
          <h2 class="mbs-mixology-cup__title">Общие правила направления</h2>
          <p>Третий сезон уже имеет локальный регламент. Для первых сезонов оставлены места под документы, чтобы собрать архив без потери истории.</p>
        </div>
        <a class="mbs-mixology-cup__btn-secondary" href="#mbs-mixology-cup-season-cup-3">Регламент #3</a>
      </div>
      <div class="mbs-mixology-cup-rules__grid">
        <div class="mbs-mixology-cup-rule"><strong>30</strong><span>максимум участников по регламенту третьего сезона</span></div>
        <div class="mbs-mixology-cup-rule"><strong>14</strong><span>минут на станцию: подготовка, выступление и уборка</span></div>
        <div class="mbs-mixology-cup-rule"><strong>10</strong><span>минут основного выступления</span></div>
        <div class="mbs-mixology-cup-rule"><strong>0%</strong><span>алкоголя в авторском напитке</span></div>
      </div>
    </div>
  </section>

  <section class="mbs-mixology-cup-community" id="mbs-mixology-cup-community">
    <div class="mbs-mixology-cup__wrap">
      <div class="mbs-mixology-cup__label">Комьюнити</div>
      <h2 class="mbs-mixology-cup__title">Общая таблица участников</h2>
      <p class="mbs-mixology-cup__sub">Публичная версия без приватных контактов и внутренних данных. Таблица нужна, чтобы видеть ядро комьюнити и тех, кто возвращается.</p>
      <div class="mbs-mixology-cup-community__tools">
        <input type="search" placeholder="Найти участника" data-mixology-search>
        <select data-mixology-season-filter aria-label="Сезон">
          <option value="all">Все сезоны</option>
        </select>
        <select data-mixology-experience-filter aria-label="Опыт участия">
          <option value="all">Любой опыт</option>
          <option value="first">Первый Cup</option>
          <option value="multi">2+ Cup</option>
          <option value="three">3 Cup</option>
        </select>
        <select data-mixology-achievement-filter aria-label="Достижения">
          <option value="all">Все достижения</option>
          <option value="winner">Победители</option>
          <option value="prize">Призовые места</option>
          <option value="top5">Топ-5 Cup #3</option>
          <option value="judging">Есть судейские итоги</option>
        </select>
        <select data-mixology-rating-filter aria-label="Рейтинг">
          <option value="community">Рейтинг комьюнити</option>
          <option value="wins">По победам</option>
          <option value="prizes">По призовым местам</option>
          <option value="judging">По баллам Cup #3</option>
          <option value="cup_visits">По количеству Cup</option>
        </select>
      </div>
      <div class="mbs-mixology-cup-table-wrap" data-mixology-table-root></div>
    </div>
  </section>

  <section class="mbs-mixology-cup-season-detail">
    <div class="mbs-mixology-cup__wrap">
      <div class="mbs-mixology-cup__label">Архив сезонов</div>
      <h2 class="mbs-mixology-cup__title">Что известно по каждому Cup</h2>
      <p class="mbs-mixology-cup__sub">Здесь уже есть участники и статистика сезонов. Победителей, судей, призы и фото нужно дозаполнить вручную.</p>
      <div data-mixology-season-details-root></div>
    </div>
  </section>

  <section class="mbs-mixology-cup-archive-tools">
    <div class="mbs-mixology-cup__wrap">
      <div class="mbs-mixology-cup__label">Фото и материалы</div>
      <h2 class="mbs-mixology-cup__title">Фотоархив и материалы чемпионатов</h2>
      <p class="mbs-mixology-cup__sub">Подключены публичные фотоальбомы из каталога чемпионатов. На странице показаны обложки, короткие превью и встроенный просмотр фотографий без внешних ссылок для посетителей.</p>
      <div data-mixology-gallery-root></div>
    </div>
  </section>

  <section class="mbs-mixology-cup-final">
    <div class="mbs-mixology-cup__wrap">
      <div class="mbs-mixology-cup-final__box">
        <div>
          <h2>Следующий шаг — наполнить сезоны фактами</h2>
          <p>Страница уже готова как hub. Теперь можно отдельно добавить фото третьего Cup, победителей и судей первых сезонов, призы, напитки победителей и будущий CTA нового чемпионата.</p>
        </div>
        <a class="mbs-mixology-cup__btn" href="#mbs-mixology-cup-seasons">Вернуться к сезонам</a>
      </div>
    </div>
  </section>

  <div class="mbs-mixology-cup-modal" data-mixology-winner-modal hidden>
    <div class="mbs-mixology-cup-modal__backdrop" data-mixology-close-winner></div>
    <div class="mbs-mixology-cup-modal__dialog" role="dialog" aria-modal="true" aria-label="Карточка победителя">
      <button class="mbs-mixology-cup-modal__close" type="button" data-mixology-close-winner aria-label="Закрыть">×</button>
      <div data-mixology-winner-modal-body></div>
    </div>
  </div>

  <div class="mbs-mixology-cup-gallery-modal" data-mixology-gallery-modal hidden>
    <div class="mbs-mixology-cup-gallery-modal__backdrop" data-mixology-close-gallery></div>
    <div class="mbs-mixology-cup-gallery-modal__dialog" role="dialog" aria-modal="true" aria-label="Просмотр фотоальбома">
      <button class="mbs-mixology-cup-gallery-modal__close" type="button" data-mixology-close-gallery aria-label="Закрыть">×</button>
      <div data-mixology-gallery-modal-body></div>
    </div>
  </div>
</div>

<script>
  (function () {
    var root = document.getElementById('mbs-mixology-cup');
    if (!root) return;
    var DATA = ${dataJson};
    var searchEl = root.querySelector('[data-mixology-search]');
    var seasonFilterEl = root.querySelector('[data-mixology-season-filter]');
    var experienceFilterEl = root.querySelector('[data-mixology-experience-filter]');
    var achievementFilterEl = root.querySelector('[data-mixology-achievement-filter]');
    var ratingFilterEl = root.querySelector('[data-mixology-rating-filter]');
    var tableRoot = root.querySelector('[data-mixology-table-root]');
    var winnerModal = root.querySelector('[data-mixology-winner-modal]');
    var winnerModalBody = root.querySelector('[data-mixology-winner-modal-body]');
    var galleryModal = root.querySelector('[data-mixology-gallery-modal]');
    var galleryModalBody = root.querySelector('[data-mixology-gallery-modal-body]');
    var galleryAlbumsCache = null;
    var activeGalleryAlbum = null;
    var activeGalleryPhotos = [];
    var activeGalleryIndex = 0;

    function esc(value) {
      return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char];
      });
    }
    function dateRu(value) {
      var parts = String(value || '').split('-');
      return parts.length === 3 ? parts[2] + '.' + parts[1] + '.' + parts[0] : value;
    }
    function yearPill(date) {
      return '<span class="mbs-mixology-cup-pill">' + esc(String(date).slice(0, 4)) + '</span>';
    }
    function formatScore(value) {
      var number = Number(value);
      if (!isFinite(number)) return esc(value);
      return number % 1 === 0 ? String(number) : number.toFixed(1);
    }
    function photoUrl(url, size) {
      if (!url || String(url).indexOf('lh3.googleusercontent.com') === -1) return url || '';
      return String(url).replace(/=[swh][0-9].*$/, '') + '=' + (size || 'w900');
    }
    function winnerName(winner) {
      return typeof winner === 'string' ? winner : winner.name;
    }
    function winnerHasDetails(winner) {
      return winner && typeof winner === 'object' && winner.name && winner.id;
    }
    function achievement(row) {
      return row.achievements || {
        wins: 0,
        prizePlaces: 0,
        bestPlace: null,
        hasJudging: false,
        bestJudgingPlace: null,
        bestJudgingTotal: null
      };
    }
    function seasonDates(row) {
      var dates = (row.bookingDates && row.bookingDates.length ? row.bookingDates : row.dates) || [];
      return dates;
    }
    function passesSeason(row, seasonId) {
      if (seasonId === 'all') return true;
      var season = DATA.seasons.find(function (item) { return item.id === seasonId; });
      if (!season) return true;
      return seasonDates(row).indexOf(season.date) !== -1;
    }
    function passesExperience(row, experience) {
      if (experience === 'first') return row.cupVisits === 1;
      if (experience === 'multi') return row.cupVisits >= 2;
      if (experience === 'three') return row.cupVisits >= 3;
      return true;
    }
    function passesAchievement(row, filter) {
      var ach = achievement(row);
      if (filter === 'winner') return ach.wins > 0;
      if (filter === 'prize') return ach.prizePlaces > 0;
      if (filter === 'top5') return ach.bestJudgingPlace && ach.bestJudgingPlace <= 5;
      if (filter === 'judging') return ach.hasJudging;
      return true;
    }
    function renderSeasonFilter() {
      var current = seasonFilterEl.value || 'all';
      seasonFilterEl.innerHTML = '<option value="all">Все сезоны</option>' +
        DATA.seasons.map(function (season) {
          return '<option value="' + esc(season.id) + '">' + esc(season.title.replace('MBS MIXOLOGY ', '')) + '</option>';
        }).join('');
      seasonFilterEl.value = DATA.seasons.some(function (season) { return season.id === current; }) ? current : 'all';
    }
    function compareNumbers(a, b) {
      var left = Number(a);
      var right = Number(b);
      if (!isFinite(left)) left = -999999;
      if (!isFinite(right)) right = -999999;
      return right - left;
    }
    function sortRows(rows, rating) {
      return rows.slice().sort(function (a, b) {
        var aa = achievement(a);
        var bb = achievement(b);
        if (rating === 'wins') {
          return bb.wins - aa.wins
            || bb.prizePlaces - aa.prizePlaces
            || compareNumbers(aa.bestPlace ? -aa.bestPlace : null, bb.bestPlace ? -bb.bestPlace : null)
            || b.cupVisits - a.cupVisits
            || a.name.localeCompare(b.name, 'ru');
        }
        if (rating === 'prizes') {
          return bb.prizePlaces - aa.prizePlaces
            || bb.wins - aa.wins
            || compareNumbers(aa.bestPlace ? -aa.bestPlace : null, bb.bestPlace ? -bb.bestPlace : null)
            || a.name.localeCompare(b.name, 'ru');
        }
        if (rating === 'judging') {
          return compareNumbers(aa.bestJudgingTotal, bb.bestJudgingTotal)
            || compareNumbers(aa.bestJudgingPlace ? -aa.bestJudgingPlace : null, bb.bestJudgingPlace ? -bb.bestJudgingPlace : null)
            || a.name.localeCompare(b.name, 'ru');
        }
        if (rating === 'cup_visits') {
          return b.cupVisits - a.cupVisits
            || a.name.localeCompare(b.name, 'ru');
        }
        return b.cupVisits - a.cupVisits
          || bb.prizePlaces - aa.prizePlaces
          || a.name.localeCompare(b.name, 'ru');
      });
    }
    function achievementPills(row) {
      var ach = achievement(row);
      var pills = [];
      if (ach.wins > 0) pills.push('<span class="mbs-mixology-cup-pill is-red">' + ach.wins + ' победа</span>');
      if (ach.prizePlaces > 0) pills.push('<span class="mbs-mixology-cup-pill is-red">' + ach.prizePlaces + ' призовое</span>');
      if (ach.bestJudgingPlace) pills.push('<span class="mbs-mixology-cup-pill">Cup #3: ' + ach.bestJudgingPlace + ' место</span>');
      if (row.judging && row.judging.total != null) pills.push('<span class="mbs-mixology-cup-pill">' + formatScore(row.judging.total) + ' баллов</span>');
      if (row.cupVisits >= 2) pills.push('<span class="mbs-mixology-cup-pill">2+ Cup</span>');
      if (!pills.length && row.cupVisits === 0 && row.cupBookings > 0) pills.push('<span class="mbs-mixology-cup-pill">запись без визита</span>');
      return pills.length ? '<div class="mbs-mixology-cup-pills">' + pills.join('') + '</div>' : '<span class="mbs-mixology-cup-pill">участник</span>';
    }
    function achievementCards(row) {
      var ach = achievement(row);
      var items = [];
      if (ach.wins > 0) items.push(['Победа', ach.wins + ' раз в победителях MBS MIXOLOGY CUP']);
      if (ach.prizePlaces > 0) items.push(['Призовое место', ach.prizePlaces + ' раз в топ-3 сезона']);
      if (ach.bestJudgingPlace) items.push(['Cup #3', ach.bestJudgingPlace + ' место в судейских итогах']);
      if (row.judging && row.judging.total != null) items.push(['Баллы Cup #3', formatScore(row.judging.total) + ' баллов по судейским листам']);
      if (row.cupVisits >= 2) items.push(['Участий в Cup', row.cupVisits + ' сезона в архиве чемпионата']);
      if (!items.length && row.cupVisits === 0 && row.cupBookings > 0) items.push(['Запись на сезон', 'Активное участие не подтверждено']);
      if (!items.length) return '<div class="mbs-mixology-cup-empty">Достижения пока не найдены</div>';
      return '<div class="mbs-mixology-cup-achievement-list">' + items.map(function (item) {
        return '<div class="mbs-mixology-cup-achievement-card"><strong>' + esc(item[0]) + '</strong><span>' + esc(item[1]) + '</span></div>';
      }).join('') + '</div>';
    }
    function nameTokens(name) {
      return String(name || '')
        .toLowerCase()
        .replace(/ё/g, 'е')
        .replace(/[^a-zа-я0-9\\s]/g, ' ')
        .split(/\\s+/)
        .filter(Boolean);
    }
    function namesMatch(left, right) {
      var leftTokens = nameTokens(left);
      var rightTokens = nameTokens(right);
      if (!leftTokens.length || !rightTokens.length) return false;
      if (leftTokens.length < 2 || rightTokens.length < 2) return leftTokens.join(' ') === rightTokens.join(' ');
      var shorter = leftTokens.length <= rightTokens.length ? leftTokens : rightTokens;
      var longer = leftTokens.length > rightTokens.length ? leftTokens : rightTokens;
      return shorter.every(function (token) { return longer.indexOf(token) !== -1; });
    }
    function findSeason(seasonId) {
      return DATA.seasons.find(function (season) { return season.id === seasonId; }) || null;
    }
    function findPublicParticipant(name, season) {
      return (DATA.participants || []).find(function (row) {
        return namesMatch(name, row.name) && seasonDates(row).indexOf(season.date) !== -1;
      }) || (DATA.participants || []).find(function (row) {
        return namesMatch(name, row.name);
      }) || null;
    }
    function findSeasonParticipant(name, season) {
      return (season.participants || []).find(function (item) { return namesMatch(name, item.name); }) || null;
    }
    function findSeasonResult(name, season) {
      if (!season || !season.judging || !season.judging.results) return null;
      return season.judging.results.find(function (result) { return namesMatch(name, result.name); }) || null;
    }
    function findSeasonWinner(name, season) {
      if (!season || !season.winners) return null;
      return season.winners.find(function (winner) {
        return winnerHasDetails(winner) && namesMatch(name, winner.name);
      }) || null;
    }
    function resultStatusText(participant, result) {
      if (result && result.note) return result.note;
      if (result && result.status) return result.status;
      if (participant && participant.active === false) return 'не пришёл';
      return 'результат не найден';
    }
    function resultProjectText(result) {
      return result && result.project ? result.project : 'проект не указан';
    }
    function rowSearchText(values) {
      return values.filter(Boolean).join(' ').toLowerCase().replace(/ё/g, 'е');
    }
    function winnerListText(season) {
      var winners = (season.winners || []).filter(Boolean);
      if (!winners.length) return 'требуется заполнить';
      return winners.map(winnerName).join(', ');
    }
    function judgeListText(season) {
      return (season.judges || []).length ? season.judges.join(', ') : 'требуется заполнить';
    }
    function findWinner(id) {
      for (var i = 0; i < DATA.seasons.length; i++) {
        var season = DATA.seasons[i];
        for (var j = 0; j < (season.winners || []).length; j++) {
          var winner = season.winners[j];
          if (winnerHasDetails(winner) && winner.id === id) return { season: season, winner: winner };
        }
      }
      return null;
    }
    function renderWinnerCards(season) {
      var winners = (season.winners || []).filter(Boolean);
      if (!winners.length) return '<ul><li>Победителей нужно добавить</li></ul>';
      if (!winners.some(winnerHasDetails)) {
        return '<ul>' + winners.map(function (item) { return '<li>' + esc(winnerName(item)) + '</li>'; }).join('') + '</ul>';
      }
      return '<div class="mbs-mixology-cup-winners">' + winners.map(function (winner) {
        if (!winnerHasDetails(winner)) return '<div>' + esc(winnerName(winner)) + '</div>';
        return '<button class="mbs-mixology-cup-winner-card" type="button" data-mixology-winner="' + esc(winner.id) + '">' +
          '<span class="mbs-mixology-cup-winner-card__place">' + esc(winner.place) + '</span>' +
          '<span><span class="mbs-mixology-cup-winner-card__name">' + esc(winner.name) + '</span>' +
          '<span class="mbs-mixology-cup-winner-card__meta">' + esc(winner.project || 'Проект добавить') + '</span></span>' +
          '<span class="mbs-mixology-cup-winner-card__score">' + formatScore(winner.total) + '</span>' +
        '</button>';
      }).join('') + '</div>';
    }
    function renderSeasonParticipantPanel(season) {
      var participants = season.participants || [];
      var activeCount = participants.filter(function (item) { return item.active; }).length;
      var noShowCount = participants.filter(function (item) {
        var result = findSeasonResult(item.name, season);
        return !item.active || (result && result.note === 'Не пришёл');
      }).length;
      var judgedCount = participants.filter(function (item) {
        var result = findSeasonResult(item.name, season);
        return result && result.status === 'Готово';
      }).length;
      var rows = participants.map(function (item) {
        var publicRow = findPublicParticipant(item.name, season) || item;
        var result = findSeasonResult(item.name, season);
        var noShow = !item.active || (result && result.note === 'Не пришёл');
        var judged = result && result.status === 'Готово';
        var top5 = Boolean(result && result.place && result.place <= 5);
        var prize = Boolean(result && result.place && result.place <= 3);
        var status = resultStatusText(item, result);
        var metaParts = [
          item.active ? 'активный участник' : 'запись без активного визита',
          result ? resultProjectText(result) : '',
          result && result.place ? result.place + ' место' : ''
        ].filter(Boolean);
        return '<button class="mbs-mixology-cup-season-participant" type="button"' +
          ' data-mixology-participant="' + esc(item.name) + '"' +
          ' data-mixology-season-id="' + esc(season.id) + '"' +
          ' data-active="' + (item.active ? '1' : '0') + '"' +
          ' data-noshow="' + (noShow ? '1' : '0') + '"' +
          ' data-judged="' + (judged ? '1' : '0') + '"' +
          ' data-top5="' + (top5 ? '1' : '0') + '"' +
          ' data-prize="' + (prize ? '1' : '0') + '"' +
          ' data-search="' + esc(rowSearchText([item.name, publicRow.name, result && result.name, result && result.project, status])) + '">' +
          '<span><span class="mbs-mixology-cup-season-participant__name">' + esc(item.name) + '</span>' +
          '<span class="mbs-mixology-cup-season-participant__meta">' + esc(metaParts.join(' · ') || status) + '</span></span>' +
          '<span class="mbs-mixology-cup-season-participant__score">' + (result && result.total != null ? formatScore(result.total) : '—') + '</span>' +
        '</button>';
      }).join('');
      return '<div class="mbs-mixology-cup-panel mbs-mixology-cup-season-participant-panel">' +
        '<h4>Участники сезона</h4>' +
        '<div class="mbs-mixology-cup-season-tools" data-mixology-season-panel="' + esc(season.id) + '">' +
          '<input type="search" placeholder="Найти участника сезона" data-mixology-season-search="' + esc(season.id) + '">' +
          '<div class="mbs-mixology-cup-filter-row">' +
            '<button class="mbs-mixology-cup-filter-btn is-active" type="button" data-mixology-season-participant-filter="' + esc(season.id) + '" data-filter="all">Все ' + participants.length + '</button>' +
            '<button class="mbs-mixology-cup-filter-btn" type="button" data-mixology-season-participant-filter="' + esc(season.id) + '" data-filter="noshow">Не пришли ' + noShowCount + '</button>' +
            '<button class="mbs-mixology-cup-filter-btn" type="button" data-mixology-season-participant-filter="' + esc(season.id) + '" data-filter="judged">С результатом ' + judgedCount + '</button>' +
            '<button class="mbs-mixology-cup-filter-btn" type="button" data-mixology-season-participant-filter="' + esc(season.id) + '" data-filter="top5">Топ-5</button>' +
            '<button class="mbs-mixology-cup-filter-btn" type="button" data-mixology-season-participant-filter="' + esc(season.id) + '" data-filter="prize">Призовые места</button>' +
          '</div>' +
          '<div style="color:#555;font-size:12px;font-weight:800"><span data-mixology-season-visible-count="' + esc(season.id) + '">' + participants.length + '</span> показано · ' + activeCount + ' активных из ' + participants.length + ' записей</div>' +
        '</div>' +
        '<div class="mbs-mixology-cup-season-participants" data-mixology-season-list="' + esc(season.id) + '">' + rows + '</div>' +
      '</div>';
    }
    function renderSeasonResultsTable(season) {
      if (!season.judging) return '';
      var rows = (season.judging.results || []).map(function (item) {
        var top5 = item.place && item.place <= 5;
        var disqualified = item.note === 'Дисквалификация';
        var absent = item.note === 'Не пришёл';
        return '<tr class="mbs-mixology-cup-result-row' + (!top5 ? ' mbs-mixology-cup-hidden' : '') + '"' +
          ' data-mixology-result-row="' + esc(season.id) + '"' +
          ' data-mixology-result-name="' + esc(item.name) + '"' +
          ' data-top5="' + (top5 ? '1' : '0') + '"' +
          ' data-disqualified="' + (disqualified ? '1' : '0') + '"' +
          ' data-absent="' + (absent ? '1' : '0') + '">' +
          '<td><span class="mbs-mixology-cup-pill">' + (item.place ? esc(item.place) + ' место' : '—') + '</span></td>' +
          '<td><strong>' + esc(item.name) + '</strong><div style="color:#555;font-size:12px;font-weight:700">' + esc(item.project || 'проект не указан') + '</div></td>' +
          '<td>' + esc(item.status || '—') + (item.note ? '<div style="color:#CC2841;font-size:12px;font-weight:800">' + esc(item.note) + '</div>' : '') + '</td>' +
          '<td><strong>' + formatScore(item.total) + '</strong></td>' +
        '</tr>';
      }).join('');
      return '<div class="mbs-mixology-cup-filter-row" style="margin:14px 0 10px">' +
          '<button class="mbs-mixology-cup-filter-btn is-active" type="button" data-mixology-result-filter="' + esc(season.id) + '" data-filter="top5">Топ-5</button>' +
          '<button class="mbs-mixology-cup-filter-btn" type="button" data-mixology-result-filter="' + esc(season.id) + '" data-filter="all">Все результаты</button>' +
          '<button class="mbs-mixology-cup-filter-btn" type="button" data-mixology-result-filter="' + esc(season.id) + '" data-filter="disqualified">Дисквалификация</button>' +
          '<button class="mbs-mixology-cup-filter-btn" type="button" data-mixology-result-filter="' + esc(season.id) + '" data-filter="absent">Не пришли</button>' +
        '</div>' +
        '<table class="mbs-mixology-cup-results-table"><thead><tr><th>Место</th><th>Участник</th><th>Статус</th><th>Баллы</th></tr></thead><tbody>' + rows + '</tbody></table>';
    }
    function renderAlbumThumbs(album) {
      var photos = (album.previewPhotos || []).slice(0, 4);
      if (!photos.length) return '';
      return '<div class="mbs-mixology-cup-album-card__thumbs">' + photos.map(function (photo, index) {
        return '<img src="' + esc(photoUrl(photo, 'w220')) + '" alt="Фото из альбома ' + esc(album.title) + ', ' + (index + 1) + '" loading="lazy">';
      }).join('') + '</div>';
    }
    function renderAlbumCard(album, season) {
      var seasonTitle = season && season.title ? season.title : album.dateLabel;
      return '<article class="mbs-mixology-cup-album-card">' +
        '<button class="mbs-mixology-cup-album-card__cover" type="button" data-mixology-album="' + esc(album.seasonId) + '">' +
          '<img src="' + esc(photoUrl(album.coverUrl, 'w900')) + '" alt="' + esc(album.title) + '" loading="lazy">' +
          '<span class="mbs-mixology-cup-album-card__badge">' + esc(album.photosCount) + ' фото</span>' +
        '</button>' +
        '<div class="mbs-mixology-cup-album-card__body">' +
          '<div class="mbs-mixology-cup__label">' + esc(seasonTitle) + '</div>' +
          '<h3>' + esc(album.title) + '</h3>' +
          '<div class="mbs-mixology-cup-album-card__meta">' +
            '<div class="mbs-mixology-cup-album-card__meta-row"><span>Дата</span><strong>' + esc(album.dateLabel) + '</strong></div>' +
            '<div class="mbs-mixology-cup-album-card__meta-row"><span>Победители</span><strong>' + esc(album.winnersText || 'добавить') + '</strong></div>' +
          '</div>' +
          renderAlbumThumbs(album) +
          '<div class="mbs-mixology-cup-album-card__actions">' +
            '<button class="mbs-mixology-cup-album-card__link" type="button" data-mixology-album="' + esc(album.seasonId) + '">Смотреть ' + esc(album.photosCount) + ' фото</button>' +
            '<a class="mbs-mixology-cup-album-card__link is-secondary" href="#mbs-mixology-cup-season-' + esc(album.seasonId) + '">Итоги сезона</a>' +
          '</div>' +
          (album.note ? '<div class="mbs-mixology-cup-album-card__note">' + esc(album.note) + '</div>' : '') +
        '</div>' +
      '</article>';
    }
    function renderAlbumPlaceholder(season) {
      return '<article class="mbs-mixology-cup-album-placeholder">' +
        '<div class="mbs-mixology-cup__label">' + esc(season.title) + '</div>' +
        '<h3>Фотоальбом готовится</h3>' +
        '<p>Для этого сезона пока нет активной записи в публичном каталоге чемпионатов. После добавления в Google Sheets карточка появится здесь через генератор.</p>' +
      '</article>';
    }
    function findAlbumBySeasonId(seasonId) {
      for (var i = 0; i < DATA.seasons.length; i++) {
        if (DATA.seasons[i].gallery && DATA.seasons[i].gallery.seasonId === seasonId) return DATA.seasons[i].gallery;
      }
      return null;
    }
    function fullAlbumFromCatalog(album) {
      if (!galleryAlbumsCache || !galleryAlbumsCache.items) return null;
      for (var i = 0; i < galleryAlbumsCache.items.length; i++) {
        var item = galleryAlbumsCache.items[i];
        if (String(item.id || '') === String(album.sourceId || '')) return item;
      }
      return null;
    }
    function loadGalleryCatalog(callback) {
      if (galleryAlbumsCache) {
        callback(galleryAlbumsCache);
        return;
      }
      if (!DATA.gallerySourceUrl || !window.fetch) {
        callback(null);
        return;
      }
      fetch(DATA.gallerySourceUrl, { cache: 'no-store' })
        .then(function (response) {
          if (!response.ok) throw new Error('HTTP ' + response.status);
          return response.json();
        })
        .then(function (catalog) {
          galleryAlbumsCache = {
            items: (catalog.items || []).map(function (item) {
              return {
                id: item.id,
                photos: item.photos || []
              };
            })
          };
          callback(catalog);
        })
        .catch(function () {
          callback(null);
        });
    }
    function galleryPhotoList(album) {
      var fullAlbum = fullAlbumFromCatalog(album);
      var fullPhotos = fullAlbum && fullAlbum.photos && fullAlbum.photos.length ? fullAlbum.photos : [];
      return fullPhotos.length ? fullPhotos : (album.previewPhotos || []);
    }
    function renderGalleryThumbs() {
      if (!activeGalleryPhotos.length) return '';
      return '<div class="mbs-mixology-cup-gallery-modal__thumbs">' + activeGalleryPhotos.map(function (photo, index) {
        return '<button class="mbs-mixology-cup-gallery-modal__thumb' + (index === activeGalleryIndex ? ' is-active' : '') + '" type="button" data-mixology-gallery-thumb="' + index + '" aria-label="Фото ' + (index + 1) + '">' +
          '<img src="' + esc(photoUrl(photo, 'w220')) + '" alt="" loading="lazy">' +
        '</button>';
      }).join('') + '</div>';
    }
    function renderGalleryViewer() {
      if (!activeGalleryAlbum) return;
      var photo = activeGalleryPhotos[activeGalleryIndex] || activeGalleryAlbum.coverUrl;
      var total = activeGalleryPhotos.length || 1;
      galleryModalBody.innerHTML =
        '<div class="mbs-mixology-cup-gallery-modal__stage">' +
          '<img src="' + esc(photoUrl(photo, 's1400')) + '" alt="Фото ' + esc(activeGalleryAlbum.title) + ', ' + (activeGalleryIndex + 1) + ' из ' + total + '">' +
          '<button class="mbs-mixology-cup-gallery-modal__nav is-prev" type="button" data-mixology-gallery-prev aria-label="Предыдущее фото">‹</button>' +
          '<button class="mbs-mixology-cup-gallery-modal__nav is-next" type="button" data-mixology-gallery-next aria-label="Следующее фото">›</button>' +
          '<span class="mbs-mixology-cup-gallery-modal__counter">' + (activeGalleryIndex + 1) + ' / ' + total + '</span>' +
        '</div>' +
        '<div class="mbs-mixology-cup-gallery-modal__body">' +
          '<div class="mbs-mixology-cup-gallery-modal__head">' +
            '<div class="mbs-mixology-cup__label">' + esc(activeGalleryAlbum.dateLabel) + '</div>' +
            '<h3>' + esc(activeGalleryAlbum.title) + '</h3>' +
            '<p>' + esc(activeGalleryPhotos.length === activeGalleryAlbum.previewPhotos.length ? 'Показываем preview, полный альбом подгружается из публичного каталога.' : activeGalleryPhotos.length + ' фото в альбоме') + '</p>' +
          '</div>' +
          renderGalleryThumbs() +
          '<div class="mbs-mixology-cup-gallery-modal__actions">' +
            '<a class="mbs-mixology-cup-album-card__link is-secondary" href="#mbs-mixology-cup-season-' + esc(activeGalleryAlbum.seasonId) + '" data-mixology-close-gallery>Итоги сезона</a>' +
          '</div>' +
        '</div>';
      preloadGalleryAround(activeGalleryIndex);
    }
    function preloadGalleryAround(index) {
      for (var offset = -1; offset <= 1; offset++) {
        var photo = activeGalleryPhotos[index + offset];
        if (photo && offset !== 0) {
          var img = new Image();
          img.src = photoUrl(photo, 's1400');
        }
      }
    }
    function setGalleryIndex(index) {
      if (!activeGalleryPhotos.length) return;
      if (index < 0) index = activeGalleryPhotos.length - 1;
      if (index >= activeGalleryPhotos.length) index = 0;
      activeGalleryIndex = index;
      renderGalleryViewer();
    }
    function openGalleryModal(album) {
      activeGalleryAlbum = album;
      activeGalleryPhotos = album.previewPhotos || [];
      activeGalleryIndex = 0;
      renderGalleryViewer();
      galleryModal.hidden = false;
      document.body.style.overflow = 'hidden';
      loadGalleryCatalog(function () {
        if (!activeGalleryAlbum || activeGalleryAlbum.seasonId !== album.seasonId) return;
        var photos = galleryPhotoList(album);
        if (photos.length && photos.length !== activeGalleryPhotos.length) {
          activeGalleryPhotos = photos;
          activeGalleryIndex = 0;
          renderGalleryViewer();
        }
      });
    }
    function closeGalleryModal() {
      galleryModal.hidden = true;
      galleryModalBody.innerHTML = '';
      activeGalleryAlbum = null;
      activeGalleryPhotos = [];
      activeGalleryIndex = 0;
      document.body.style.overflow = '';
    }
    function bindGalleryModal() {
      root.addEventListener('click', function (event) {
        var opener = event.target.closest('[data-mixology-album]');
        if (opener && root.contains(opener)) {
          var album = findAlbumBySeasonId(opener.getAttribute('data-mixology-album'));
          if (album) openGalleryModal(album);
          return;
        }
        if (event.target.closest('[data-mixology-close-gallery]')) closeGalleryModal();
        if (event.target.closest('[data-mixology-gallery-prev]')) setGalleryIndex(activeGalleryIndex - 1);
        if (event.target.closest('[data-mixology-gallery-next]')) setGalleryIndex(activeGalleryIndex + 1);
        var thumb = event.target.closest('[data-mixology-gallery-thumb]');
        if (thumb) setGalleryIndex(Number(thumb.getAttribute('data-mixology-gallery-thumb')) || 0);
      });
      document.addEventListener('keydown', function (event) {
        if (!galleryModal.hidden) {
          if (event.key === 'Escape') closeGalleryModal();
          if (event.key === 'ArrowLeft') setGalleryIndex(activeGalleryIndex - 1);
          if (event.key === 'ArrowRight') setGalleryIndex(activeGalleryIndex + 1);
        }
      });
    }
    function renderArchiveGallery() {
      var target = root.querySelector('[data-mixology-gallery-root]');
      if (!target) return;
      var albumSeasons = DATA.seasons.filter(function (season) { return !!season.gallery; });
      var pendingSeasons = DATA.seasons.filter(function (season) { return !season.gallery; });
      var totalPhotos = albumSeasons.reduce(function (sum, season) { return sum + Number(season.gallery.photosCount || 0); }, 0);
      target.innerHTML =
        '<div class="mbs-mixology-cup-album-summary">' +
          '<span class="mbs-mixology-cup-album-summary__item">' + esc(totalPhotos) + ' фото в архиве</span>' +
          '<span class="mbs-mixology-cup-album-summary__item">' + esc(albumSeasons.length) + ' альбома подключено</span>' +
          '<span class="mbs-mixology-cup-album-summary__item is-muted">Cup #3 готовится</span>' +
        '</div>' +
        '<div class="mbs-mixology-cup-albums">' + albumSeasons.map(function (season) {
          return renderAlbumCard(season.gallery, season);
        }).concat(pendingSeasons.map(renderAlbumPlaceholder)).join('') + '</div>';
    }
    function renderSeasonJudgesAndRules(season) {
      var judges = (season.judges || []).filter(Boolean);
      var judgeButtons = judges.length
        ? '<div class="mbs-mixology-cup-judge-list">' + judges.map(function (item, index) {
            return '<button class="mbs-mixology-cup-judge-btn" type="button" data-mixology-judge="' + index + '" data-mixology-season-id="' + esc(season.id) + '">' + esc(item) + '</button>';
          }).join('') + '</div>'
        : '<ul><li>Состав судей нужно добавить</li></ul>';
      var judging = season.judging;
      var judgingContent = judging
        ? '<h4 style="margin-top:18px">Итоги судейских листов</h4>' +
          '<div class="mbs-mixology-cup-judging-grid">' +
            '<div class="mbs-mixology-cup-judging-stat"><strong>' + esc(judging.ready) + '</strong><span>готовых оценок</span></div>' +
            '<div class="mbs-mixology-cup-judging-stat"><strong>' + formatScore(judging.averageTotal) + '</strong><span>средний итог</span></div>' +
            '<div class="mbs-mixology-cup-judging-stat"><strong>' + formatScore(judging.bestTotal) + '</strong><span>лучший итог</span></div>' +
          '</div>' +
          renderSeasonResultsTable(season)
        : '';
      return '<div class="mbs-mixology-cup-panel"><h4>Судьи и регламент</h4>' +
        judgeButtons +
        '<div class="mbs-mixology-cup-prize-box">' + (season.number === 3 ? 'Локальный регламент уже есть в проекте.' : 'Регламент сезона нужно добавить.') + '</div>' +
        judgingContent +
      '</div>';
    }
    function renderSeasonPartnersAndPrizes(season) {
      var partners = (season.partners || []).filter(Boolean);
      var prizes = (season.prizes || []).filter(Boolean);
      var partnerCards = partners.length
        ? '<div class="mbs-mixology-cup-partner-grid">' + partners.map(function (item) {
            if (typeof item === 'string') return '<span class="mbs-mixology-cup-partner-card">' + esc(item) + '</span>';
            return '<button class="mbs-mixology-cup-partner-logo" type="button" data-mixology-partner="' + esc(item.id) + '" data-mixology-season-id="' + esc(season.id) + '">' +
              '<img src="' + esc(item.logo) + '" alt="' + esc(item.name) + '" loading="lazy">' +
              '<span class="mbs-mixology-cup-partner-logo__name">' + esc(item.name) + '</span>' +
            '</button>';
          }).join('') + '</div>'
        : '<div class="mbs-mixology-cup-prize-box">Партнёров сезона нужно добавить.</div>';
      var realPrizes = prizes.filter(function (item) { return String(item || '').toLowerCase().indexOf('добавить') === -1; });
      var prizeBox = realPrizes.length
        ? '<div class="mbs-mixology-cup-prize-box">' + realPrizes.map(esc).join('<br>') + '</div>'
        : '<div class="mbs-mixology-cup-prize-box">Призовой фонд нужно добавить.</div>';
      return '<div class="mbs-mixology-cup-panel"><h4>Партнёры</h4>' + partnerCards + '<h4 style="margin-top:18px">Призы</h4>' + prizeBox + '</div>';
    }
    function findPartner(seasonId, partnerId) {
      var season = findSeason(seasonId);
      if (!season || !season.partners) return null;
      var partner = season.partners.find(function (item) {
        return item && typeof item === 'object' && item.id === partnerId;
      }) || null;
      return partner ? { season: season, partner: partner } : null;
    }
    function renderSeasonGalleryPanel(season) {
      if (!season.gallery) {
        return '<div class="mbs-mixology-cup-panel"><h4>Фотоальбом</h4>' +
          '<div class="mbs-mixology-cup-season-album__placeholder">' +
            '<strong style="color:#1F1F1F;font-size:16px">Фото сезона готовятся</strong>' +
            '<span style="display:block;margin-top:8px">' + esc(season.album || 'После подключения публичного альбома здесь появятся обложка и превью.') + '</span>' +
          '</div>' +
        '</div>';
      }
      var album = season.gallery;
      return '<div class="mbs-mixology-cup-panel"><h4>Фотоальбом</h4>' +
        '<div class="mbs-mixology-cup-season-album">' +
          '<button class="mbs-mixology-cup-season-album__cover" type="button" data-mixology-album="' + esc(album.seasonId) + '">' +
            '<img src="' + esc(photoUrl(album.coverUrl, 'w900')) + '" alt="' + esc(album.title) + '" loading="lazy">' +
            '<span>' + esc(album.photosCount) + ' фото</span>' +
          '</button>' +
          '<div><strong>' + esc(album.title) + '</strong><div style="color:#555;font-size:13px;font-weight:700;margin-top:4px">' + esc(album.dateLabel) + ' · ' + esc(album.winnersText || 'победители не указаны') + '</div></div>' +
          renderAlbumThumbs({ title: album.title, previewPhotos: album.previewPhotos }) +
          '<button class="mbs-mixology-cup-album-card__link" type="button" data-mixology-album="' + esc(album.seasonId) + '">Смотреть фото</button>' +
        '</div>' +
      '</div>';
    }
    function judgeLabelForScore(record, season, index) {
      var names = record && record.judgeNames || [];
      return names[index] || (season.judges || [])[index] || ('Судья ' + (index + 1));
    }
    function renderWinnerModal(data) {
      var season = data.season;
      var winner = data.winner;
      var judgeRows = (winner.judgeScores || []).map(function (score, index) {
        return '<div class="mbs-mixology-cup-score-row"><span>' + esc(judgeLabelForScore(winner, season, index)) + '</span><strong>' + formatScore(score) + '</strong></div>';
      }).join('');
      var criteriaRows = (winner.criteria || []).map(function (item) {
        return '<div class="mbs-mixology-cup-criteria-row"><span>' + esc(item.label) + '</span><strong>' + formatScore(item.value) + '</strong></div>';
      }).join('');
      var photos = (winner.drink && winner.drink.photos || []).length
        ? winner.drink.photos.map(function (photo) { return '<img src="' + esc(photo) + '" alt="" loading="lazy">'; }).join('')
        : '<div class="mbs-mixology-cup-modal__photo">Место для фотографий победителя, напитка и презентации</div>';
      winnerModalBody.innerHTML = '<div class="mbs-mixology-cup-modal__head">' +
        '<div class="mbs-mixology-cup__label">' + esc(season.title) + ' · ' + esc(winner.place) + ' место</div>' +
        '<h3>' + esc(winner.name) + '</h3>' +
        '<p>' + esc(winner.project || 'Проект нужно добавить') + ' · итог ' + formatScore(winner.total) + ' баллов</p>' +
      '</div>' +
      '<div class="mbs-mixology-cup-modal__grid">' +
        '<div class="mbs-mixology-cup-modal__panel"><h4>Фото и презентация</h4>' + photos + '</div>' +
        '<div class="mbs-mixology-cup-modal__panel"><h4>Напиток</h4><p style="margin:0;color:#555;font-size:14px;line-height:1.5;font-weight:700"><b style="color:#1F1F1F">' + esc(winner.drink && winner.drink.title || 'Название напитка добавить') + '</b><br>' + esc(winner.drink && winner.drink.presentation || 'Описание презентации нужно добавить.') + '</p></div>' +
        '<div class="mbs-mixology-cup-modal__panel"><h4>Баллы судей</h4><div class="mbs-mixology-cup-score-list">' + judgeRows + '</div></div>' +
        '<div class="mbs-mixology-cup-modal__panel"><h4>Средние оценки по критериям</h4><div class="mbs-mixology-cup-criteria-list">' + criteriaRows + '</div></div>' +
      '</div>';
      winnerModal.hidden = false;
    }
    function renderParticipantModal(seasonId, participantName) {
      var season = findSeason(seasonId);
      if (!season) return;
      var seasonParticipant = findSeasonParticipant(participantName, season) || { name: participantName, active: false };
      var publicParticipant = findPublicParticipant(participantName, season) || seasonParticipant;
      var result = findSeasonResult(participantName, season);
      var winner = findSeasonWinner(participantName, season);
      if (winner) {
        renderWinnerModal({ season: season, winner: winner });
        return;
      }
      var judgeRows = result && result.judgeScores ? result.judgeScores.map(function (score, index) {
        return '<div class="mbs-mixology-cup-score-row"><span>' + esc(judgeLabelForScore(result, season, index)) + '</span><strong>' + formatScore(score) + '</strong></div>';
      }).join('') : '<div class="mbs-mixology-cup-empty">Оценки судей не найдены</div>';
      var status = resultStatusText(seasonParticipant, result);
      var placeText = result && result.place ? result.place + ' место' : 'место не указано';
      var participantTitle = seasonParticipant.name || publicParticipant.name || participantName;
      var resultRows = [
        ['Статус сезона', seasonParticipant.active ? 'активный участник' : 'не пришёл'],
        ['Результат', result ? (result.status || 'результат есть') : 'результат не найден'],
        ['Судейская группа', result && result.judgeGroup ? result.judgeGroup : '—'],
        ['Место', result && result.place ? result.place + ' место' : '—'],
        ['Участий в Cup', publicParticipant.cupVisits || seasonParticipant.cupVisits || 0]
      ].map(function (item) {
        return '<div class="mbs-mixology-cup-criteria-row"><span>' + esc(item[0]) + '</span><strong>' + esc(item[1]) + '</strong></div>';
      }).join('');
      var photos = '<div class="mbs-mixology-cup-modal__photo">Место для фотографий участника, напитка и презентации</div>';
      var projectText = resultProjectText(result);
      var resultNote = result && result.note ? '<br><b style="color:#CC2841">' + esc(result.note) + '</b>' : '';
      winnerModalBody.innerHTML = '<div class="mbs-mixology-cup-modal__head">' +
        '<div class="mbs-mixology-cup__label">' + esc(season.title) + ' · ' + esc(status) + '</div>' +
        '<h3>' + esc(participantTitle) + '</h3>' +
        '<p>' + esc(projectText) + ' · ' + esc(placeText) + (result && result.total != null ? ' · итог ' + formatScore(result.total) + ' баллов' : '') + '</p>' +
      '</div>' +
      '<div class="mbs-mixology-cup-modal__grid">' +
        '<div class="mbs-mixology-cup-modal__panel"><h4>Фото и презентация</h4>' + photos + '</div>' +
        '<div class="mbs-mixology-cup-modal__panel"><h4>Напиток</h4><p style="margin:0;color:#555;font-size:14px;line-height:1.5;font-weight:700"><b style="color:#1F1F1F">Название напитка добавить</b><br>' + esc(projectText) + '. Описание презентации нужно добавить.' + resultNote + '</p></div>' +
        '<div class="mbs-mixology-cup-modal__panel"><h4>Баллы судей</h4><div class="mbs-mixology-cup-score-list">' + judgeRows + '</div></div>' +
        '<div class="mbs-mixology-cup-modal__panel"><h4>Итоги участника</h4><div class="mbs-mixology-cup-criteria-list">' + resultRows + '</div></div>' +
      '</div>';
      winnerModal.hidden = false;
    }
    function renderJudgeModal(seasonId, judgeIndex) {
      var season = findSeason(seasonId);
      if (!season) return;
      var index = Number(judgeIndex) || 0;
      var judgeName = (season.judges || [])[index] || ('Судья ' + (index + 1));
      var profile = (DATA.judgeProfiles || []).find(function (item) {
        return item.seasonId === season.id && namesMatch(item.name, judgeName);
      }) || { name: judgeName, role: 'Судья сезона', bio: 'Информация о судье будет добавлена.' };
      var rows = season.judging && season.judging.results ? season.judging.results.map(function (result) {
        var score = result.judgeScores ? result.judgeScores[index] : null;
        return '<tr class="mbs-mixology-cup-result-row" data-mixology-result-row="' + esc(season.id) + '" data-mixology-result-name="' + esc(result.name) + '">' +
          '<td>' + esc(result.name) + '<div style="color:#555;font-size:12px;font-weight:700">' + esc(result.project || 'проект не указан') + '</div></td>' +
          '<td>' + (result.place ? esc(result.place) + ' место' : '—') + '</td>' +
          '<td><strong>' + formatScore(score) + '</strong></td>' +
        '</tr>';
      }).join('') : '<tr><td colspan="3">Оценки пока не найдены</td></tr>';
      winnerModalBody.innerHTML = '<div class="mbs-mixology-cup-modal__head">' +
        '<div class="mbs-mixology-cup__label">' + esc(season.title) + '</div>' +
        '<h3>' + esc(profile.name) + '</h3>' +
        '<p>' + esc(profile.role || 'Судья сезона') + '. ' + esc(profile.bio || 'Информация о судье будет добавлена.') + '</p>' +
      '</div>' +
      '<div class="mbs-mixology-cup-modal__panel"><h4>Оценки участников</h4>' +
        '<table class="mbs-mixology-cup-results-table"><thead><tr><th>Участник</th><th>Место</th><th>Оценка</th></tr></thead><tbody>' + rows + '</tbody></table>' +
      '</div>';
      winnerModal.hidden = false;
    }
    function renderPartnerModal(seasonId, partnerId) {
      var found = findPartner(seasonId, partnerId);
      if (!found) return;
      var season = found.season;
      var partner = found.partner;
      var provided = (partner.provided || []).filter(Boolean);
      var providedRows = provided.length
        ? provided.map(function (item) { return '<li>' + esc(item) + '</li>'; }).join('')
        : '<li>Вклад партнёра нужно уточнить.</li>';
      winnerModalBody.innerHTML = '<div class="mbs-mixology-cup-modal__head">' +
        '<div class="mbs-mixology-cup__label">' + esc(season.title) + ' · партнёр чемпионата</div>' +
        '<h3>' + esc(partner.name) + '</h3>' +
        '<p>' + esc(partner.description || 'Информация о партнёре будет добавлена.') + '</p>' +
      '</div>' +
      '<div class="mbs-mixology-cup-modal__grid">' +
        '<div class="mbs-mixology-cup-modal__panel"><h4>Логотип</h4><div class="mbs-mixology-cup-partner-modal-logo"><img src="' + esc(partner.logo) + '" alt="' + esc(partner.name) + '" loading="lazy"></div><span class="mbs-mixology-cup-partner-modal-note">Партнёр чемпионата</span></div>' +
        '<div class="mbs-mixology-cup-modal__panel"><h4>Что предоставил партнёр</h4><ul style="margin:0;padding-left:18px;color:#555;font-size:14px;line-height:1.5;font-weight:800">' + providedRows + '</ul></div>' +
        '<div class="mbs-mixology-cup-modal__panel"><h4>Сезон</h4><div class="mbs-mixology-cup-score-list">' +
          '<div class="mbs-mixology-cup-score-row"><span>Чемпионат</span><strong>' + esc(season.title) + '</strong></div>' +
          '<div class="mbs-mixology-cup-score-row"><span>Дата</span><strong>' + dateRu(season.date) + '</strong></div>' +
        '</div></div>' +
        '<div class="mbs-mixology-cup-modal__panel"><h4>Источник</h4><p style="margin:0;color:#555;font-size:14px;line-height:1.5;font-weight:700">' + esc(partner.source || 'Данные взяты из публичного архива чемпионата.') + '</p></div>' +
      '</div>';
      winnerModal.hidden = false;
    }
    function closeWinnerModal() {
      winnerModal.hidden = true;
      winnerModalBody.innerHTML = '';
    }
    function applySeasonParticipantFilter(seasonId) {
      var panel = root.querySelector('[data-mixology-season-panel="' + seasonId + '"]');
      var list = root.querySelector('[data-mixology-season-list="' + seasonId + '"]');
      if (!panel || !list) return;
      var activeButton = panel.querySelector('[data-mixology-season-participant-filter="' + seasonId + '"].is-active');
      var filter = activeButton ? activeButton.getAttribute('data-filter') : 'all';
      var searchInput = panel.querySelector('[data-mixology-season-search="' + seasonId + '"]');
      var search = ((searchInput && searchInput.value) || '').trim().toLowerCase().replace(/ё/g, 'е');
      var shown = 0;
      list.querySelectorAll('[data-mixology-participant]').forEach(function (row) {
        var matchesFilter = filter === 'all'
          || (filter === 'noshow' && row.getAttribute('data-noshow') === '1')
          || (filter === 'judged' && row.getAttribute('data-judged') === '1')
          || (filter === 'top5' && row.getAttribute('data-top5') === '1')
          || (filter === 'prize' && row.getAttribute('data-prize') === '1');
        var matchesSearch = !search || (row.getAttribute('data-search') || '').indexOf(search) !== -1;
        var visible = matchesFilter && matchesSearch;
        row.classList.toggle('mbs-mixology-cup-hidden', !visible);
        if (visible) shown += 1;
      });
      var count = root.querySelector('[data-mixology-season-visible-count="' + seasonId + '"]');
      if (count) count.textContent = shown;
    }
    function applySeasonResultsFilter(seasonId) {
      var activeButton = root.querySelector('[data-mixology-result-filter="' + seasonId + '"].is-active');
      var filter = activeButton ? activeButton.getAttribute('data-filter') : 'top5';
      root.querySelectorAll('[data-mixology-result-row="' + seasonId + '"]').forEach(function (row) {
        var visible = filter === 'all'
          || (filter === 'top5' && row.getAttribute('data-top5') === '1')
          || (filter === 'disqualified' && row.getAttribute('data-disqualified') === '1')
          || (filter === 'absent' && row.getAttribute('data-absent') === '1');
        row.classList.toggle('mbs-mixology-cup-hidden', !visible);
      });
    }
    function bindSeasonInteractions() {
      root.addEventListener('input', function (event) {
        var search = event.target.closest('[data-mixology-season-search]');
        if (search) applySeasonParticipantFilter(search.getAttribute('data-mixology-season-search'));
      });
      root.addEventListener('click', function (event) {
        var participantFilter = event.target.closest('[data-mixology-season-participant-filter]');
        if (participantFilter) {
          var seasonId = participantFilter.getAttribute('data-mixology-season-participant-filter');
          root.querySelectorAll('[data-mixology-season-participant-filter="' + seasonId + '"]').forEach(function (button) {
            button.classList.toggle('is-active', button === participantFilter);
          });
          applySeasonParticipantFilter(seasonId);
          return;
        }
        var resultFilter = event.target.closest('[data-mixology-result-filter]');
        if (resultFilter) {
          var resultSeasonId = resultFilter.getAttribute('data-mixology-result-filter');
          root.querySelectorAll('[data-mixology-result-filter="' + resultSeasonId + '"]').forEach(function (button) {
            button.classList.toggle('is-active', button === resultFilter);
          });
          applySeasonResultsFilter(resultSeasonId);
        }
      });
    }
    function bindWinnerModal() {
      root.addEventListener('click', function (event) {
        var opener = event.target.closest('[data-mixology-winner]');
        if (opener && root.contains(opener)) {
          var found = findWinner(opener.getAttribute('data-mixology-winner'));
          if (found) renderWinnerModal(found);
          return;
        }
        var participantOpener = event.target.closest('[data-mixology-participant]');
        if (participantOpener && root.contains(participantOpener)) {
          renderParticipantModal(
            participantOpener.getAttribute('data-mixology-season-id'),
            participantOpener.getAttribute('data-mixology-participant')
          );
          return;
        }
        var resultOpener = event.target.closest('[data-mixology-result-row]');
        if (resultOpener && root.contains(resultOpener)) {
          renderParticipantModal(
            resultOpener.getAttribute('data-mixology-result-row'),
            resultOpener.getAttribute('data-mixology-result-name')
          );
          return;
        }
        var judgeOpener = event.target.closest('[data-mixology-judge]');
        if (judgeOpener && root.contains(judgeOpener)) {
          renderJudgeModal(
            judgeOpener.getAttribute('data-mixology-season-id'),
            judgeOpener.getAttribute('data-mixology-judge')
          );
          return;
        }
        var partnerOpener = event.target.closest('[data-mixology-partner]');
        if (partnerOpener && root.contains(partnerOpener)) {
          renderPartnerModal(
            partnerOpener.getAttribute('data-mixology-season-id'),
            partnerOpener.getAttribute('data-mixology-partner')
          );
          return;
        }
        if (event.target.closest('[data-mixology-close-winner]')) closeWinnerModal();
      });
      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && !winnerModal.hidden) closeWinnerModal();
      });
      return true;
    }
    function setText(selector, value) {
      root.querySelectorAll(selector).forEach(function (item) { item.textContent = value; });
    }
    function renderStats() {
      setText('[data-mixology-stat-seasons]', DATA.stats.seasons + ' сезона');
      setText('[data-mixology-stat-participants]', DATA.stats.uniqueParticipants);
      setText('[data-mixology-stat-multi]', DATA.stats.multiCup);
    }
    function renderSeasons() {
      var target = root.querySelector('[data-mixology-seasons-root]');
      target.innerHTML = DATA.seasons.map(function (season) {
        var albumText = season.gallery ? (season.gallery.photosCount + ' фото · ' + season.gallery.dateLabel) : season.album;
        return '<article class="mbs-mixology-cup-season-card">' +
          '<div class="mbs-mixology-cup-season-card__top">' +
            '<h3>' + esc(season.title) + '</h3>' +
            '<span class="mbs-mixology-cup-season-card__date">' + dateRu(season.date) + '</span>' +
          '</div>' +
          '<p style="margin:0;color:#555;font-size:15px;line-height:1.5;font-weight:600">' + esc(season.short) + '</p>' +
          '<div class="mbs-mixology-cup-season-card__stats">' +
            '<div class="mbs-mixology-cup-mini-stat"><strong>' + season.booked + '</strong><span>записей</span></div>' +
            '<div class="mbs-mixology-cup-mini-stat"><strong>' + season.visited + '</strong><span>активных</span></div>' +
            '<div class="mbs-mixology-cup-mini-stat"><strong>' + season.noShow + '</strong><span>неявок</span></div>' +
          '</div>' +
          '<div class="mbs-mixology-cup-season-card__meta">' +
            '<div><b>Победители:</b> ' + esc(winnerListText(season)) + '</div>' +
            '<div><b>Судьи:</b> ' + esc(judgeListText(season)) + '</div>' +
            '<div><b>Фото:</b> ' + esc(albumText) + '</div>' +
          '</div>' +
          '<a class="mbs-mixology-cup-season-card__link" href="#mbs-mixology-cup-season-' + esc(season.id) + '">Открыть сезон</a>' +
        '</article>';
      }).join('');
    }
    function renderTable() {
      var query = (searchEl.value || '').trim().toLowerCase();
      var season = seasonFilterEl.value || 'all';
      var experience = experienceFilterEl.value || 'all';
      var achievementFilter = achievementFilterEl.value || 'all';
      var rating = ratingFilterEl.value || 'community';
      var rows = sortRows(DATA.participants.filter(function (row) {
        var hay = (row.name + ' ' + (row.dates || []).join(' ') + ' ' + (row.bookingDates || []).join(' ') + ' ' + (row.judging && row.judging.project || '')).toLowerCase();
        return (!query || hay.indexOf(query) !== -1)
          && passesSeason(row, season)
          && passesExperience(row, experience)
          && passesAchievement(row, achievementFilter);
      }), rating);
      if (!rows.length) {
        tableRoot.innerHTML = '<div class="mbs-mixology-cup-empty">Ничего не найдено</div>';
        return;
      }
      tableRoot.innerHTML = '<table class="mbs-mixology-cup-table">' +
        '<thead><tr><th>№</th><th>Участник</th><th>Участий в Cup</th><th>Первый Cup</th><th>Сезоны</th><th>Достижения</th></tr></thead>' +
        '<tbody>' + rows.map(function (row, index) {
          var seasonBadges = (row.dates || []).length ? row.dates.map(yearPill).join('') : '<span class="mbs-mixology-cup-pill">запись</span>';
          return '<tr>' +
            '<td><span class="mbs-mixology-cup-rank">' + (index + 1) + '</span></td>' +
            '<td><span class="mbs-mixology-cup-name">' + esc(row.name) + '</span></td>' +
            '<td><span class="mbs-mixology-cup-count">' + row.cupVisits + '</span><span style="color:#555;font-size:12px;font-weight:800"> / ' + row.cupBookings + ' записей</span></td>' +
            '<td>' + (row.firstCupDate ? dateRu(row.firstCupDate) : '—') + '</td>' +
            '<td><div class="mbs-mixology-cup-years">' + seasonBadges + '</div></td>' +
            '<td>' + achievementPills(row) + '</td>' +
          '</tr>';
        }).join('') + '</tbody></table>';
    }
    function renderSeasonDetails() {
      var target = root.querySelector('[data-mixology-season-details-root]');
      target.innerHTML = DATA.seasons.map(function (season) {
        return '<article class="mbs-mixology-cup-season-detail__item" id="mbs-mixology-cup-season-' + esc(season.id) + '">' +
          '<div class="mbs-mixology-cup-season-detail__head">' +
            '<div><h3>' + esc(season.title) + '</h3><p>' + dateRu(season.date) + ', ' + esc(season.time) + '. ' + esc(season.short) + '</p></div>' +
            '<div class="mbs-mixology-cup-pills"><span class="mbs-mixology-cup-pill">' + season.booked + ' записей</span><span class="mbs-mixology-cup-pill is-red">' + season.visited + ' активных</span></div>' +
          '</div>' +
          '<div class="mbs-mixology-cup-season-detail__grid">' +
            renderSeasonParticipantPanel(season) +
            '<div class="mbs-mixology-cup-panel"><h4>Победители</h4>' + renderWinnerCards(season) + '</div>' +
            renderSeasonJudgesAndRules(season) +
            renderSeasonPartnersAndPrizes(season) +
            renderSeasonGalleryPanel(season) +
          '</div>' +
        '</article>';
      }).join('');
    }
    function init() {
      renderStats();
      renderSeasons();
      renderSeasonFilter();
      renderArchiveGallery();
      renderTable();
      renderSeasonDetails();
      bindWinnerModal();
      bindGalleryModal();
      bindSeasonInteractions();
      DATA.seasons.forEach(function (season) {
        applySeasonParticipantFilter(season.id);
        applySeasonResultsFilter(season.id);
      });
      searchEl.addEventListener('input', renderTable);
      seasonFilterEl.addEventListener('change', renderTable);
      experienceFilterEl.addEventListener('change', renderTable);
      achievementFilterEl.addEventListener('change', renderTable);
      ratingFilterEl.addEventListener('change', renderTable);
    }
    init();
  })();
</script>
`;
}

function buildIndex(hostedHtml) {
  return `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>MBS MIXOLOGY CUP — preview</title>
</head>
<body style="margin:0">
${hostedHtml}
</body>
</html>
`;
}

function buildLoader() {
  return `<!-- MBS MIXOLOGY CUP — hosted loader for Tilda -->
<div id="mbs-mixology-cup-hosted-root">
  <div style="padding:48px 20px;text-align:center;font-family:Mulish,Arial,sans-serif;color:#555;font-weight:800">
    Загружаем страницу MBS MIXOLOGY CUP...
  </div>
</div>
<script>
  (function () {
    var root = document.getElementById('mbs-mixology-cup-hosted-root');
    if (!root) return;
    var url = '${HOSTED_URL}';

    function runScripts(container) {
      Array.prototype.slice.call(container.querySelectorAll('script')).forEach(function (oldScript) {
        var script = document.createElement('script');
        Array.prototype.slice.call(oldScript.attributes).forEach(function (attr) {
          script.setAttribute(attr.name, attr.value);
        });
        script.text = oldScript.text || oldScript.textContent || '';
        oldScript.parentNode.replaceChild(script, oldScript);
      });
    }

    fetch(url, { cache: 'no-store' })
      .then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.text();
      })
      .then(function (html) {
        root.innerHTML = html;
        runScripts(root);
      })
      .catch(function (error) {
        console.error('[mbs-mixology-cup] hosted block load failed', error);
        root.innerHTML = '<div style="padding:48px 20px;text-align:center;font-family:Mulish,Arial,sans-serif;color:#CC2841;font-weight:900">Не удалось загрузить страницу MBS MIXOLOGY CUP. Обновите страницу или напишите нам в Telegram.</div>';
      });
  })();
</script>
`;
}

function buildProjectState(data) {
  return `# PROJECT_STATE — MBS MIXOLOGY CUP

Актуально на 2026-06-05.

## Назначение

Стартовая страница направления MBS MIXOLOGY CUP: история чемпионатов, сезоны, общая таблица участников, регламенты, судьи, партнёры, призы и фотоархивы.

## Архитектура

- \`mbs-mixology-cup.html\` — основной hosted HTML/CSS/JS.
- \`index.html\` — локальный preview для VS Code.
- \`tilda-loader.html\` — короткий loader для Tilda.
- Старые файлы участников и регламента оставлены как архив/источник, но не являются основной архитектурой.

Будущий hosted URL:

\`\`\`text
${HOSTED_URL}
\`\`\`

Будущий публичный JSON:

\`\`\`text
${PUBLIC_DATA_URL}
\`\`\`

Публичный источник фотоархивов:

\`\`\`text
${CHAMPIONSHIPS_GALLERY_URL}
\`\`\`

## Данные

- Сезонов в текущей базе: ${data.stats.seasons}
- Уникальных участников: ${data.stats.uniqueParticipants}
- Участников с 2+ активными Cup: ${data.stats.multiCup}
- Записаны, но без активного Cup: ${data.stats.bookedWithoutActiveCup}

Сезоны:

${data.seasons.map((season) => `- ${season.title}: ${formatDate(season.date)} ${season.time}, записей ${season.booked}, активных визитов ${season.visited}, неявок ${season.noShow}`).join('\n')}

## Что заполнено

- История трёх сезонов из yClients.
- Общая публичная таблица участников без телефонов, email, Telegram, yClients ID и платёжных данных.
- Фильтры таблицы: сезон, опыт участия, достижения, рейтинг.
- Рейтинг Cup #3 из вкладки \`Результаты\`: 28 строк, 25 готовых оценок, топ-5 и баллы трёх судей.
- Базовый регламент третьего сезона из локального файла.
- Победители и судейские итоги третьего сезона из Google Sheets.
- Партнёры третьего сезона: CafeStore, MHW-3Bomber, Вкусов Лаб, DRINK SUPPLY, Cocktail Design, Tasty Coffee, Инкава, Gourmet Style, [ЛЬЮ], rockets.coffee, THE WELDER CATHERINE.
- Подключены публичные фотоальбомы Cup #1 и Cup #2 из каталога чемпионатов: ${data.seasons.filter((season) => season.gallery).map((season) => `${season.title} — ${season.gallery.photosCount} фото`).join('; ')}.

## Функциональность таблицы

- Поиск по имени участника и проекту.
- Фильтр \`Сезон\`: все сезоны, Cup #1, Cup #2, Cup #3.
- Фильтр \`Опыт участия\`: любой опыт, первый Cup, 2+ Cup, 3 Cup.
- Фильтр \`Достижения\`: победители, призовые места, топ-5 Cup #3, есть судейские итоги.
- Рейтинг: комьюнити, по победам, по призовым местам, по баллам Cup #3, по количеству Cup.
- В строках таблицы выводятся публичные достижения: победа, призовое место, место Cup #3, баллы Cup #3, 2+ Cup.

## Что нужно дозаполнить

- Победители и судьи первых двух сезонов.
- Призы каждого сезона.
- Фото, напитки и презентации победителей.
- Фотоальбом Cup #3 и дополнительные медиа сезона.
- Регламенты первых двух сезонов.
- Отдельные страницы сезонов, если hub-структура будет утверждена.

## Проверки перед публикацией

- Открыть \`index.html\` в VS Code Preview.
- Проверить desktop и mobile.
- Проверить поиск, фильтры таблицы по сезону, опыту и достижениям.
- Проверить сортировку рейтинга по победам, призовым местам и баллам Cup #3.
- Проверить контрольные выборки: \`Cup #3\` показывает 30 записей, \`Призовые места\` — 3 участника, \`Топ-5 Cup #3\` — 5 участников.
- Проверить кликабельные карточки победителей Cup #3.
- Проверить карточки фотоальбомов и встроенный popup-просмотр фото.
- Проверить, что в публичных HTML нет телефонов, email, Telegram, токенов и внутренних ID.
- Если меняется \`tilda-loader.html\`, поднять query version в URL.
`;
}

function buildReadme(data) {
  return `# MBS MIXOLOGY CUP

Стартовая страница направления миксологии Московской школы бариста.

Актуально на \`2026-06-05\`.

## Назначение

Проект собирает историю MBS MIXOLOGY CUP в один hub:

- сезоны чемпионата;
- общая таблица участников;
- регламенты;
- судьи;
- победители;
- призы;
- партнёры;
- фотоархивы.

Это не разовый блок участников, а будущая главная страница направления миксологии.

## Архитектура

Используется схема по аналогии с \`barista-course/latte-art-battle\`:

1. В Tilda вставляется короткий loader из \`tilda-loader.html\`.
2. Loader загружает большой hosted HTML с API-домена.
3. Основная страница живёт в \`mbs-mixology-cup.html\`.
4. Для локального просмотра используется \`index.html\`.

Будущий hosted URL:

\`\`\`text
${HOSTED_URL}
\`\`\`

Будущий публичный JSON:

\`\`\`text
${PUBLIC_DATA_URL}
\`\`\`

Публичный источник фотоархивов:

\`\`\`text
${CHAMPIONSHIPS_GALLERY_URL}
\`\`\`

## Файлы

| Файл | Назначение |
|---|---|
| \`mbs-mixology-cup.html\` | Основной hosted HTML/CSS/JS |
| \`index.html\` | Локальный preview для VS Code |
| \`tilda-loader.html\` | Короткий loader для Tilda |
| \`PROJECT_STATE.md\` | Текущее состояние проекта |
| \`archive.html\` | Первая черновая архивная версия, legacy |
| \`tilda-block_participants*.html\` | Старые блоки участников, legacy |
| \`tilda-cup-ready.html\` | Старый готовый блок Cup, legacy |
| \`Регламент MBS Mixology Cup 3.*\` | Локальный регламент третьего сезона |

## Текущие данные

- Сезонов: ${data.stats.seasons}
- Уникальных участников: ${data.stats.uniqueParticipants}
- Участников с 2+ активными Cup: ${data.stats.multiCup}
- Записаны, но без активного Cup: ${data.stats.bookedWithoutActiveCup}

Сезоны:

${data.seasons.map((season) => `- ${season.title}: ${formatDate(season.date)} ${season.time}, записей ${season.booked}, активных визитов ${season.visited}, неявок ${season.noShow}`).join('\n')}

## Функциональность

- Таблица участников с поиском по имени и проекту.
- Фильтр \`Сезон\`: все сезоны, Cup #1, Cup #2, Cup #3.
- Фильтр \`Опыт участия\`: любой опыт, первый Cup, 2+ Cup, 3 Cup.
- Фильтр \`Достижения\`: победители, призовые места, топ-5 Cup #3, есть судейские итоги.
- Рейтинг: комьюнити, по победам, по призовым местам, по баллам Cup #3, по количеству Cup.
- Кликабельные карточки победителей Cup #3 с модальным окном.
- Публичный блок судейских итогов Cup #3: место, итоговые баллы и баллы судей.
- Карточки публичных фотоальбомов Cup #1 и Cup #2 с обложкой, количеством фото, preview и встроенным popup-просмотром фото.

## Источники данных

- yClients-выгрузка участников: \`reports/mbs-mixology-cup-clients-2026-06-05T18-04-17.clients.json\`.
- Судейские итоги Cup #3 перенесены в генератор из таблицы судейских листов. Сейчас это статический публичный срез, а не live-синхронизация с Google Sheets.
- Регламент Cup #3 взят из локальных файлов \`Регламент MBS Mixology Cup 3.*\`.
- Фотоархивы Cup #1 и Cup #2 взяты из публичного JSON каталога чемпионатов: \`${CHAMPIONSHIPS_GALLERY_URL}\`.

## Публичные данные

В HTML не должны попадать:

- телефоны;
- email;
- Telegram;
- токены;
- yClients ID;
- record ID;
- платежные данные.

На странице можно показывать:

- имя участника;
- проект участника, если он есть в публичной судейской таблице;
- годы участия;
- количество активных Cup;
- количество активных визитов в школу;
- место, итоговые баллы, баллы судей и публичные критерии судейства Cup #3;
- публичные итоги судейства и места победителей;
- агрегированные показатели сезонов.

## Что нужно дозаполнить

- Победители и судьи первых двух сезонов.
- Призы всех сезонов.
- Партнёры первых двух сезонов.
- Фото, напитки и презентации победителей.
- Фотоальбом Cup #3.
- Регламенты первых двух сезонов.

## Проверка

\`\`\`bash
# Проверить JS внутри HTML
node -e "const fs=require('fs'); for (const file of ['mbs-mixology-cup.html','index.html','tilda-loader.html']) { const html=fs.readFileSync(file,'utf8'); const scripts=[...html.matchAll(/<script>([\\\\s\\\\S]*?)<\\\\/script>/g)].map(m=>m[1]); for (const script of scripts) new Function(script); console.log(file + ': scripts ok ' + scripts.length); }"
\`\`\`

Контрольные выборки после сборки:

- \`Cup #3\` в фильтре сезона: 30 записей.
- \`Призовые места\` в фильтре достижений: 3 участника.
- \`Топ-5 Cup #3\` в фильтре достижений: 5 участников.
- Рейтинг \`По баллам Cup #3\` начинает список с участника на 1 месте Cup #3.

Локально открыть:

\`\`\`text
index.html
\`\`\`

## Публикация

После утверждения версии:

1. Загрузить \`mbs-mixology-cup.html\` на сервер как \`/var/www/html/api/mbs-mixology-cup.html\`.
2. Проверить \`https://api.barista-school.ru/api/mbs-mixology-cup.html\`.
3. Вставить \`tilda-loader.html\` в HTML-блок Tilda.
4. При изменениях поднимать query version в \`tilda-loader.html\`.
`;
}

function writeFile(fileName, content) {
  fs.writeFileSync(path.join(TARGET_DIR, fileName), content, 'utf8');
}

function main() {
  const participants = normalizeParticipants(readJson(REPORT_PATH));
  const data = buildData(participants);
  const hostedHtml = html(data);

  fs.mkdirSync(TARGET_DIR, { recursive: true });
  writeFile(HOSTED_HTML_NAME, hostedHtml);
  writeFile('index.html', buildIndex(hostedHtml));
  writeFile('tilda-loader.html', buildLoader());
  writeFile('PROJECT_STATE.md', buildProjectState(data));
  writeFile('README.md', buildReadme(data));

  console.log(JSON.stringify({
    ok: true,
    targetDir: TARGET_DIR,
    files: [HOSTED_HTML_NAME, 'index.html', 'tilda-loader.html', 'PROJECT_STATE.md', 'README.md'],
    stats: data.stats
  }, null, 2));
}

main();
