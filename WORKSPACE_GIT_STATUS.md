# Workspace Git Status — All_Code

Актуально на 2026-06-29 после локальной инвентаризации workspace.

Цель: держать GitHub источником правды и быстро понимать, с какого проекта безопасно продолжать работу на другом устройстве. Перед любыми правками в конкретном проекте нужно запустить preflight или вручную выполнить `git status --short --branch` и, если доступна сеть, `git fetch origin`.

Автоматическая проверка перед работой:

```bash
scripts/workspace-preflight.sh
```

В VS Code доступна задача `MBS: Workspace preflight`. Скрипт ничего не чинит автоматически: только проверяет Git-состояние, синхронизацию с `origin`, локальные изменения и рискованные staged-файлы.

Для будущих Codex-сессий правило закреплено в `AGENTS.md`.

## Итог

- Найдено верхнеуровневых Git-репозиториев: 15.
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
| `email-marketing` | `main` | чисто, `origin/main` | Приватный GitHub-репозиторий; `.env`, `.venv`, `logs/`, `output/` локальные и ignored. |
| `mbs-calendar` | `main` | чисто, `origin/main` | Рабочий проект календаря. |
| `mbs-client-map` | `main` | чисто, `origin/main` | Ключ карты хранится в коде по принятому решению, доменные ограничения нужно проверить в кабинете Яндекса. |
| `mbs-design-system` | `main` | чисто до обновления этого отчёта | Центр дизайн-системы и рабочих знаний. |
| `mbs-marketing-analytics` | `main` | чисто, `origin/main` | `.env` есть локально, не tracked. |
| `mbs-mixology-cup` | `main` | чисто, `origin/main` | Архив/страницы Mixology Cup; старый participants widget из `Calculator` сохранён в `legacy/`. |
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
| `Calculator` | Один HTML-виджет `mbs-mixology-cup/tilda/participants-widget.html` | Разобран как legacy-хвост. Копия сохранена в `mbs-mixology-cup/legacy/participants-widget.html`; исходную папку не удаляли без отдельного разрешения. |
| `.vscode` | VS Code task `MBS: Workspace preflight` | Локальная задача для запуска проверки из VS Code. |

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

- Добавлена автоматическая безопасная проверка workspace: `scripts/workspace-preflight.sh`, VS Code task `MBS: Workspace preflight` и `AGENTS.md` с правилом для будущих Codex-сессий.
- `barista-course` приведён к чистому состоянию в ветке `work/excu-local-page`.
- `barista-course/home-barista` проверен как отдельный чистый репозиторий.
- `barista-course/.vscode/tasks.json` заменён на переносимую задачу `git-status`.
- В `barista-course` проигнорированы локальные вложенные/служебные файлы: `home-barista/`, `push-open-coffeeshop.sh`, временные Tilda exports.
- `email-marketing` оформлен как приватный GitHub-репозиторий: `.env`/логи/output/.venv игнорируются, добавлен `.env.example`, launchd plist больше не содержит абсолютный путь пользователя.
- `Calculator` разобран как архивный Tilda-виджет Mixology Cup; файл перенесён в `mbs-mixology-cup/legacy/participants-widget.html`, документация `mbs-mixology-cup` обновлена и сохранена на GitHub.

## Рекомендованный порядок следующей работы

1. Для следующей продуктовой задачи выбирать конкретный проект, а не править workspace массово.
2. Если цель — страницы сайта/Tilda, продолжать с `barista-course`.
3. Если цель — личный кабинет, сотрудники, доступы и маркетинг v2, продолжать с `YClients-Dashboard`.
4. Если цель — расписание, запись, yClients и публичные виджеты, продолжать с `schedule-online`.
5. Если цель — галереи/фотоальбомы/каппинги, продолжать с `mbs-photo-gallery` и связанными Tilda-блоками.
6. Если нужна работа с email-рассылками, продолжать с `email-marketing` как отдельным приватным репозиторием.

## Перед работой с любого другого устройства

1. Открыть нужный проект.
2. Выполнить `git status --short --branch`.
3. Выполнить `git fetch origin`, если есть сеть.
4. Если ветка `behind`, `ahead` или `diverged`, не начинать правки до синхронизации.
5. Проверить, что `.env`, `.vercel`, `.DS_Store`, output/logs и временные файлы не попадают в staged.
