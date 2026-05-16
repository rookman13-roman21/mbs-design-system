# Design System — Московская школа бариста
## Универсальная инструкция по вёрстке страниц

> Используй этот документ как промт при создании любых новых страниц и лендингов МШБ.
> Все блоки должны строго соответствовать этому гайду — так весь сайт остаётся в едином стиле.

---

## 1. Технический стек

- **Платформа:** Tilda (Zero Block / HTML-вставка) или статический HTML
- **Шрифт:** `Mulish` (Google Fonts) — веса 400, 500, 600, 700, 800, 900
- **Подключение шрифта** (один раз глобально; при сборке дубли из блоков удаляются):
  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Mulish:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  ```
- **Префикс классов:** `mbs-[имя-блока]__[элемент]`, например `.mbs-hero__title`, `.mbs-faq__wrap`
- **Box-sizing:** `box-sizing: border-box` на все элементы через `.mbs-БЛОК * { box-sizing: border-box; }`
- **CSS-переменные** объявляются один раз в `:root` Hero-блока; остальные блоки используют хардкод-значения

---

## 2. Цвета

| Переменная | HEX | Применение |
|---|---|---|
| `--mbs-green-dark` | `#417033` | Основной зелёный: текст лейблов, иконки, акценты, фон финального CTA |
| `--mbs-green` | `#4F883E` | Зелёные кнопки, бейджи модулей, hover |
| `--mbs-green-light` | `#B6D8AB` | Рамки акцентных карточек, пунктирные линии |
| `--mbs-bg-green` | `#E7F2E3` | Фон лейблов, фон иконок, акцентный фон блока 04 |
| `--mbs-red` | `#CC2841` | Кнопки покупки (основной CTA) |
| `--mbs-red-soft` | `#D83D54` | Hover для красных кнопок |
| `--mbs-bg` | `#F5F5F5` | Фон «серых» блоков |
| `--mbs-black` | `#1F1F1F` | Основной текст, заголовки |
| `--mbs-gray` | `#555555` | Второстепенный текст, подписи |
| `--mbs-white` | `#FFFFFF` | Фон «белых» блоков, карточки |

### Чередование фонов блоков

```
Блок 01 Hero        #FFFFFF снаружи + #F7F7F7 внутри (карточка с градиентом)
Блок 02 For-whom    #F5F5F5
Блок 03 Skills      #FFFFFF
Блок 04 How-it      #E7F2E3  ← светло-зелёный (единственный такой блок)
Блок 05 Program     #FFFFFF
Блок 07 Inside      #FFFFFF
Блок 08 Price       #F5F5F5
Блок 09 FAQ         #F5F5F5
Блок 10 Final CTA   #FFFFFF снаружи + #417033 внутри (тёмно-зелёная карточка)
```

---

## 3. Типографика

### Заголовки секций (h2) — стандарт
```css
font-size: 34px;
font-weight: 900;
line-height: 1;
letter-spacing: -0.04em;
color: #1F1F1F;
margin: 0 0 10px;
/* mobile ≤820px: font-size 26px */
```

### Заголовок Hero (h1)
```css
font-size: 82px;        /* desktop */
font-weight: 900;
line-height: 0.92;
letter-spacing: -0.07em;
/* ≤1180px: 68px | ≤820px: 38px | ≤420px: 34px */
```

### Lead-текст Hero (под h1)
```css
font-size: 27px;        /* desktop */
font-weight: 500;
line-height: 1.27;
letter-spacing: -0.03em;
color: #1F1F1F;
/* ≤1180px: 24px | ≤820px: 15px */
```

### Подзаголовок секции (subtitle под h2)
```css
font-size: 15–16px;
font-weight: 500;
line-height: 1.5;
color: #555555;
```

### Текст карточки / пункта списка
```css
font-size: 14–15px;
font-weight: 500–700;
line-height: 1.4–1.5;
color: #1F1F1F;
```

### Мелкий вспомогательный текст
```css
font-size: 12–13px;
font-weight: 500–600;
color: #555555 | #888888;
```

### FAQ — заголовок левой колонки
```css
font-size: 52px;
font-weight: 900;
letter-spacing: -0.04em;
```

