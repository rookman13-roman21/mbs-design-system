# Workspace Git Status — All_Code

Актуально на 2026-06-10, после `git fetch origin --prune` по всем найденным git-репозиториям.

Цель: зафиксировать состояние проектов перед работой с другого компьютера в VS Code. GitHub должен оставаться источником правды для `main`; проекты со статусом `behind`, `ahead/behind` или большим количеством локальных изменений нельзя пушить без отдельной синхронизации.

## Итог

- Найдено git-репозиториев: 15.
- Полностью синхронизированы с GitHub и без рабочих изменений: 1 (`bitrix-tools`).
- Синхронизированы с GitHub, но есть только локальный мусор `.DS_Store`/служебные папки: 4.
- Есть локальные изменения при актуальной ветке: 5.
- Есть локальные изменения и ветка отстала от GitHub: 5.
- Есть `ahead 1, behind 2`: 1 (`barista-course`) — требует отдельной безопасной синхронизации.

## Сводная таблица

| Проект | Ветка | GitHub-состояние | Локальное состояние | Действие |
|---|---:|---|---|---|
| `Coffee_menu/HTML_coffee_menu` | `main` | `behind 1` | много изменений, удалений, `.env.production`, новые изображения | Не пушить. Сначала сохранить/разобрать локальные изменения и подтянуть `origin/main`. |
| `Karta-Uchenikov` | `main` | upstream не настроен в статусе | изменён `tilda-embed.html` | Можно рассмотреть отдельный commit/push, но сначала проверить remote tracking. |
| `YClients-Dashboard` | `main` | актуален с `origin/main` | изменены `public/nav.js`, `public/styles.css` | Можно коммитить отдельной задачей после просмотра diff и проверок. |
| `bar-ergonomics` | `main` | upstream не настроен в статусе | только `.DS_Store` | Не требует push. Лучше добавить/проверить `.gitignore` отдельно. |
| `barista-course` | `main` | `ahead 1, behind 2` | много изменений/новых подпроектов | Не пушить. Нужна отдельная синхронизация: сохранить локальное состояние, разобраться с `origin/main`. |
| `barista-course/home-barista` | `main` | `behind 1` | изменения в HTML/Tilda/vercel | Не пушить до pull/rebase/merge и проверки конфликтов. |
| `bitrix-tools` | `main` | актуален с `origin/main` | чисто | Ничего не требуется. |
| `mbs-calendar` | `main` | `behind 1` | изменения в docs/script/styles/tilda, `.DS_Store` | Не пушить до синхронизации с `origin/main`. |
| `mbs-client-map` | `main` | `behind 1` | изменения в `config.js`, `index.html`, `script.js`, `.DS_Store` | Не пушить до синхронизации. Важно: remote называется `mbs-project-map`, не путать с MBSProjectMap. |
| `mbs-design-system` | `main` | актуален с `origin/main` | `.DS_Store`, `.claude/`, этот отчёт | Коммитить только отчёт, служебные файлы не добавлять. |
| `mbs-mixology-cup` | `main` | актуален с `origin/main` | только `.DS_Store` | Уже актуализирован, задеплоен и сохранён на GitHub commit `841d5c4`. |
| `mbs-photo-gallery` | `main` | актуален с `origin/main` | изменения в gallery generators/blocks | Можно коммитить отдельной задачей после проверки diff. |
| `schedule-online` | `main` | `behind 1` | много изменений, новые scripts, `.vscode`, `deploy.sh` | Не пушить до синхронизации с `origin/main`. |
| `yclients-gsheets` | `main` | актуален с `origin/main` | только `.DS_Store` | Ничего не требуется. |
| `yclients-reviews-widget` | `main` | актуален с `origin/main` | изменения в README/widget/server/nginx | Можно коммитить отдельной задачей после проверки diff и тестов. |

## Проекты, которые нельзя пушить прямо сейчас

Эти проекты либо отстали от GitHub, либо разошлись с GitHub, либо содержат рискованные локальные изменения:

- `Coffee_menu/HTML_coffee_menu`: `behind 1`, много удалений, изменён `.env.production`.
- `barista-course`: `ahead 1, behind 2`, много новых и изменённых файлов.
- `barista-course/home-barista`: `behind 1` плюс локальные изменения.
- `mbs-calendar`: `behind 1` плюс локальные изменения.
- `mbs-client-map`: `behind 1` плюс локальные изменения.
- `schedule-online`: `behind 1` плюс много локальных изменений.

Безопасный порядок для каждого из них:

1. Посмотреть `git diff --stat` и ключевые diff.
2. Проверить, нет ли секретов и `.env` в staged/unstaged.
3. Сохранить локальные изменения в отдельную ветку `backup/...` или рабочую ветку.
4. Обновить основную ветку от `origin/main` без `force push`.
5. Разобрать конфликты, прогнать тесты/проверки.
6. Только после этого делать commit/push.

## Проекты с `.env` в workspace

Найдены `.env`/`.env.*` в нескольких проектах. Их нельзя добавлять в GitHub без отдельной проверки:

- `Coffee_menu/HTML_coffee_menu/.env.production`
- `YClients-Dashboard/.env`
- `bitrix-tools/.env`
- `email-marketing/.env`
- `yclients-gsheets/.env`
- `schedule-online/*/.env`
- `barista-course/.env`
- `bar-ergonomics/.env`

Перед любым массовым `git add` использовать только явный список файлов, не `git add .`.

## Что уже актуально

- `mbs-mixology-cup` сохранён на GitHub и задеплоен на Vercel.
- Production alias: `https://mbs-mixology-cup-vercel-public-2026.vercel.app`.
- Commit: `841d5c4 Update mixology cup participant UI`.

## CodeGraph в workspace

Актуально на 2026-06-21.

- `codegraph` установлен локально: `/opt/homebrew/bin/codegraph`.
- Индексы `.codegraph/` есть в нескольких корнях проектов под `All_Code`, включая:
  - `Coffee_menu`;
  - `YClients-Dashboard`;
  - `mbs-mixology-cup`;
  - `bitrix-tools`;
  - `yclients-gsheets`;
  - `mbs-design-system`;
  - `schedule-online`;
  - `yclients-reviews-widget`;
  - `mbs-photo-gallery`.
- В `Coffee_menu` индекс расположен на уровне `/Users/Romka/Downloads/All_Code/Coffee_menu/.codegraph`, а не внутри `Coffee_menu/HTML_coffee_menu/.codegraph`. Для задач frontend/workflow repo `HTML_coffee_menu` использовать корень `Coffee_menu` как indexed project root.
- `.codegraph/` — локальный индекс, не коммитить в GitHub.

## Рекомендованный следующий шаг на другом компьютере

1. В каждом рабочем проекте сначала выполнить `git fetch origin`.
2. Начинать с проектов без `behind/diverged`: `YClients-Dashboard`, `mbs-photo-gallery`, `yclients-reviews-widget`.
3. Для `barista-course`, `schedule-online`, `Coffee_menu/HTML_coffee_menu` не делать push до отдельного разбора локальных изменений.
4. Не добавлять `.DS_Store`, `.claude/`, `.env`, `.env.production` и временные файлы.
