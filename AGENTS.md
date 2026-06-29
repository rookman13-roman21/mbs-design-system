# MBS Design System / Workspace Rules

Этот репозиторий используется как центр рабочих знаний по `/Users/Romka/Downloads/All_Code`.

Перед началом любых правок, которые касаются workspace, нескольких проектов или переноса работы между устройствами, сначала выполнить:

```bash
scripts/workspace-preflight.sh
```

Если сеть недоступна:

```bash
scripts/workspace-preflight.sh --no-fetch
```

Правила:

- GitHub считать источником правды для основных веток.
- Не начинать кодинг, если preflight показывает `BLOCK`.
- Если preflight показывает `WARN`, сначала объяснить Роману причину и безопасный следующий шаг.
- Не печатать содержимое `.env`, токены, ключи и приватные значения.
- Не добавлять в Git `.env`, `.vercel`, `.DS_Store`, `logs/`, `output/`, временные exports и локальные архивы.
- `Calculator` оставлен локальным архивом; активная копия старого виджета сохранена в `mbs-mixology-cup/legacy/participants-widget.html`.
- `barista-course` может быть на рабочей ветке `work/excu-local-page`; это нужно проверять перед задачами в этом проекте.

Скрипт preflight только диагностирует состояние. Он не делает `pull`, `rebase`, `stash`, `commit`, `push` и не удаляет файлы.