### FAQ — вопросы / ответы
```css
/* Вопрос (summary) */
font-size: 19px; font-weight: 700;
/* Ответ (текст внутри details) */
font-size: 17px; font-weight: 500; line-height: 1.6;
/* Lead-текст в левой колонке */
font-size: 19px; font-weight: 500;
/* mobile ≤820px: вопрос 17px, ответ 16px */
```

---

## 4. Отступы (Spacing)

| Блок | Desktop padding | Mobile ≤820px padding |
|---|---|---|
| Все стандартные блоки | `90px 20px` | `64px 14–16px` |
| Hero (снаружи) | `48px 20px` | `14px 12px` |
| Hero wrap (внутри карточки) | `72px 76px` | `18px 16px 20px` |
| Финальный CTA (снаружи) | `90px 20px 106px` | `64px 14px 76px` |
| Финальный CTA (карточка) | `72px 80px` | `40px 24px` |

**Ширина контентной области:**
```css
max-width: 1100px;
margin: 0 auto;
```
Hero — исключение: внешняя обёртка `max-width: 1320px`, внутри контент не ограничен отдельно.

---

## 5. Лейблы (pill-бейджи над заголовками)

Каждая секция начинается с лейбла-пилюли:

```css
/* Стандартный (светлый фон) */
display: inline-flex;
align-items: center;
margin-bottom: 14px;
padding: 7px 16px;
border-radius: 999px;
background: rgba(231, 242, 227, 0.95);
color: #417033;
font-size: 13px;
line-height: 1;
font-weight: 900;
```

```css
/* На тёмном фоне (финальный CTA #417033) */
background: rgba(255, 255, 255, 0.18);
color: #FFFFFF;
```

---

## 6. Кнопки

### Красная — основной CTA (покупка)
```css
background: #CC2841;
color: #fff !important;          /* !important обязателен — Tilda перебивает */
font-size: 16px;                 /* hero */
font-size: 18px;                 /* price / final блоки */
font-size: 15px;                 /* inline в карточке программы */
font-weight: 800–900;
border-radius: 999px;
padding: 0 32px; min-height: 58px;    /* hero */
padding: 13px 28px;                   /* inline */
text-decoration: none !important;
transition: background 0.2s;
/* hover: background #D83D54; transform: translateY(-1px) */
```

### Зелёная — вторичный CTA (навигация, просмотр)
```css
background: #4F883E;
color: #fff !important;
/* hover: background #417033 */
/* Остальные параметры как у красной */
```

### Формат ссылки на корзину Tilda
```
href="#order:Название товара=Цена"
```
Примеры:
```
href="#order:Онлайн-курс Домашний бариста=3600"
href="#order:Курс Профессиональный бариста=18000"
```
⚠️ Цена — без пробелов и знаков валюты, только цифры.

### Кнопка «Оставить заявку» — попап Tilda

На **каждой странице** должны быть две точки захвата:
- **Красная** `#order:…` — для тех, кто готов купить сразу
- **«Оставить заявку»** `#consalt` — для тех, кто хочет уточнить детали перед покупкой

Ссылка:
```
href="#consalt"
```
> `#consalt` — встроенная команда Tilda, открывает попап формы заявки. Без каких-либо параметров, ничего менять не нужно.

Где ставить кнопку «Оставить заявку»:
1. **Hero-блок** — рядом с красной кнопкой (outline-вариант, зелёный)
2. **Финальный CTA (последний блок)** — текстовая ссылка под строкой с красной кнопкой

CSS outline-кнопки для Hero:
```css
.mbs-БЛОК__btn-consult {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 58px;
  padding: 0 30px;
  border-radius: 999px;
  background: transparent;
  border: 2.5px solid #417033;
  color: #417033 !important;
  text-decoration: none !important;
  font-family: 'Mulish', sans-serif;
  font-size: 16px;
  font-weight: 800;
  line-height: 1;
  transition: background 0.2s, color 0.2s, transform 0.2s;
  white-space: nowrap;
}
.mbs-БЛОК__btn-consult:hover {
  background: #417033;
  color: #FFFFFF !important;
  transform: translateY(-1px);
}
```

CSS текстовой ссылки для тёмного CTA-блока:
```css
.mbs-БЛОК__consult {
  margin-top: 16px;
  color: rgba(255, 255, 255, 0.7) !important;
  text-decoration: none !important;
  font-size: 15px;
  font-weight: 600;
  transition: color 0.2s;
  cursor: pointer;
}
.mbs-БЛОК__consult:hover {
  color: #FFFFFF !important;
  text-decoration: underline !important;
}
```

