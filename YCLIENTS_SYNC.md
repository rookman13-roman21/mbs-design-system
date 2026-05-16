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
  rel="noopener"
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
   - Поставить в `href` прямую YClients-ссылку + `target="_blank" rel="noopener"`
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

Убедиться, что на `<a>` стоит `target="_blank" rel="noopener"`.

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

*Обновлено: 15 мая 2026*
