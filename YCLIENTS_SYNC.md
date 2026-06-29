# 🔗 YClients Sync — Система динамической синхронизации записи на мастер-классы

> **Назначение:** Шаблон и инструкция для подключения автоматической синхронизации  
> кнопок записи и дат на любой лендинг МШБ через YClients API.  
> Подключается один раз — дальше всё работает само.

---

## 🗺 Быстрая навигация

| Раздел | Описание |
|--------|----------|
| [Как это работает](#-как-это-работает) | Общая схема и логика |
| [Инфраструктура](#-инфраструктура-на-сервере) | Что развёрнуто на сервере |
| [JS-виджет — шаблон](#-js-виджет--шаблон) | Готовый код для вставки в блок |
| [Пошаговое подключение](#-пошаговое-подключение-нового-мастер-класса) | Инструкция для нового события |
| [API-сервис](#-api-сервис-webinar-budget-sync) | Как устроен бэкенд |
| [Диагностика сайта](#-диагностика-доступности-сайта-baristaschoolru) | Мониторинг Tilda, API и проблем загрузки |
| [Добавить новый сервис](#-добавить-синхронизацию-для-нового-мастер-класса) | Масштабирование |
| [Готовые реализации](#-готовые-реализации) | Что уже подключено |
| [Troubleshooting](#-troubleshooting) | Что делать если не работает |

---

## ⚙️ Как это работает

### Общая схема

```
YClients API                  Наш сервер (159.194.202.120)         Лендинг
─────────────────             ─────────────────────────────        ──────────────────────────
Список активностей   →→→     FastAPI-сервис (Python)       →→→   JS-виджет в HTML-блоке
(дата, ссылка,               /opt/<имя-сервиса>/                   fetch() при загрузке страницы
 заполненность)              PM2 + nginx proxy                     обновляет кнопки и дату
                             api.barista-school.ru/api/v1/...
```

### Логика на странице

```
Страница загружается
        ↓
JS делает GET /api/v1/<slug>/next
        ↓
        ├── found: true, isPast: false  →  кнопки = YClients-ссылка
        │                                  бейдж даты = «22 мая — 17:30»
        │
        └── found: false ИЛИ isPast: true →  кнопки = #consalt (попап формы Tilda)
                                             текст кнопок = «Добавиться в лист ожидания»
                                             бейдж даты скрывается
```

### Что меняется автоматически (без участия человека)

| Событие | Что происходит |
|---------|---------------|
| Вебинар запланирован | Кнопки ведут в YClients, дата показана |
| Вебинар прошёл | Кнопки → `#consalt`, дата скрыта |
| Создан новый вебинар в YClients | Сервис найдёт его автоматически |
| Дата перенесена в YClients | Бейдж обновится на странице автоматически |

---

## 🖥 Инфраструктура на сервере

| Параметр | Значение |
|----------|----------|
| **Сервер** | `root@159.194.202.120` |
| **SSH-ключ** | `~/.ssh/copilot_beget_temp/id_ed25519` |
| **Домен** | `api.barista-school.ru` (через nginx → `159-194-202-120.sslip.io`) |
| **Nginx конфиг** | `/etc/nginx/sites-enabled/yclients-dashboard` |
| **PM2** | Управление процессами |
| **Python venv** | В каждом сервисе свой `.venv/` |

### Nginx — шаблон location для нового сервиса

Добавить в `/etc/nginx/sites-enabled/yclients-dashboard` **перед** `location /`:

```nginx
location /api/v1/<slug>/ {
    proxy_pass http://127.0.0.1:<PORT>;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    add_header Access-Control-Allow-Origin "*" always;
}
```

После добавления:
```bash
nginx -t && systemctl reload nginx
```

### Занятые порты

| Сервис | Порт | PM2 id |
|--------|------|--------|
| `yclients-dashboard` (Node.js) | 3010 | 0 |
| `webinar-budget-sync` | 8085 | 2 |
| Следующий сервис | 8086 | 3 |
| ... | 8087+ | ... |

---

## 📦 JS-виджет — шаблон

Вставлять в конце каждого HTML-блока, где есть кнопка «Записаться».  
Каждый блок управляет **только своими** кнопками (не трогает другие блоки).

### Блок с кнопкой и бейджем даты (Hero)

```html
<script>
(function() {
  var API = 'https://api.barista-school.ru/api/v1/<SLUG>/next';
  fetch(API).then(function(r) { return r.json(); }).then(function(d) {
    var badge    = document.getElementById('<DATE-BADGE-ID>');
    var badgeWrap = badge ? badge.closest('.<BADGE-WRAPPER-CLASS>') : null;
    var btns     = document.querySelectorAll('.<BTN-CLASS>');
    if (d.found && !d.isPast) {
      if (badge) badge.textContent = d.dateLabel + ' — ' + d.timeLabel;
      btns.forEach(function(btn) { btn.href = d.bookingUrl; });
    } else {
      if (badgeWrap) badgeWrap.style.display = 'none';
      btns.forEach(function(btn) {
        btn.href = '#consalt';
        btn.textContent = 'Добавиться в лист ожидания';
      });
    }
  }).catch(function() {});
})();
</script>
```

### Блок только с кнопкой (Price, Final CTA)

```html
<script>
(function() {
  var API = 'https://api.barista-school.ru/api/v1/<SLUG>/next';
  fetch(API).then(function(r) { return r.json(); }).then(function(d) {
    var btns = document.querySelectorAll('.<BTN-CLASS>');
    if (d.found && !d.isPast) {
      btns.forEach(function(btn) { btn.href = d.bookingUrl; });
    } else {
      btns.forEach(function(btn) {
        btn.href = '#consalt';
        btn.textContent = btn.classList.contains('mbs-wm-buy__btn')
          ? 'Лист ожидания'
          : 'Добавиться в лист ожидания';
      });
    }
  }).catch(function() {});
})();
</script>
```

### Переменные для замены

| Placeholder | Что подставить | Пример |
|-------------|---------------|--------|
| `<SLUG>` | Идентификатор сервиса в URL | `webinar-budget` |
| `<DATE-BADGE-ID>` | `id` элемента с датой | `wm-date-badge` |
| `<BADGE-WRAPPER-CLASS>` | CSS-класс обёртки бейджа | `mbs-wm-hero__badge` |
| `<BTN-CLASS>` | CSS-класс кнопки в этом блоке | `mbs-wm-hero__btn` |

### Требования к кнопке в HTML

```html
<a
  href="https://b829827.yclients.com/..."   ← fallback: прямая YClients-ссылка
  class="<BTN-CLASS>"
  target="_blank"
  rel="noopener noreferrer"
>Записаться</a>
```

> ⚠️ `target="_blank"` обязателен — иначе пользователь уходит со страницы лендинга.  
> `href` по умолчанию = реальная YClients-ссылка — кнопка работает даже если API недоступен.

---

## 🚀 Пошаговое подключение нового мастер-класса

### Шаг 1 — Получить данные из YClients

```python
import requests

COMPANY_ID  = 453962
USER_TOKEN  = '<из .env на сервере>'
PARTNER_TOKEN = '<из .env на сервере>'

headers = {
    'Authorization': f'Bearer {PARTNER_TOKEN}, User {USER_TOKEN}',
    'Accept': 'application/vnd.api.v2+json',
}

# Получить список активностей
r = requests.get(
    f'https://api.yclients.com/api/v1/activity/{COMPANY_ID}/search',
    headers=headers,
    params={'count': 20, 'page': 1}
)
for item in r.json()['data']:
    print(item['id'], item['service_id'], item['date'], item['title'])
```

Запомнить:
- `company_id` — общий для МШБ: **453962**
- `service_id` — уникальный для каждого вида мастер-класса
- `activity_id` — уникальный для конкретного события (меняется при переносе!)

> ⚠️ `activity_id` меняется при каждом переносе даты.  
> Поэтому сервис ищет по `service_id` (тип мастер-класса) — а не по конкретному `activity_id`.

### Шаг 2 — Создать сервис на сервере

```bash
# Структура папки
/opt/<название>-sync/
├── app/
│   ├── config.py          ← настройки (порт, company_id, service_id, keyword)
│   ├── yclients_client.py ← запрос к YClients API
│   ├── service.py         ← бизнес-логика (фильтр, сортировка, формирование ответа)
│   └── main.py            ← FastAPI: GET /api/v1/<slug>/next  +  GET /health
├── .env                   ← токены (не в git!)
├── .env.example           ← шаблон без секретов
└── requirements.txt       ← fastapi uvicorn requests pydantic pydantic-settings pytz
```

Скопировать из существующего сервиса:
```bash
cp -r /opt/webinar-budget-sync/ /opt/<новый>-sync/
```

Затем обновить в `app/config.py`:
```python
service_id: int = <новый service_id>
keyword: str = '<ключевое слово из названия>'
port: int = 8086  # следующий свободный порт
```

### Шаг 3 — Установить зависимости и запустить

```bash
cd /opt/<новый>-sync
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt

# Запустить через PM2 (важно: --interpreter none + путь к python в venv)
pm2 start .venv/bin/python \
  --name <новый>-sync \
  --interpreter none \
  -- -m uvicorn app.main:app --host 0.0.0.0 --port 8086

pm2 save
```

> ⚠️ **Частая ошибка:** `pm2 start uvicorn ...` — PM2 пробует запустить Python-файл как Node.js → `SyntaxError`.  
> Правильно: `pm2 start .venv/bin/python --interpreter none -- -m uvicorn ...`

### Шаг 4 — Добавить nginx location

```bash
# Вставить перед location / в конфиге nginx
sed -i 's|location / {|location /api/v1/<slug>/ {\n        proxy_pass http://127.0.0.1:8086;\n        ...\n    }\n\n    location / {|' \
  /etc/nginx/sites-enabled/yclients-dashboard

nginx -t && systemctl reload nginx
```

### Шаг 5 — Проверить

```bash
# С сервера
curl http://127.0.0.1:8086/health
curl http://127.0.0.1:8086/api/v1/<slug>/next

# Публично
curl https://api.barista-school.ru/api/v1/<slug>/next
```

Ожидаемый ответ:
```json
{
  "found": true,
  "isPast": false,
  "dateLabel": "22 мая",
  "timeLabel": "17:30",
  "bookingUrl": "https://b829827.yclients.com/company/453962/activity/info/38898153?o=...",
  "activityId": 38898153,
  "activityDate": "2026-05-22",
  "title": "Название мастер-класса"
}
```

### Шаг 6 — Вставить виджет в HTML-блоки

1. В каждом блоке с кнопкой «Записаться»:
   - Добавить `id="<slug>-date-badge"` к элементу с датой (только в Hero)
   - Добавить уникальный `id` к кнопке
   - Поставить в `href` прямую YClients-ссылку + `target="_blank" rel="noopener noreferrer"`
   - Вставить JS-виджет из шаблона выше

2. Синхронизировать изменения в `index.html` (для Vercel-превью)

3. Задеплоить на Vercel:
```bash
cd /path/to/project
vercel --prod --yes --name <vercel-project-name>
```

---

## 🔧 API-сервис `webinar-budget-sync`

Исходники: `/Users/romansuslin_1/Downloads/All_Code/schedule-online/webinar-budget-sync/`

### Файлы

| Файл | Описание |
|------|----------|
| `app/config.py` | `Settings`: port, company_id, service_id, keyword, lookahead_days |
| `app/yclients_client.py` | GET `/activity/{company_id}/search` с auth `Bearer + User` |
| `app/service.py` | Фильтр по keyword, сортировка по дате, формирование ответа |
| `app/main.py` | FastAPI: `GET /api/v1/webinar-budget/next` + `GET /health`, CORS |
| `.env` | `YCLIENTS_USER_TOKEN`, `YCLIENTS_PARTNER_TOKEN` |
| `requirements.txt` | fastapi, uvicorn, requests, pydantic, pydantic-settings, pytz |

### Формат ответа `/api/v1/webinar-budget/next`

```typescript
{
  found:       boolean     // найдено ли ближайшее событие
  isPast:      boolean     // прошло ли оно уже
  dateLabel:   string      // «22 мая»
  timeLabel:   string      // «17:30»
  bookingUrl:  string      // прямая ссылка YClients
  activityId:  number      // id конкретного события
  activityDate: string     // «2026-05-22»
  title:       string      // название из YClients
}
```

### Формула bookingUrl

```
https://b829827.yclients.com/company/{company_id}/activity/info/{activity_id}?o=aid{activity_id}c1
```

---

## ➕ Добавить синхронизацию для нового мастер-класса

Чеклист:

- [ ] Найти `service_id` нового вида мастер-класса в YClients API
- [ ] Придумать `<slug>` (латиница, дефисы) — например `barista-basics`, `espresso-pro`
- [ ] Выбрать свободный порт (8086, 8087, ...)
- [ ] Скопировать `/opt/webinar-budget-sync/` → `/opt/<slug>-sync/`
- [ ] Обновить `config.py`: `service_id`, `keyword`, `port`
- [ ] Запустить через PM2 (см. Шаг 3)
- [ ] Добавить nginx location (см. Шаг 4)
- [ ] Проверить `curl` (см. Шаг 5)
- [ ] Добавить JS-виджет в блоки лендинга (см. Шаг 6)
- [ ] Задеплоить Vercel-превью
- [ ] Обновить таблицу занятых портов в этом файле

---

## ✅ Готовые реализации

### `webinar-budget` — Мастер-класс «Бюджет и финансовая модель кофейни»

| Параметр | Значение |
|----------|----------|
| **Endpoint** | `https://api.barista-school.ru/api/v1/webinar-budget/next` |
| **Сервис на сервере** | `/opt/webinar-budget-sync/` |
| **PM2** | id=2, port=8085 |
| **company_id** | 453962 |
| **service_id** | 14042335 |
| **Ключевое слово** | `бюджет` |
| **Лендинг (Vercel)** | https://home-barista-online.vercel.app |
| **Лендинг (Tilda)** | https://baristaschool.ru/master_open |
| **Исходники блоков** | `barista-course/Online_webinar_open_cafe_money/blocks/` |
| **Кнопки** | `.mbs-wm-hero__btn`, `.mbs-wm-buy__btn`, `.mbs-wm-cta__btn` |
| **Бейдж даты** | `id="wm-date-badge"` |

---

### `/excu` — Экскурсия на обжарочное производство

Страница использует не endpoint `/api/v1/<slug>/next`, а публичный JSON со списком планируемых экскурсий.

| Параметр | Значение |
|----------|----------|
| **Страница** | `https://baristaschool.ru/excu` |
| **Исходник** | `barista-course/excu/tilda-block.html` |
| **Локальное превью** | `barista-course/excu/index.html` |
| **Основной endpoint** | `https://api.barista-school.ru/api/excursions.json` |
| **Fallback endpoint** | `https://159-194-202-120.sslip.io/api-fallback/api/excursions.json` |
| **service_id** | 14093497 |
| **company_id** | 453962 |
| **Механика записи** | кнопка берёт `booking_url` конкретного события |

Frontend-правила:

- Не привязываться к конкретному `activity_id`: он меняется при переносе события.
- Брать события из массива `excursions`, фильтровать прошедшие, сортировать по дате/времени.
- `booking_url` перед вставкой в кнопку проверять: только `https` и домены yClients.
- Если мест нет, ссылки нет или ссылка не прошла проверку, кнопка ведёт в Telegram.
- Если основной endpoint недоступен, пробовать fallback endpoint.
- Если оба endpoint недоступны, сначала использовать свежий кэш `localStorage`; затем stale-кэш до 12 часов; если кэша нет, показывать error-state с кнопками «Попробовать ещё раз», «Лист ожидания» и Telegram.
- Внешние ссылки открывать с `target="_blank" rel="noopener noreferrer"`.

SEO на странице:

- В Tilda Page Settings задать `Title`, `Description`, `Canonical URL`, social title/description/image.
- В HTML-блоке держать JSON-LD `WebPage`, `Service`, `FAQPage`, `BreadcrumbList`.
- После загрузки расписания формировать динамический JSON-LD `Event` только для планируемых событий.

---

### `open-coffeeshop` — Курс «Открытие кофейни с нуля»

> ⚠️ Эта страница **не использует YClients-синхронизацию**.  
> Это индивидуальный курс-консультация (не мероприятие по расписанию), поэтому:
> - Кнопки «Оставить заявку» → `href="#consalt"` (попап формы Tilda)
> - Кнопки покупки → `href="#order:Название=Цена"` (корзина Tilda)

| Параметр | Значение |
|----------|----------|
| **Лендинг (Vercel)** | https://open-coffeeshop.vercel.app |
| **Canonical (Tilda)** | https://baristaschool.ru/open_coffeeshop |
| **Исходник** | `barista-course/open-coffeeshop/index.html` |
| **Тарифы** | 70 000 ₽ (1 участник) · 140 000 ₽ (2 участника) |
| **Кнопки заявки** | `href="#consalt"` |
| **Кнопки покупки** | `href="#order:Курс Открытие кофейни 1 участник=70000"` |
| **Schema.org** | `@type: Course`, offers.price: 70000 |

---

## ☕ Цифровые каппинги: ЛК + Dashboard + yClients

### Назначение

Цифровые каппинги связывают три источника:

- yClients отвечает за расписание, запись участника и историю посещений;
- `YClients-Dashboard` отвечает за `/photo-albums`, настройки оценочного листа, лоты, `lot.meta`, ответы и агрегаты;
- `bitrix-tools` отвечает за личный кабинет, Tilda hosted fragments и авторизацию участника.

### Где что лежит

| Часть | Проект / путь | Что делает |
|---|---|---|
| Dashboard каппингов | `/Users/Romka/Downloads/All_Code/YClients-Dashboard` | `/photo-albums`, `src/cupping-admin-service.js`, `GET /api/public/cuppings*` |
| Личный кабинет | `/Users/Romka/Downloads/All_Code/bitrix-tools/templates/gift-certificates/source/cabinet-gift/` | Вкладка `Каппинги`, компактные карточки, попап деталей |
| Оценочный лист | `/Users/Romka/Downloads/All_Code/bitrix-tools/templates/gift-certificates/cupping-score-sheet-tilda-block.html` | Анкета, оценка лотов, отправка результата |
| Tilda loader | `cupping-score-sheet-tilda-loader.html` | Загружает hosted fragment на `/cupping_score_sheet` |
| Knowledge base Dashboard | `YClients-Dashboard/CUPPING_ADMIN_ROADMAP.md` | Архитектура цифровых каппингов |
| Knowledge base ЛК | `bitrix-tools/PROJECT_CONTEXT.md`, `PROJECT_MAP.md`, `templates/gift-certificates/ROADMAP.md` | Пользовательский контур и файлы ЛК |

### Data flow

```text
yClients records/history
  + public events.json
  + Dashboard /photo-albums
    ↓
/cabinet/gift → вкладка Каппинги
    ↓
GET https://api.barista-school.ru/api/public/cuppings/portal
    ↓ proxy
реальный Dashboard https://159-194-202-120.sslip.io
```

Ключевая связка: `photo album id = cupping_id = event_id`.

### Правила

- Источник правды по зерну и `lot.meta` — Dashboard `/photo-albums`, не публичное расписание.
- `GET /api/public/cuppings/portal` требует Bearer token ЛК и не отдаёт чужие анкеты, телефоны, email и сырые submissions.
- `canScore=true` только если каппинг `open` и сегодня день каппинга по Москве.
- Групповые итоги в ЛК показывать только после статуса `published`.
- Если пользователь уже записан на будущий каппинг, кнопку `Записаться` не показывать; показывать `Вы записаны`.
- Если лотов нет, текст заглушки: `Выбираем зерно вместе с обжарщиком`.
- В карточке ЛК оставлять дату, название, обжарочную компанию, статус и действия; описание и зерно открывать в попапе.
- Production proxy `https://api.barista-school.ru/api/public/cuppings/*` должен идти на `https://159-194-202-120.sslip.io`, не на сервер `5.35.93.225`.

---

## 🩺 Диагностика доступности сайта baristaschool.ru

### Назначение

Мониторинг нужен, чтобы отделять реальные проблемы сайта от разовых сбоев Tilda/CDN/API/браузера:

- страницы Tilda грузятся частично или не догружают блоки;
- виджеты остаются в skeleton/loading;
- внешние JS/CSS не загрузились;
- API-запросы зависли или вернули ошибку;
- серверная проверка не дождалась ответа от страницы.

### Где смотреть

| Что | Где |
|-----|-----|
| Dashboard | `https://159-194-202-120.sslip.io/site-health` |
| API отчёт | `https://api.barista-school.ru/site-health/report` |
| Browser monitor | `https://api.barista-school.ru/site-health/monitor.js` |
| Лог на сервере | `/root/app/data/site-health.jsonl` |
| API проект | `/Users/Romka/Downloads/All_Code/yclients-reviews-widget` |
| Dashboard проект | `/Users/Romka/Downloads/All_Code/YClients-Dashboard` |
| API PM2 process | `barista-reviews` |
| Dashboard PM2 process | `yclients-dashboard` |

`/site-health/report` закрыт админ-ключом. Ключ хранится только в серверных `.env`, не вставлять его в Tilda и не коммитить.

### Код в Tilda

В глобальном `<head>` Tilda добавлен лёгкий монитор:

```html
<script defer src="https://api.barista-school.ru/site-health/monitor.js"></script>
```

Он должен стоять в настройках сайта, а не в каждом отдельном блоке.

### Что логируется

| Тип события | Значение |
|-------------|----------|
| `page_load` | Страница загрузилась в браузере |
| `slow_page` | Страница грузилась дольше порога |
| `resource_error` | Не загрузился важный JS/CSS/image |
| `js_error` | Ошибка JavaScript на странице |
| `promise_error` | Необработанная Promise-ошибка |
| `fetch_problem` | API-запрос вернул ошибку или был медленным |
| `fetch_error` | API-запрос упал по сети/timeout |
| `slow_resource` | Важный ресурс грузился медленно |
| `widget_problem` | Виджет долго пустой, в skeleton или в состоянии ошибки |
| `server_check` | Серверная проверка URL |
| `server_check_error` | Серверная проверка не получила ответ |

### Серверные проверки

Core/API проверяются раз в минуту:

- `https://baristaschool.ru/`;
- `https://baristaschool.ru/coffee_club`;
- `https://baristaschool.ru/excu`;
- `https://baristaschool.ru/latte_art_battle`;
- `https://api.barista-school.ru/health`;
- `https://api.barista-school.ru/widgets/reviews.js`;
- `https://api.barista-school.ru/static/karta-uchenikov/karta-uchenikov.js`.

Основные услуги проверяются раз в 15 минут:

- `/barista_courses`;
- `/probarista`;
- `/latte-art`;
- `/expert`;
- `/alternative`;
- `/sence`;
- `/group`;
- `/master_open`;
- `/business-intensive`;
- `/open_coffeeshop`;
- `/bar_engineering`;
- `/regions`;
- `/sca_menu`;
- `/unique_menu`;
- `/summer_drinks`;
- `/home_barista_online`;
- `/home_barista`;
- `/barista_3`;
- `/coffie_team`;
- `/coffee_club`;
- `/capping`;
- `/tea_capping`;
- `/master_doma`;
- `/casino`;
- `/excu`;
- `/latte_art_battle`;
- `/mbs_mixology_cup`.

### Как читать проблемы

`This operation was aborted` с длительностью около `10 с` означает, что серверная проверка не дождалась ответа до timeout. Это не равно HTTP 500.

Текущая логика мониторинга:

- timeout проверки: `SITE_HEALTH_CHECK_TIMEOUT_MS`, по умолчанию `10000`;
- при `abort/timeout` монитор делает одну повторную попытку через `SITE_HEALTH_RETRY_DELAY_MS`, по умолчанию `750`;
- если повторная попытка успешна, событие пишется как `server_check` с `attempts: 2` и `detail: retry_ok`;
- если после повторной попытки снова ошибка, это уже более сильный сигнал реальной проблемы;
- core и service cron защищены от наложения: если предыдущий обход ещё идёт, следующий запуск этой группы пропускается.

Лог ротируется при 20 МБ в `site-health.jsonl.1`, поэтому он не растёт бесконечно.

### Инцидент 08.06.2026

В логе были пачки `server_check_error` для:

- `/`;
- `/coffee_club`;
- `/excu`;
- `/latte_art_battle`.

Симптом: `This operation was aborted`, длительность около `10 с`.

Проверка показала:

- это не HTTP 500;
- API в это же время отвечал;
- ручная проверка с API-сервера позже вернула `200` за десятки миллисекунд;
- после добавления retry свежие проверки стали зелёными.

Вывод: событие похоже на краткий сетевой/Tilda/CDN timeout, а не на постоянное падение сайта. Если новые ошибки будут появляться уже с `attempts: 2`, их нужно считать более серьёзными.

### Инцидент 09.06.2026 — Beget, ТСПУ и TLSv1.3

Симптомы:

- `https://baristaschool.ru` открывался частично, но блоки с серверными виджетами зависали;
- не грузились отзывы, тренеры, карта учеников, онлайн-расписания и фотоальбомы;
- `https://api.barista-school.ru/` не открывался в Safari и Chrome;
- `https://5.35.93.225/` отвечал, а домен `api.barista-school.ru` с SNI зависал на TLS-handshake;
- с самого API-сервера `curl https://api.barista-school.ru/` работал.

В комментариях Beget под постом о частичной недоступности ресурсов сообщили, что проблема плавающая, зависит от провайдера/региона/браузера и связана с обновлением настроек ТСПУ. Как временный обход Beget предложил перейти на `TLSv1.2` или версию ниже вместо `TLSv1.3`.

Что было сделано:

- на сервере `root@5.35.93.225` для `api.barista-school.ru` отключён `TLSv1.3`;
- создан отдельный SSL include `/etc/letsencrypt/options-ssl-nginx-tls12.conf`;
- в `/etc/nginx/sites-enabled/barista-api` подключён этот include только для API-домена;
- глобальный Certbot include `/etc/letsencrypt/options-ssl-nginx.conf` не менялся;
- backup nginx-конфига сохранён в `/root/barista-api.bak-20260609-tls12`.

Проверка после правки:

```bash
nginx -t
systemctl reload nginx
curl -vkI https://api.barista-school.ru/
curl -vkI --tlsv1.2 https://api.barista-school.ru/
openssl s_client -connect api.barista-school.ru:443 -servername api.barista-school.ru -tls1_2 < /dev/null
```

Ожидаемый результат:

- `https://api.barista-school.ru/` возвращает `200 OK`;
- handshake идёт по `TLSv1.2`;
- `TLSv1.3` получает `alert protocol version`;
- ресурсы виджетов `/api/trainers.json`, `/trainers-widget.js`, `/widgets/reviews.js`, `/api/cuppings.json` отвечают `200 OK`.

Если проблема повторится:

1. Сначала проверить, открывается ли `https://api.barista-school.ru/` из обычного браузера.
2. Сравнить доступ по IP и по домену:
   ```bash
   curl -vkI https://5.35.93.225/ -H 'Host: api.barista-school.ru'
   curl -vkI --connect-to api.barista-school.ru:443:5.35.93.225:443 https://api.barista-school.ru/
   ```
3. Если IP отвечает, а домен с SNI зависает, это снова сетевой/TLS/SNI-уровень, а не ошибка JS-виджета.
4. Проверить, не вернулся ли `TLSv1.3` после certbot/nginx-обновлений:
   ```bash
   nginx -T 2>/dev/null | grep -n "ssl_protocols"
   ```
5. Не удалять fallback-домены из Tilda-блоков: они нужны как страховка при подобных сетевых сбоях.

Важно: не подключать критичные скрипты с `api.barista-school.ru` через `defer` в глобальном `<head>` Tilda без fallback. Если TLS-запрос зависнет, он может задержать `DOMContentLoaded` и сломать запуск других блоков.

---

## 🛠 Troubleshooting

### PM2 сразу падает (14 restarts → stopped)

**Причина:** PM2 пытается выполнить Python-файл как Node.js-скрипт.

**Диагностика:**
```bash
pm2 logs <имя> --lines 20 --nostream
# Увидишь: SyntaxError: Invalid or unexpected token
```

**Решение:**
```bash
pm2 delete <имя>
cd /opt/<имя>-sync
pm2 start .venv/bin/python --name <имя> --interpreter none \
  -- -m uvicorn app.main:app --host 0.0.0.0 --port <PORT>
```

---

### curl возвращает пустой ответ или 502

1. Проверить статус процесса: `pm2 status`
2. Проверить порт: `curl http://127.0.0.1:<PORT>/health`
3. Проверить nginx: `nginx -t` и `grep -A5 'slug' /etc/nginx/sites-enabled/yclients-dashboard`

---

### API возвращает `{"found": false}`

1. Проверить `service_id` — возможно, у нового мастер-класса другой id
2. Убедиться, что мероприятие добавлено в YClients и не в черновике
3. Проверить `lookahead_days` в `config.py` — по умолчанию 180 дней вперёд
4. Запустить диагностический запрос напрямую к YClients API (см. Шаг 1)

---

### Кнопка не открывает новую вкладку

Убедиться, что на `<a>` стоит `target="_blank" rel="noopener noreferrer"`.

---

### Дата не обновляется на странице

Проверить, что у элемента с датой стоит правильный `id` и он совпадает с `getElementById('<ID>')` в виджете.

---

## 📋 Параметры YClients API

| Параметр | Значение |
|----------|----------|
| **Base URL** | `https://api.yclients.com/api/v1` |
| **Endpoint активностей** | `GET /activity/{company_id}/search` |
| **Auth header** | `Authorization: Bearer {partner_token}, User {user_token}` |
| **Accept header** | `application/vnd.api.v2+json` |
| **company_id МШБ** | `453962` |
| **Токены** | Только в `.env` на сервере — в клиентском коде не фигурируют ✅ |

---

*Обновлено: 11 июня 2026*