HTML-примеры:
```html
<!-- Hero: outline-кнопка рядом с красной -->
<a href="#order:Онлайн мастер-класс=5000" class="mbs-hero__btn">Записаться</a>
<a href="#consalt" class="mbs-hero__btn-consult">Оставить заявку</a>

<!-- Финальный CTA: текстовая ссылка под основной кнопкой -->
<div class="mbs-cta__actions">
  <a href="#order:Онлайн мастер-класс=5000" class="mbs-cta__btn">Записаться на мастер-класс</a>
  <span class="mbs-cta__price">5 000 ₽</span>
</div>
<a href="#consalt" class="mbs-cta__consult">Или оставить заявку — ответим на вопросы →</a>
```

⚠️ Обращение на **Вы**: «ответим на вопросы», не «отвечу».

---

## 7. Карточки

### Стандартная карточка на сером фоне
```css
background: #FFFFFF;
border-radius: 18–20px;
padding: 24–32px;
```

### Акцентная карточка (зелёная)
```css
background: #E7F2E3;
border: 2px solid #B6D8AB;
border-radius: 18–20px;
padding: 24–28px;
```

### Карточка с тенью (белая на сером, price-блок)
```css
background: #FFFFFF;
box-shadow: 0 24px 72px rgba(31, 31, 31, 0.12);
border: 8px solid #E7F2E3;
border-radius: 28px;
padding: 56px 64px;
```

### Hero-обёртка (карточка с градиентными пятнами)
```css
border: 8px solid #E7F2E3;
border-radius: 28px;
background:
  radial-gradient(circle at 17% 12%, rgba(231,242,227,0.78) 0, rgba(231,242,227,0.78) 18%, transparent 19%),
  radial-gradient(circle at 88% 84%, rgba(231,242,227,0.66) 0, rgba(231,242,227,0.66) 16%, transparent 17%),
  radial-gradient(circle at 58% 56%, rgba(231,242,227,0.32) 0, rgba(231,242,227,0.32) 13%, transparent 14%),
  #F7F7F7;
```

### Финальный CTA (тёмно-зелёная карточка с пятнами)
```css
background:
  radial-gradient(circle at 10% 90%, rgba(182,216,171,0.45) 0, rgba(182,216,171,0.45) 22%, transparent 23%),
  radial-gradient(circle at 90% 10%, rgba(231,242,227,0.7) 0, rgba(231,242,227,0.7) 18%, transparent 19%),
  #417033;
border-radius: 28px;
padding: 72px 80px;
```

---

## 8. Иконки

```css
/* SVG inline, монохромные */
width: 24px; height: 24px;
stroke="currentColor"
stroke-width: 1.8;
fill: none;

/* Контейнер иконки */
width: 46px; height: 46px;
border-radius: 14px;
background: #E7F2E3;
color: #417033;
display: grid; place-items: center;

/* Мобильный контейнер */
width: 36px; height: 36px;
border-radius: 10px;
/* svg: width 18px, height 18px */
```

---

## 9. Структура страницы (порядок блоков лендинга курса)

```
01  hero         Первый экран: h1 + промо-видео YouTube + кнопки + цена
02  for-whom     Для кого: карточки с описанием аудитории
03  skills       Что научитесь: список навыков + карточки методов
04  how-it-works Как устроен курс: шаги-этапы с пунктиром (5 шагов)
05  program      Программа: 2 модуля + список уроков + inline CTA с ценой
07  inside       Что внутри после покупки: кабинет, бонусы, скидки
08  price        Цена и покупка: главная CTA-карточка (#buy)
09  faq          FAQ: аккордеон (<details>) + sticky-заголовок слева
10  final-cta    Финальный призыв: тёмно-зелёная карточка + кнопка покупки
```

> Блок 06 зарезервирован (отзывы / социальное доказательство — добавится позже).

---

## 10. Адаптив (Breakpoints)

| Breakpoint | Что меняется |
|---|---|
| `≤1180px` | Hero: одна колонка, row-gap 36px, h1 → 68px, lead → 24px |
| `≤820px` | Все блоки: padding 64px 14–16px. Hero: порядок top→media→bottom. h2 → 26px |
| `≤720px` | Program grid: 2 колонки → 1 колонка |
| `≤420px` | Hero h1 → 34px |

