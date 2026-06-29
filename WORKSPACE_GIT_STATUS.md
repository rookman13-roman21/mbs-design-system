# Workspace Git Status — All_Code

Актуально на 2026-06-29 после локальной инвентаризации workspace.

Цель: держать GitHub источником правды и быстро понимать, с какого проекта безопасно продолжать работу на другом устройстве. Перед любыми правками в конкретном проекте всё равно нужно выполнить `git status --short --branch` и, если доступна сеть, `git fetch origin`.

## Итог

- Найдено верхнеуровневых Git-репозиториев: 14.
- Найдено вложенных Git-репозиториев: 2.
- Все найденные Git-репозитории сейчас чистые локально и синхронизированы с `origin`.
- Tracked `.env`, `.vercel` и `.DS_Store` в найденных Git-репозиториях не обнаружены.
- Папка `MBSProjectMap` в `/Users/Romka/Downloads/All_Code` не найдена. Самая полная текущая карта workspace — `mbs-design-system.code-workspace`.

## Git-репозитории

| Проект | Ветка | Состояние | Комментарий |
|---|---:|---|---|
| `Karta-Uchenikov` | `main` | чисто, `origin/main` | Рабочий проект карты учеников. |
| `YClients-Dashboard` | `main` | чисто, `origin/main` | Бэкэнд/дашборд личного кабинета и внутренних разделов. |
| `bar-ergonomics` | `main` | чисто, `origin/main` | `.env` есть локально, не tracked. |
| `barista-course` | `work/excu-local-page` | чисто, `origin/work/excu-local-page` | Сейчас рабочая ветка, не `main`. |
| `bitrix-tools` | `main` | чисто, `origin/main` | `.env` есть локально, не tracked. |
| `mbs-calendar` | `main` | чисто, `origin/main` | Рабочий проект календаря. |
| `mbs-client-map` | `main` | чисто, `origin/main` | Ключ карты хранится в коде по принятому решению, доменные ограничения нужно проверить в кабинете Яндекса. |
| `mbs-design-system` | `main` | чисто до обновления этого отчёта | Центр дизайн-системы и рабочих знаний. |
| `mbs-marketing-analytics` | `main` | чисто, `origin/main` | `.env` есть локально, не tracked. |
| `mbs-mixology-cup` | `main` | чисто, `origin/main` | Архив/страницы Mixology Cup. |
| `mbs-photo-gallery` | `main` | чисто, `origin/main` | Галереи и фотоальбомы. |
| `schedule-online` | `main` | чисто, `origin/main` | Виджеты расписания и записи. |
| `yclients-gsheets` | `main` | чисто, `origin/main` | `.env` есть локально, не tracked. |
| `yclients-reviews-widget` | `main` | чисто, `origin/main` | Виджет отзывов. |

## Вложенные Git-репозитории

| Проект | Ветка | Состояние | Что важно |
|---|---:|---|---|
| `Coffee_menu/HTML_coffee_menu` | `main` | чисто, `origin/main` | Основной Git-репозиторий находится внутри `Coffee_menu`, не на верхнем уровне. |
| `barista-course/home-barista` | `main` | чисто, `origin/main` | Это отдельный репозиторий `home-barista`, не часть родительского `barista-course`. |

## Не-Git папки

| Папка | Содержимое | Действие |
|---|---|---|
| `email-marketing` | `.env`, `.venv`, логи, output, HTML-шаблоны, Python-скрипты | Подготовлен к безопасному Git: есть `.gitignore`, `.env.example`, переносимый launchd-шаблон. Нужно отдельное решение про GitHub-репозиторий. |
| `Calculator` | Один HTML-виджет `mbs-mixology-cup/tilda/participants-widget.html` | Если продолжать работу, сначала решить: это отдельный проект или архивный файл. |
| `.vscode` | Workspace setting `files.exclude` | Локальная настройка workspace, не проектный репозиторий. |

## Локальные секреты и служебные файлы

Найдены локальные `.env`:

- `YClients-Dashboard/.env`
- `bar-ergonomics/.env`
- `barista-course/.env`
- `bitrix-tools/.env`
- `email-marketing/.env`
- `mbs-marketing-analytics/.env`
- `yclients-gsheets/.env`

Правило: перед любым `git add` использовать явный список файлов, не `git add .`.

Найдены локальные `.vercel`:

- `bar-ergonomics/.vercel`
- несколько подпапок внутри `barista-course`
- `mbs-mixology-cup/.vercel`
- `schedule-online/webinar-budget-sync/landing/.vercel`

Эти папки не tracked. Их не добавлять в GitHub.

## Что уже закрыто в этой инвентаризации

- `barista-course` приведён к чистому состоянию в ветке `work/excu-local-page`.
- `barista-course/home-barista` проверен как отдельный чистый репозиторий.
- `barista-course/.vscode/tasks.json` заменён на переносимую задачу `git-status`.
- В `barista-course` проигнорированы локальные вложенные/служебные файлы: `home-barista/`, `push-open-coffeeshop.sh`, временные Tilda exports.
- `email-marketing` подготовлен к безопасному оформлению в Git: `.env`/логи/output/.venv игнорируются, добавлен `.env.example`, launchd plist больше не содержит абсолютный путь пользователя.

## Рекомендованный порядок следующей работы

1. Для следующей продуктовой задачи выбирать конкретный проект, а не править workspace массово.
2. Если цель — страницы сайта/Tilda, продолжать с `barista-course`.
3. Если цель — личный кабинет, сотрудники, доступы и маркетинг v2, продолжать с `YClients-Dashboard`.
4. Если цель — расписание, запись, yClients и публичные виджеты, продолжать с `schedule-online`.
5. Если цель — галереи/фотоальбомы/каппинги, продолжать с `mbs-photo-gallery` и связанными Tilda-блоками.
6. Отдельно решить судьбу `email-marketing`: создать GitHub-репозиторий или оставить локальным инструментом.

## Перед работой с любого другого устройства

1. Открыть нужный проект.
2. Выполнить `git status --short --branch`.
3. Выполнить `git fetch origin`, если есть сеть.
4. Если ветка `behind`, `ahead` или `diverged`, не начинать правки до синхронизации.
5. Проверить, что `.env`, `.vercel`, `.DS_Store`, output/logs и временные файлы не попадают в staged.