### Hero мобильный (≤820px) — DOM-порядок:
```
1. __content-top   (лейбл + h1)
2. __media         (видео)
3. __content-bottom (текст + фичи + кнопки)
```
На desktop медиа позиционируется через `grid-column: 2; grid-row: 1 / span 2`.

### Фичи Hero на мобильном:
```css
grid-template-columns: repeat(3, 1fr);  /* 3 иконки в ряд */
текст по центру, иконка сверху
```

### Кнопки Hero на мобильном:
```css
grid-template-columns: 1fr 1fr;   /* 2 кнопки рядом */
grid-template-rows: auto auto;    /* цена снизу на всю ширину */
```

---

## 11. FAQ — особая структура блока

```css
/* Layout: 2 колонки */
display: grid;
grid-template-columns: 340px 1fr;
gap: 72px;
align-items: start;

/* Левая колонка — sticky */
position: sticky;
top: 32px;

/* Заголовок FAQ */
font-size: 52px; font-weight: 900; letter-spacing: -0.04em;

/* Аккордеон — нативный HTML без JS */
<details> / <summary>

/* Вопрос */
font-size: 19px; font-weight: 700;
/* Ответ */
font-size: 17px; font-weight: 500; line-height: 1.6;

/* mobile ≤820px: 1 колонка, вопрос 17px, ответ 16px */
```

---

## 12. JS-sticky для блоков внутри Tilda

### Проблема
`position: sticky` **не работает на Tilda** — платформа оборачивает каждый блок в контейнер с `overflow: hidden`, что деактивирует sticky для всех дочерних элементов. На статическом HTML (Vercel, GitHub Pages) sticky работает нормально.

### Решение — эмуляция через `transform: translateY()`
Отслеживаем `scroll` и вычисляем сдвиг вручную через `requestAnimationFrame`. Движение на GPU — визуально неотличимо от нативного sticky, работает в любом контейнере.

### Готовый шаблон

```css
/* Элемент-"стикер" — убираем position:sticky, добавляем GPU-хинт */
.mbs-BLOCK__sticky-el {
  will-change: transform;
}

/* На мобиле — отключаем */
@media (max-width: 900px) {
  .mbs-BLOCK__sticky-el {
    will-change: auto;
  }
}
```

```js
(function () {
  var TOP_OFFSET = 90; // отступ от верха viewport (высота меню Tilda ≈ 70px + запас)

  function initSticky() {
    var section  = document.getElementById('SECTION_ID');
    var stickyEl = section ? section.querySelector('.mbs-BLOCK__sticky-el') : null;
    var wrap     = section ? section.querySelector('.mbs-BLOCK__wrap')       : null;
    if (!stickyEl || !wrap) return;

    var ticking = false;

    function update() {
      ticking = false;
      if (window.innerWidth <= 900) {
        stickyEl.style.transform = '';
        return;
      }

      var wrapRect = wrap.getBoundingClientRect();
      var elH      = stickyEl.offsetHeight;
      var maxShift = wrapRect.height - elH; // не выйти за нижний край секции

      var shift = TOP_OFFSET - wrapRect.top;
      if (shift < 0)            shift = 0;
      if (shift > maxShift)     shift = Math.max(0, maxShift);

      stickyEl.style.transform = 'translateY(' + shift + 'px)';
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update,   { passive: true });
    update();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSticky);
  } else {
    initSticky();
  }
})();
```

### Как применять
1. Убрать `position: sticky; top: Xpx` из CSS элемента.
2. Добавить `will-change: transform` в CSS.
3. Вставить скрипт в конец HTML-блока (после `</section>`).
4. Заменить `SECTION_ID`, `.mbs-BLOCK__sticky-el`, `.mbs-BLOCK__wrap` на реальные имена.
5. Подобрать `TOP_OFFSET` под высоту меню конкретной страницы (обычно 80–100px).

### Где уже применён
| Файл | Стикер-элемент | TOP_OFFSET |
|---|---|---|
| `Online_webinar_open_cafe_money/blocks/03-program.html` | `.mbs-wm-program__right` | 90px |

---

## 13. Видео YouTube

```html
<div class="mbs-XXX__video">
  <iframe
    src="https://www.youtube.com/embed/VIDEO_ID"
    title="Описание видео"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen>
  </iframe>
</div>
```
```css
.mbs-XXX__video {
  position: relative;
  overflow: hidden;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 24px;      /* mobile: 14px */
  background: #111;
  box-shadow: 0 22px 60px rgba(31,31,31,0.12);
}
.mbs-XXX__video iframe {
  position: absolute;
  inset: 0; width: 100%; height: 100%; border: 0;
}
```

---

## 13. Шаблон нового блока (заготовка для копирования)

```html
<!--
  БЛОК XX — [НАЗВАНИЕ]  [id="якорь"]
  Место: [место на странице]
  Задача: [цель блока одной фразой]
  Содержит: [краткое описание содержимого]
  Фон: #FFFFFF | #F5F5F5 | #E7F2E3
-->

<style>
  .mbs-НАЗВАНИЕ {
    font-family: 'Mulish', sans-serif;
    background: #FFFFFF; /* #F5F5F5 или #E7F2E3 */
    padding: 90px 20px;
    color: #1F1F1F;
  }
  .mbs-НАЗВАНИЕ * { box-sizing: border-box; }

  .mbs-НАЗВАНИЕ__wrap {
    max-width: 1100px;
    margin: 0 auto;
  }

  .mbs-НАЗВАНИЕ__label {
    display: inline-flex;
    align-items: center;
    margin-bottom: 14px;
    padding: 7px 16px;
    border-radius: 999px;
    background: rgba(231, 242, 227, 0.95);
    color: #417033;
    font-size: 13px;
    line-height: 1;
    font-weight: 900;
  }

  .mbs-НАЗВАНИЕ__title {
    margin: 0 0 10px;
    font-size: 34px;
    line-height: 1;
    font-weight: 900;
    letter-spacing: -0.04em;
    color: #1F1F1F;
  }

  .mbs-НАЗВАНИЕ__subtitle {
    margin: 0;
    font-size: 15px;
    line-height: 1.5;
    font-weight: 500;
    color: #555555;
  }

  /* --- Контент --- */

  @media (max-width: 820px) {
    .mbs-НАЗВАНИЕ {
      padding: 64px 14px;
    }
    .mbs-НАЗВАНИЕ__title {
      font-size: 26px;
    }
  }
</style>

<section class="mbs-НАЗВАНИЕ" id="якорь">
  <div class="mbs-НАЗВАНИЕ__wrap">
    <div class="mbs-НАЗВАНИЕ__header">
      <span class="mbs-НАЗВАНИЕ__label">Лейбл секции</span>
      <h2 class="mbs-НАЗВАНИЕ__title">Заголовок секции</h2>
      <p class="mbs-НАЗВАНИЕ__subtitle">Подзаголовок</p>
    </div>

    <!-- Контент блока -->

  </div>
</section>
```

---

## 14. Готовый промт для генерации нового блока

Вставляй этот текст в начало запроса к ИИ:

```
Создай HTML-блок для сайта Московской школы бариста (МШБ).

ТЕХНИЧЕСКИЕ ТРЕБОВАНИЯ:
— Шрифт: Mulish (Google Fonts), веса 400–900
— Префикс классов: mbs-[имя-блока]__[элемент]
— box-sizing: border-box на все дочерние элементы
— Фон блока: [#FFFFFF / #F5F5F5 / #E7F2E3] — выбери по контексту
— Padding: 90px 20px desktop; 64px 14px mobile (≤820px)
— Max-width контента: 1100px, margin: auto

СТИЛИ:
— Заголовок h2: 34px, weight 900, letter-spacing -0.04em, color #1F1F1F; mobile 26px
— Лейбл над заголовком: pill-бейдж, bg rgba(231,242,227,0.95), color #417033, 13px, weight 900, padding 7px 16px, border-radius 999px
— Кнопка покупки: bg #CC2841, color #fff !important, border-radius 999px, weight 900, text-decoration none !important
— Кнопка навигации: bg #4F883E, color #fff !important, border-radius 999px
— Акцентные карточки: bg #E7F2E3, border 2px solid #B6D8AB, border-radius 18–20px
— Иконки SVG inline: stroke currentColor, stroke-width 1.8, контейнер 46×46px, bg #E7F2E3, color #417033, border-radius 14px

ЦВЕТОВАЯ ПАЛИТРА (строго):
#417033 · #4F883E · #B6D8AB · #E7F2E3 · #F5F5F5 · #1F1F1F · #555555 · #FFFFFF · #CC2841

ВАЖНО:
— color: #fff !important на текст кнопок (Tilda перебивает)
— text-decoration: none !important на ссылки-кнопки
— Ссылка на корзину Tilda: href="#order:Название=Цена"

ЗАДАЧА: [опиши что должен делать блок]
```

---

## 15. Паттерн: аккордеон с плавной анимацией (FAQ)

> ⚠️ Это критически важный раздел. Неправильная реализация приводит к тому, что аккордеон **открывается и сразу сворачивается обратно**.

### Структура HTML

```html
<details class="mbs-faq__item">
  <summary>Текст вопроса</summary>
  <div class="mbs-faq__body">
    <p class="mbs-faq__answer">Текст ответа</p>
  </div>
</details>
```

Обёртка `mbs-faq__body` обязательна — именно на ней анимируется `height`.

### CSS

```css
.mbs-faq__body {
  overflow: hidden;
  height: 0;
  transition: height 0.32s cubic-bezier(0.4, 0, 0.2, 1);
}
.mbs-faq__answer {
  overflow: visible;
}
```

### JavaScript — единственно правильный паттерн

```javascript
(function () {
  document.querySelectorAll('.mbs-faq__item').forEach(function (details) {
    var body = details.querySelector('.mbs-faq__body');
    var busy = false;

    details.querySelector('summary').addEventListener('click', function (e) {
      e.preventDefault();
      if (busy) return;

      if (details.open) {
        // — Закрытие —
        busy = true;
        body.style.height = body.scrollHeight + 'px';
        body.offsetHeight; // force reflow: фиксирует начальную высоту до старта анимации
        body.style.height = '0px';
        body.addEventListener('transitionend', function done(ev) {
          if (ev.propertyName !== 'height') return; // игнорируем другие свойства
          body.removeEventListener('transitionend', done);
          details.open = false;
          busy = false;
        });
      } else {
        // — Открытие —
        busy = true;
        details.open = true;
        var targetH = body.scrollHeight;
        body.style.height = '0px';
        body.offsetHeight; // force reflow
        body.style.height = targetH + 'px';
        body.addEventListener('transitionend', function done(ev) {
          if (ev.propertyName !== 'height') return;
          body.removeEventListener('transitionend', done);
          body.style.height = 'auto'; // ← ОБЯЗАТЕЛЬНО 'auto', не '' !
          busy = false;
        });
      }
    });
  });
})();
```

### Три ключевых правила, без которых не работает

| # | Правило | Почему |
|---|---|---|
| 1 | `body.offsetHeight` (синхронный forced reflow) | Без него браузер «склеивает» начальное и конечное состояние, анимация не запускается |
| 2 | `ev.propertyName !== 'height'` в transitionend | `transitionend` срабатывает для каждого анимируемого свойства; без проверки обработчик вызовется лишний раз |
| 3 | После открытия ставить `'auto'`, не `''` | `''` снимает инлайн-стиль → CSS `height: 0` вступает в силу → аккордеон сразу закрывается |

### Почему не работают другие подходы

| Подход | Проблема |
|---|---|
| Web Animations API (`animate({ height })`) | Layout thrashing, дёргается |
| CSS `grid-template-rows: 0fr → 1fr` | Браузеры не интерполируют `fr` плавно |
| Двойной `requestAnimationFrame` | Ненадёжен, зависит от fps; на медленных устройствах может пропустить кадр |
| `body.style.height = ''` после открытия | CSS `height: 0` закрывает обратно |

---

## 16. Важные детали и частые ошибки

| Проблема | Решение |
|---|---|
| Невидимый текст кнопки | Добавить `color: #fff !important` |
| Подчёркивание на кнопке-ссылке | Добавить `text-decoration: none !important` |
| Шрифт не применяется | Убедиться что Mulish подключён глобально |
| Кнопка корзины не открывает заказ | Проверить формат: `#order:Название=3600` (только цифры) |
| Блок слишком широкий на мобильном | Проверить `overflow-x: hidden` и отсутствие `min-width` |
| Аккордеон открывается и сразу закрывается | После открытия писать `body.style.height = 'auto'`, не `''` — см. раздел 15 |
| Анимация аккордеона дёргается | Добавить `body.offsetHeight` перед сменой height — это forced reflow |

---

---

*Версия: май 2026 · Сайт: baristaschool.ru*
