# Design System — Московская школа бариста
## Универсальная инструкция по вёрстке страниц

> Используй этот документ как промт при создании любых новых страниц и лендингов МШБ.
> Все блоки должны строго соответствовать этому гайду — так весь сайт остаётся в едином стиле.

---

## 0. Контакты МШБ (актуальные — всегда использовать эти)

| Канал | Ссылка / номер | Назначение |
|---|---|---|
| Telegram | https://t.me/Moscow_barista_school | Общение с менеджером |
| Telegram-бот | https://t.me/Join_MBS_bot?start=c1746815986063-ds | Попап выбора способа связи |
| WhatsApp | https://wa.me/message/42GZ6YYBJTM5B1 | Общение с менеджером |
| MAX | https://max.ru/id744517097939_bot | Попап выбора способа связи |
| Телефон | +7 995 999-28-36 | Звонки |

> ⚠️ Использовать только эти контакты во всех кнопках, CTA-блоках, формах и тексте страниц.
> Ссылка `https://wa.me/79959992836` (старая прямая ссылка) — **заменена** на `https://wa.me/message/42GZ6YYBJTM5B1`.
> Для попапа выбора способа связи использовать каналы: MAX, WhatsApp, Telegram-бот.

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
| `--mbs-green-dark` | `#417033` | Основной зелёный: текст лейблов, иконки, акценты |
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
Блок 10 Final CTA   #FFFFFF снаружи + #E7F2E3 внутри (светло-зелёная карточка)
```

> ⚠️ **Важно: финальный CTA-блок — светло-зелёный, не тёмный**
>
> Карточка финального CTA использует **`#E7F2E3`** (светло-зелёный) с тёмным текстом `#1F1F1F`.
> Тёмно-зелёный фон `#417033` с белым текстом **не используется** — он перегружает страницу
> и визуально конкурирует с контентом. Текст на кнопке «Обсудить задачу» — зелёного цвета,
> кнопка «Смотреть события» — красная (`#CC2841`) как основной CTA.

### Чередование фонов для лендинга без блока программы (open_coffeeshop-тип)

```
Blok 01 Hero          #FFFFFF снаружи + карточка #F7F7F7 (градиент #E7F2E3)
Blok 02 Для кого    #E7F2E3
Blok 03 Ведущие     #FFFFFF  (карточки #F5F5F5)
Blok 04 Формат       #FFFFFF  (карточки #FFFFFF)
Blok 05 Что получите #F5F5F5  (aside-карточка #FFFFFF)
Blok 06 Отзывы      #F5F5F5  (карточки #FFFFFF)
Blok 07 Цена        #FFFFFF  (accent-ценник #E7F2E3)
Blok 08 CTA          #FFFFFF снаружи + карточка #E7F2E3
```

> **Правило:** два блока с одинаковым фоном никогда не идут подряд. Если два блока сряду
> должны быть на белом — меняем один из них на `#F5F5F5` или меняем фон карточек внутри.

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
| Финальный CTA (снаружи) | `90px 20px` | `64px 14px` |
| Финальный CTA (карточка) | `64px 72px` | `44px 28px` |

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

### Hero с CTA

Базовый вариант для событий и страниц с расписанием — две кнопки:

```html
<a class="..." href="#section-id">Выбрать дату</a>
<a class="..." href="#consalt">Оставить заявку</a>
```

Правила для двух CTA:
- Desktop: кнопки в одну строку.
- Mobile: обе кнопки на всю ширину; если важнее заявка, ставить «Оставить заявку» выше, «Выбрать дату» ниже.
- `#consalt` использовать только как `href`; не создавать `id="consalt"` на видимых элементах страницы, иначе Tilda может не открыть попап.
- Если кнопка «Выбрать дату» ведёт к реальному блоку на странице, плавный скролл можно перехватывать. Если целевого элемента нет, клик не перехватывать — Tilda должна обработать свой якорь сама.

Если в hero есть три действия, использовать такой порядок:

```html
<a class="..." href="#section-id">Выбрать дату</a>
<a class="..." href="#consalt">Оставить заявку</a>
<button class="..." type="button">Задать вопрос</button>
```

Правила:
- Desktop: все три кнопки в одну строку, без переноса третьей кнопки вниз.
- Mobile: «Оставить заявку» и «Задать вопрос» в одной верхней строке, «Выбрать дату» ниже на всю ширину экрана.

### Кнопка «Лист ожидания» — попап Tilda

Используется, когда мероприятие, экскурсия, мастер-класс или поток сейчас не запланированы, но нужно собрать интерес.

Текст кнопки:
```
Лист ожидания
```

Ссылка:
```
href="#waiting_list"
```

Правила:
- Не писать «Встать в лист ожидания» на кнопке — кнопка называется коротко: **«Лист ожидания»**.
- Кнопка использует стиль основного CTA: красная `#CC2841`, белый текст, `border-radius: 999px`.
- В empty-state рядом можно добавить вторичную кнопку «Написать в Telegram» или «Задать вопрос», но основной путь — `#waiting_list`.
- Не ставить `id="waiting_list"` на видимые блоки страницы, иначе Tilda может проскроллить к блоку вместо открытия попапа.

### Плавный скролл к якорям

Для внутренних якорей внутри самодостаточного Tilda HTML-блока можно добавлять плавный скролл через JS.

Правила:
- Перехватывать только ссылки вида `href="#..."`, у которых целевой элемент реально существует в DOM.
- Если целевой элемент не найден, не делать `preventDefault()` — Tilda должна сама обработать свои команды и попапы.
- Это особенно важно для `#consalt` и `#waiting_list`: если на странице нет элемента с таким `id`, ссылка должна остаться Tilda-командой, а не превратиться в локальный скролл.
- Учитывать `prefers-reduced-motion: reduce`: в этом случае использовать обычный переход без плавной анимации.
- Для секций, к которым идёт скролл, задавать `scroll-margin-top`, чтобы заголовок не прилипал к верхней границе экрана.

Минимальный паттерн:
```javascript
root.addEventListener('click', function (event) {
  var link = event.target.closest ? event.target.closest('a[href^="#"]') : null;
  if (!link || !root.contains(link)) return;

  var hash = link.getAttribute('href');
  if (!hash || hash === '#') return;

  var target = document.getElementById(hash.slice(1));
  if (!target) return;

  event.preventDefault();

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  target.scrollIntoView({
    behavior: reduceMotion ? 'auto' : 'smooth',
    block: 'start'
  });
});
```

### Mobile-паттерн: горизонтальные фото-карточки

Используется для блоков с 3-4 крупными визуальными карточками, например «Программа», «Что вас ждёт», «Этапы», когда на desktop карточки хорошо смотрятся в сетке, но на mobile длинная вертикальная колонка занимает слишком много высоты.

Правила:
- Desktop: обычная сетка 3-4 колонки в общей ширине страницы.
- Tablet: допустима сетка 2 колонки.
- Mobile ≤820px: переводить карточки в горизонтальный swipe без JS-библиотек.
- На экране должна быть видна одна карточка и небольшой край следующей — это подсказывает пользователю, что блок можно листать.
- Использовать `scroll-snap`, чтобы карточки фиксировались аккуратно.
- Скрывать scrollbar, но не отключать нативную прокрутку.
- Не делать тяжёлый слайдер, если достаточно CSS `overflow-x`.

Минимальный CSS:
```css
.mbs-block__cards {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}

@media (max-width: 1180px) {
  .mbs-block__cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 820px) {
  .mbs-block__cards {
    display: flex;
    gap: 14px;
    margin-right: -14px;
    padding: 0 14px 6px 0;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .mbs-block__cards::-webkit-scrollbar {
    display: none;
  }

  .mbs-block__card {
    flex: 0 0 min(82vw, 320px);
    scroll-snap-align: start;
  }
}
```

Для страницы `/excu` этот паттерн используется в блоке «Программа»: desktop — 4 фото-карточки в общей ширине страницы, mobile — горизонтальное листание карточек «Контроль качества», «Зелёное зерно и отбор», «Оборудование и профиль», «Дегустация кофе».

### Паттерн: горизонтальная галерея фотоальбомов

Используется для блоков с несколькими фотоальбомами, когда нужно сэкономить высоту страницы и дать переход в попап с подробным просмотром фотографий. Пример: `/master_doma`, блок «Как проходят встречи».

Правила:
- На desktop и mobile карточки фотоальбомов идут в один горизонтальный ряд, а не в многострочную сетку.
- Не делать вокруг слайдера отдельную белую рамку, декоративную карточку-контейнер или градиенты по краям. Фон задаёт сама секция, карточки остаются самостоятельными.
- Прокрутка должна быть нативной: `overflow-x: auto`, `scroll-snap-type: x mandatory`, `-webkit-overflow-scrolling: touch`.
- Для явной листаемости можно использовать стрелки влево/вправо, но не отключать нативную прокрутку.
- Карточка фотоальбома должна быть валидным контейнером: `article role="button" tabindex="0"` или ссылка. Не использовать `<button>` с `div`, `h3`, `p` внутри — Safari может рендерить такие карточки нестабильно.
- Открытие карточки должно работать по клику, `Enter` и `Space`.
- Верхняя фотография карточки всегда лежит в отдельной media-обёртке и заполняет её через `position:absolute`, `inset:0`, `width:100%`, `height:100%`, `object-fit:cover`.
- Если фото приходят из Google Drive/LH3, нормализовать размер URL: отдельный размер для обложки карточки и больший размер для попапа.
- Попап создавать через JS в `document.body`, чтобы он не зависел от stacking context Tilda-блока.

Минимальный CSS для media-обёртки:
```css
.mbs-gallery__card {
  flex: 0 0 min(360px, 78vw);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 18px;
  background: #F5F5F5;
  border: 1px solid rgba(31,31,31,.08);
  cursor: pointer;
}

.mbs-gallery__image-wrap {
  position: relative;
  width: 100%;
  padding-top: 76%;
  overflow: hidden;
  background: #E7F2E3;
}

.mbs-gallery__image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center center;
  display: block;
}
```

Где ставить кнопку «Оставить заявку»:
1. **Hero-блок** — рядом с красной кнопкой (outline-вариант, зелёный)
2. **Финальный CTA (последний блок)** — второй крупной кнопкой под/рядом с основной красной кнопкой

Паттерн финального CTA:
- Снаружи белый фон `#FFFFFF`.
- Внутри светло-зелёная карточка `#E7F2E3`, скругление `28px`.
- Desktop-сетка: `grid-template-columns: 1fr 260px`, `gap: 60px`, `align-items: center`.
- Левая колонка: label, H2, поясняющий текст.
- Правая колонка: одна или две крупные CTA-кнопки и контакты менеджера.
- Основная кнопка красная `#CC2841`, secondary-кнопка белая с зелёным текстом `#417033`.
- Для событийных страниц с расписанием допустим вариант с одной кнопкой «К расписанию» и контактами ниже, если отдельная кнопка «Задать вопрос» перегружает блок.
- Кнопки: `min-height: 58px`, `border-radius: 999px`, `font-weight: 900`, иконка + текст.
- Для кнопок и контактов в финальном CTA использовать **inline SVG-иконки**, чтобы блок был автономным в Tilda и не зависел от загрузки внешней библиотеки.
- Не использовать мелкую текстовую ссылку «оставить заявку» вместо кнопки.

Контактный fallback в финальном CTA:
- Под кнопками добавлять контакты менеджера:
  - `+7 995 999 2836` → `tel:+79959992836`
  - `Написать в Telegram` → `https://t.me/Moscow_barista_school`
  - `Написать в WhatsApp` → `https://wa.me/message/42GZ6YYBJTM5B1`
- Контакты выравниваются слева, рядом с каждым пунктом стоит зелёная inline SVG-иконка.
- Контакты должны быть визуально вторичными: текст `13–14px`, цвет `#555`, hover `#417033`.
- Это не заменяет основные CTA-кнопки. Это fallback для клиента, который хочет задать вопрос напрямую.
- Для всех внешних ссылок с `target="_blank"` использовать `rel="noopener noreferrer"`.

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

<!-- Финальный CTA: две кнопки + контакты -->
<div class="mbs-cta__actions">
  <a href="#order:Онлайн мастер-класс=5000" class="mbs-cta__btn">Записаться на мастер-класс</a>
  <a href="#consalt" class="mbs-cta__btn-secondary">Оставить заявку</a>
  <div class="mbs-cta__contacts">
    <a href="tel:+79959992836">+7 995 999 2836</a>
    <a href="https://t.me/Moscow_barista_school" target="_blank" rel="noopener noreferrer">Написать в Telegram</a>
    <a href="https://wa.me/message/42GZ6YYBJTM5B1" target="_blank" rel="noopener noreferrer">Написать в WhatsApp</a>
  </div>
</div>
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

### Финальный CTA (светло-зелёная карточка)
```css
background: #E7F2E3;
border-radius: 28px;
padding: 64px 72px;
display: grid;
grid-template-columns: 1fr 260px;
gap: 60px;
align-items: center;
```

---

## 8. Иконки

### Библиотека: Phosphor Icons (актуальная)

Начиная с проекта **«О школе» (baristaschool.ru/company)** и далее — используется библиотека **Phosphor Icons** вместо SVG inline.

**Подключение** (один раз в блоке или глобально):
```html
<script src="https://unpkg.com/@phosphor-icons/web@2.1.1"></script>
```

**Использование** — через тег `<i>` с классом:
```html
<i class="ph ph-coffee"></i>
<i class="ph ph-trophy"></i>
<i class="ph ph-rocket-launch"></i>
```

**Стиль** — стилизуется через `font-size` и `color` на родителе или самом теге:
```css
.icon-wrap i { font-size: 22px; line-height: 1; }
```

**Применяемые иконки в проектах MBS:**
| Иконка | Класс | Где используется |
|---|---|---|
| Стопка | `ph-stack` | «Учим профессии» |
| Кубок | `ph-trophy` | «Тренеры-чемпионы» |
| Сетка | `ph-grid-four` | «Работаем с бизнесом» |
| Кофе | `ph-coffee` | Эспрессо, кофейное меню |
| Кофейное зерно | `ph-coffee-bean` | Альтернатива |
| Часы | `ph-clock` | Каппинг |
| Фургон | `ph-van` | Выездное обучение |
| Ракета | `ph-rocket-launch` | Запуск кофейни |
| Линейка | `ph-ruler` | Барная эргономика |
| Метка | `ph-map-pin` | Адрес |

> ⚠️ **SVG inline обычно не используется.** Все новые блоки и страницы — Phosphor Icons через CDN.
> Исключение: финальный CTA в HTML-вставках Tilda. Для кнопок и контактов финального CTA inline SVG разрешён и предпочтителен, чтобы блок был автономным и не зависел от загрузки внешней библиотеки.
> Старые страницы на SVG inline не мигрируются принудительно, но при редактировании заменяются.

---

### Контейнер иконки (CSS — без изменений)

```css
/* Стандартный контейнер */
width: 46px; height: 46px;
border-radius: 14px;
background: #E7F2E3;
color: #417033;
display: grid; place-items: center;

/* Мобильный / компактный контейнер */
width: 36px; height: 36px;
border-radius: 10px;
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
10  final-cta    Финальный призыв: светло-зелёная карточка + 2 CTA-кнопки + контакты
```

> ⚠️ **Блок «Отзывы» — НЕ верстать в коде.** Блок с отзывами уже существует на Tilda как готовый нативный блок и вставляется на страницу напрямую в редакторе Tilda — не через Zero Block. При разработке любой страницы этот блок **пропускается** в нумерации (номер зарезервирован, но файл и HTML не создаются).

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
2. __media         (видео или фото)
3. __lead--mobile  (если есть фото — lead идёт ПОСЛЕ фото, а не перед ним)
4. __content-bottom (badges + кнопки)
```
На desktop медиа позиционируется через `grid-column: 2; grid-row: 1 / span 2`.

---

### Hero с фотографией — правила вёрстки

**Когда в hero вместо видео — статичная фотография.**

#### Desktop (≥821px)
- Grid: `grid-template-columns: 1fr 480px`, `gap: 0 56px`, `padding: 72px 76px`
- Левая колонка: лейбл → h1 → lead → badges → кнопки
- Правая колонка: фото на всю высоту двух строк (`grid-column: 2; grid-row: 1 / span 2`)
- Высота фото: **600px** (фиксированная, не `flex: 1` по высоте)

#### Mobile (≤820px)
- Одна колонка, порядок: **h1 → фото → lead → badges → кнопки**
- Lead на десктопе скрывается (`.mbs-hero__lead--desktop { display: none }`), на мобайле показывается под фото (`.mbs-hero__lead--mobile`)
- Высота фото: **267px** (фиксированная)
- Высота на `≤420px`: **300px**

#### CSS img-wrap — обязательные правила

```css
/* БАЗОВЫЙ стиль */
.mbs-hero__img-wrap {
  border-radius: 20px; overflow: hidden;
  background: #E7F2E3; height: 600px;
  display: flex; align-items: center; justify-content: center;
  /* НЕ СТАВИТЬ flex: 1 — иначе на мобайле height переопределяется растяжением */
}

/* Если родитель — flex-контейнер, и нужно растянуть на всю высоту на десктопе — использовать align-self: stretch вместо flex: 1 */

.mbs-hero__img-wrap img {
  width: 100%; height: 100%; object-fit: cover;
  object-position: center bottom; /* прижать к низу — кофемашина/барная стойка всегда в кадре */
  display: block;
}

/* MOBILE ≤820px — обязательно flex: none, иначе height игнорируется */
@media (max-width: 820px) {
  .mbs-hero__img-wrap { flex: none; height: 267px; min-height: 267px; }
}
@media (max-width: 420px) {
  .mbs-hero__img-wrap { flex: none; height: 300px; min-height: 300px; }
}
```

> ⚠️ **Главная ловушка:** если `.mbs-hero__media` — flex-колонка (`flex-direction: column`), то `flex: 1` на img-wrap **растягивает** его на всю высоту родителя и игнорирует `height` из медиа-запросов. Всегда добавлять `flex: none` в мобильный брейкпоинт.

> **`object-position: center bottom`** — универсальное значение когда важный объект (кофемашина, человек) находится в нижней части кадра. Для фото с лицом использовать `center top`.

---

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

## 15. Паттерн: аккордеон с плавной анимацией

> ⚠️ Это критически важный раздел. Неправильная реализация приводит к тому, что аккордеон **открывается и сразу сворачивается обратно**.
>
> Правило применяется ко всем аккордеонам на странице: FAQ, программа, расписание, этапы, состав курса и похожие блоки.
> Если пользователь открывает один пункт, остальные открытые пункты в этом же аккордеоне должны закрываться.
> Исключение можно делать только осознанно, когда по смыслу пользователю нужно сравнивать несколько раскрытых ответов одновременно.

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
Для других блоков использовать тот же принцип с локальными классами, например:
`mbs-program__item` + `mbs-program__body`, `mbs-steps__item` + `mbs-steps__body`.

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

### Четыре ключевых правила, без которых не работает

| # | Правило | Почему |
|---|---|---|
| 1 | `body.offsetHeight` (синхронный forced reflow) | Без него браузер «склеивает» начальное и конечное состояние, анимация не запускается |
| 2 | `ev.propertyName !== 'height'` в transitionend | `transitionend` срабатывает для каждого анимируемого свойства; без проверки обработчик вызовется лишний раз |
| 3 | После открытия ставить `'auto'`, не `''` | `''` снимает инлайн-стиль → CSS `height: 0` вступает в силу → аккордеон сразу закрывается |
| 4 | При открытии нового пункта закрывать остальные открытые пункты в этом же аккордеоне | Блок остаётся компактным, особенно на мобильном; пользователь видит один ответ в фокусе |

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

## 17. Попап-модалка в Tilda — единственно правильный способ

### Проблема: почему обычный CSS-попап ломается внутри Tilda

Tilda оборачивает каждый HTML-блок в контейнер с `transform`, `opacity` или `will-change`.  
Любой `position: fixed` внутри такого контейнера перестаёт быть фиксированным относительно  
viewport — он фиксируется относительно ближайшего stacking context (родителя Tilda).  
В итоге модалка съезжает, обрезается или не перекрывает весь экран.

**❌ НЕ ДЕЛАЙ ТАК (ломается в Tilda):**
```html
<!-- Попап внутри блока — НЕПРАВИЛЬНО -->
<div id="modal" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:999;">
  ...
</div>
```

### ✅ Правильный паттерн: создавать DOM через JS и вставлять в `document.body`

Элементы, добавленные через `document.body.appendChild()` напрямую, не наследуют  
stacking context Tilda-блоков. `position: fixed` работает корректно.

**Базовый шаблон:**

> ⚠️ Для новых попапов на страницах сайта предпочтителен overlay-паттерн с `display:flex`, описанный ниже в блоке «Попап “Задать вопрос”».  
> Центрирование через `top: 50%; left: 50%; transform: translate(-50%, -50%)` может некорректно работать в локальном iframe-preview и отдельных Tilda-контейнерах.

```javascript
function createModalDOM() {
  // Бэкдроп
  const backdrop = document.createElement('div');
  backdrop.id = 'mbs-modal-backdrop';
  backdrop.style.cssText = `
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(0,0,0,0.55);
    display: none; opacity: 0;
    transition: opacity 0.25s ease;
  `;

  // Контейнер модалки
  const modal = document.createElement('div');
  modal.id = 'mbs-modal';
  modal.style.cssText = `
    position: fixed; z-index: 10000;
    top: 50%; left: 50%; transform: translate(-50%, -50%) translateY(16px);
    width: min(520px, calc(100vw - 32px));
    background: #fff; border-radius: 20px;
    padding: 40px 36px 36px;
    display: none; opacity: 0;
    transition: opacity 0.25s ease, transform 0.25s ease;
    box-shadow: 0 24px 64px rgba(0,0,0,0.18);
    overflow: hidden;
  `;

  // Крестик закрытия — ОБЯЗАТЕЛЬНО min-width/min-height + box-sizing
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '&times;';
  closeBtn.style.cssText = `
    position: absolute; top: 14px; right: 14px;
    width: 32px; min-width: 32px;
    height: 32px; min-height: 32px;
    border-radius: 50%; box-sizing: border-box;
    padding: 0; border: none; cursor: pointer;
    background: rgba(0,0,0,0.07);
    font-size: 20px; line-height: 1;
    color: #555; display: flex; align-items: center; justify-content: center;
  `;
  // ⚠️ Без min-width/min-height браузер делает кнопку овальной из-за flexbox растяжки

  modal.appendChild(closeBtn);
  // ... добавить остальной контент модалки

  // Вставить ТОЛЬКО в body — не внутрь блока
  document.body.appendChild(backdrop);
  document.body.appendChild(modal);

  return { backdrop, modal, closeBtn };
}

// Открытие
function openModal() {
  const { backdrop, modal } = createModalDOM(); // или получить уже созданные
  backdrop.style.display = 'block';
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
  // Forced reflow перед анимацией
  backdrop.offsetHeight;
  backdrop.style.opacity = '1';
  modal.style.opacity = '1';
  modal.style.transform = 'translate(-50%, -50%) translateY(0)';
}

// Закрытие
function closeModal() {
  backdrop.style.opacity = '0';
  modal.style.opacity = '0';
  modal.style.transform = 'translate(-50%, -50%) translateY(16px)';
  document.body.style.overflow = '';
  setTimeout(() => {
    backdrop.style.display = 'none';
    modal.style.display = 'none';
  }, 300); // совпадает с transition duration
}
```

**Подключение кнопок-триггеров:**
```javascript
// Вешать на все кнопки с нужным href или data-атрибутом
document.querySelectorAll('a[href="#consalt"]').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    openModal();
  });
});
```

### Попап «Задать вопрос» — выбор способа связи

Используется, когда рядом с покупкой/онлайн-записью нужна не прямая ссылка в один мессенджер, а выбор удобного канала связи.

Триггер:
```html
<button type="button" data-mbs-contact-open>Задать вопрос</button>
```

Каналы в попапе:
- MAX → `https://max.ru/id744517097939_bot`
- WhatsApp → `https://wa.me/message/42GZ6YYBJTM5B1`
- Telegram → `https://t.me/Join_MBS_bot?start=c1746815986063-ds`

Тексты:
- Заголовок: «Где вам удобнее задать вопрос?»
- Lead: «Выберите канал связи. Мы ответим по формату, местам, оплате и организационным деталям.»
- Подписи у каналов: «Написать в чат менеджеру»
- Подпись снизу: «Обычно отвечаем в рабочее время. Если вопрос срочный, выберите WhatsApp.»
- Не писать в интерфейсе «бот», даже если техническая ссылка ведёт на bot URL.

Визуальные правила:
- Попап белый, `border-radius: 20–24px`, тень `0 24px 60px rgba(0,0,0,.16)`.
- Overlay затемняет страницу: `rgba(25, 32, 23, .35–.48)`.
- Кнопки каналов — компактные карточки `#F5F5F5`, hover `#E7F2E3`.
- Иконки — inline SVG, зелёный круг `#417033`, белая тонкая линия внутри.
- Для MAX использовать нейтральную SVG-иконку чата без букв MAX внутри иконки.
- Не использовать жирные SVG: ориентир `stroke-width: 1.5–1.6`.

Технические правила:
- Попап создавать через JS и вставлять в `document.body`, не внутрь Tilda-блока.
- Overlay делать отдельным fixed/flex-слоем по паттерну `mbs-calendar`: `.overlay.active { display: flex; }`.
- Центрировать модалку через flex `align-items: center; justify-content: center`, а не через `top: 50%; left: 50%; transform: translate(-50%, -50%)`.
- В локальном iframe-preview учитывать видимую область родительского окна, иначе попап может открыться выше/ниже текущего экрана.
- При открытии блокировать scroll за пределами попапа у `html` и `body`; в iframe-preview также блокировать scroll родительского документа, если доступен.
- Закрытие: крестик, клик по overlay, Escape.
- Добавлять focus trap: Tab и Shift+Tab должны ходить только внутри попапа.
- Кнопка закрытия должна иметь `min-width`, `min-height`, `box-sizing: border-box`, иначе в flex-контексте Tilda она может стать овальной.

Минимальная структура:
```html
<div class="mbs-contact-overlay">
  <div class="mbs-contact-modal" role="dialog" aria-modal="true" aria-labelledby="mbs-contact-title">
    <button type="button" class="mbs-contact-close" aria-label="Закрыть">...</button>
    <span class="mbs-contact-label">Связь с менеджером</span>
    <h3 id="mbs-contact-title">Где вам удобнее задать вопрос?</h3>
    <p>Выберите канал связи. Мы ответим по формату, местам, оплате и организационным деталям.</p>
    <a href="https://max.ru/id744517097939_bot" target="_blank" rel="noopener noreferrer">MAX</a>
    <a href="https://wa.me/message/42GZ6YYBJTM5B1" target="_blank" rel="noopener noreferrer">WhatsApp</a>
    <a href="https://t.me/Join_MBS_bot?start=c1746815986063-ds" target="_blank" rel="noopener noreferrer">Telegram</a>
  </div>
</div>
```

**Блокировка прокрутки на iOS (touchmove):**
```javascript
function lockScroll(e) { e.preventDefault(); }
// При открытии:
document.addEventListener('touchmove', lockScroll, { passive: false });
// При закрытии:
document.removeEventListener('touchmove', lockScroll);
```

### Ключевые правила

| Правило | Почему |
|---|---|
| `document.body.appendChild()` — только так | Выходит из stacking context Tilda |
| Все стили модалки — инлайн через `style.cssText` | Tilda не перезаписывает инлайн-стили |
| Кнопка закрытия: `min-width + min-height + box-sizing: border-box + padding: 0` | Иначе flex-контейнер растягивает кнопку в овал |
| `backdrop.offsetHeight` перед сменой opacity | Forced reflow — без него анимация не работает |
| Инициализировать модалку через `DOMContentLoaded` или сразу при загрузке | Tilda может применять `opacity: 0` к статичным элементам через animate-on-scroll |
| НЕ использовать `body { position: fixed }` для блокировки скролла | Сбрасывает позицию страницы на iOS |

---

---

---

## ⚠️ Правила из опыта (Lessons Learned)

### Hero: высота изображения в двухколоночном гриде

**Проблема:** высота фото в hero зависит от высоты левой колонки (h1 + lead + features + buttons). Если не зафиксировать её сразу, в итоге получается итерация:
`aspect-ratio` → слишком квадратное → `flex: 1` → слишком вытянутое → жёсткое `height`.

**Правило:** перед вёрсткой **сразу задавать жёсткую высоту** изображения в пикселях (например, 600px), не `aspect-ratio` и не `flex: 1`.

```css
/* Шаблон: изображение hero */
.mbs-hero__img-wrap {
  height: 600px;       /* ← фиксируем сразу */
  margin-top: 41px;    /* выравнивание по заголовку h1 (лейбл 27px + margin 14px) */
  border-radius: 20px;
  overflow: hidden;
}
```

> `margin-top: 41px` = высота лейбла (27px) + его `margin-bottom` (14px). Изображение выровнено по началу заголовка h1.

---

## 16. Изображение в Hero-блоке

### Два паттерна размещения

#### Паттерн A — «Широкая правая колонка» (barista-interview, bar-ergonomics)
Используется когда правая колонка занимает ≥520px и нет дополнительных элементов под фото.

```css
/* Grid: правая колонка фиксирована */
grid-template-columns: 1fr 520px;

/* Обёртка: span обеих строк + жёсткая высота */
.mbs-hero__img-wrap {
  grid-column: 2;
  grid-row: 1 / span 2;
  height: 600px;           /* фиксированная высота */
  margin-top: 41px;        /* = высота лейбла + его margin-bottom */
  border-radius: 20px;
  overflow: hidden;
  background: #E7F2E3;     /* заглушка до загрузки */
}
.mbs-hero__img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
```

#### Паттерн B — «Медиа-колонка с ограничением» (home-barista, мастер-классы)
Используется когда под фото расположены дополнительные элементы (чипы цены, Trust-блок и т.п.) и высота правой колонки может варьироваться.

```css
/* Grid: правая колонка ≈480px */
grid-template-columns: 1fr 480px;

/* Обёртка: flex + ограничение максимальной высоты */
.mbs-hero__img-wrap {
  flex: 1;                  /* растягивается по содержимому */
  min-height: 320px;        /* минимум чтобы не схлопнуться */
  max-height: 460px;        /* ← ключевое: не превышать на десктопе */
  border-radius: 20px;
  overflow: hidden;
  background: #E7F2E3;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.mbs-hero__img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
```

> **Когда выбирать Паттерн B:** есть чипы / бейджи / Trust под фото; правая колонка оборачивает несколько элементов в `flex-direction: column`.

---

## SEO-паттерн для Tilda HTML-блоков

Для продающих страниц, которые собираются одним самодостаточным HTML-блоком, SEO нужно фиксировать в двух местах:

1. **Tilda Page Settings** — основной источник для поисковиков и соцсетей.
2. **HTML-блок** — дополнительный слой: structured data, canonical/OG/meta через JS, если блок вставляется в уже существующую страницу.

Минимальные поля для Tilda Page Settings:
- `Title` — название услуги + бренд.
- `Description` — 130-160 символов, что это за услуга, для кого и главный сценарий действия.
- `Canonical URL` — чистый адрес страницы без UTM.
- `Social title`, `Social description`, `Social image`.

Для страницы услуги добавлять JSON-LD:
- `WebPage` — адрес, название, описание, язык, связь с сайтом.
- `Service` — название услуги, провайдер, зона оказания, offer/цена при наличии.
- `FAQPage` — только вопросы и ответы, которые реально видны на странице.
- `BreadcrumbList` — Главная → текущая страница.
- `Event` — если страница показывает даты мероприятий из API. События можно формировать динамически после загрузки расписания.

Правила безопасности SEO-слоя:
- Не вставлять в JSON-LD непроверенные внешние URL без allowlist.
- Для yClients-ссылок разрешать только `https` и домены yClients.
- Если расписание не загрузилось, не создавать фальшивые `Event`-события.
- Для страницы, которая будет опубликована на Tilda, основные SEO-поля всё равно дублировать в настройках Tilda, потому что JS-мета может считываться не всеми системами одинаково.

Пример рекомендуемых SEO-настроек для `/excu`:

| Поле | Значение |
|---|---|
| Title | `Экскурсия на обжарочное производство кофе | Московская школа бариста` |
| Description | `Экскурсия на действующее обжарочное производство: зелёное зерно, оборудование, профиль обжарки, дегустация кофе и онлайн запись на ближайшие даты.` |
| Canonical URL | `https://baristaschool.ru/excu` |

После публикации проверять:
- Schema.org Validator;
- Google Rich Results Test;
- наличие canonical и OG-мета в исходной опубликованной странице.

---

### Атрибуты тега `<img>`

```html
<img
  src="https://CDN_URL/image.jpg"
  alt="[Название курса] — [краткое описание]"
  loading="eager"
/>
```

| Атрибут | Значение | Зачем |
|---|---|---|
| `loading` | `eager` | Hero — первый экран, нельзя откладывать загрузку |
| `alt` | Название курса + описание | SEO + доступность |
| `width` / `height` | Не задаём | Управляем через CSS (100%×100%) |

> ⚠️ Не использовать `loading="lazy"` на фото Hero — браузер откладывает загрузку, изображение появляется после скролла.

---

### Плейсхолдер до появления реального фото

Пока фото не готово — вставляем плейсхолдер с иконкой:

```html
<div class="mbs-hero__img-wrap">
  <div class="mbs-hero__img-placeholder">
    <i class="ph ph-image" style="font-size:56px;opacity:0.4;"></i>
    <span>Фото</span>
  </div>
</div>
```

```css
.mbs-hero__img-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #417033;
  opacity: 0.5;
  font-size: 13px;
  font-weight: 700;
  text-align: center;
  padding: 20px;
}
```

Как только фото готово — заменяем `<div class="mbs-hero__img-placeholder">…</div>` на `<img src="…" alt="…" loading="eager" />`.

---

### Адаптив

| Брейкпоинт | Правило |
|---|---|
| `≤1180px` | Сетка переходит в одну колонку (`grid-template-columns: 1fr`), медиа занимает полную ширину |
| `≤820px` | Высота фото фиксируется: `height: 400px; min-height: 400px` |
| `≤480px` | Высота уменьшается: `height: 300px; min-height: 300px` |

```css
@media (max-width: 820px) {
  .mbs-hero__img-wrap {
    height: 400px;
    min-height: 400px;
    max-height: none;    /* снимаем ограничение — на мобиле высота жёсткая */
  }
}
@media (max-width: 480px) {
  .mbs-hero__img-wrap {
    height: 300px;
    min-height: 300px;
  }
}
```

> На мобиле `max-height` снимается (`max-height: none`) — иначе `max-height` конкурирует с `height` и фото может схлопнуться.

---

### Источники фото

Фотографии тренеров и атмосферные снимки хранятся на Tilda CDN:
```
https://static.tildacdn.com/tild[HEX-ID]/[filename]
```

Для Героя использовать **атмосферные фото**: руки бариста за работой, кофе крупным планом, процесс приготовления. Не использовать постановочные портреты — они идут в блок «Тренеры».

---

### Что не делать

| ❌ Нельзя | ✅ Правильно |
|---|---|
| `aspect-ratio: 4/3` на img-wrap | Жёсткая `height` или `flex: 1` без max-height |
| `flex: 1` без `min-height` | `flex: 1` + `min-height: 320px` |
| `loading="lazy"` на Hero-фото | `loading="eager"` |
| `<img>` без `alt` | `alt="Название курса — описание"` |
| Портрет тренера в Hero | Атмосферное фото процесса / напитка |

---

## 17. Hero с двумя вариантами цены

Применяется когда мастер-класс можно купить в двух форматах (например, «один» и «вдвоём»). Ценовой блок располагается в **левой колонке** — между facts-чипами и кнопками.

### Структура левой колонки (content-bottom)

```
facts-чипы  (3 часа / Индивидуально / В удобное время)
    ↓
price-card  (два варианта цены)
    ↓
btns        (Записаться онлайн + Оставить заявку)
```

### HTML

```html
<!-- Facts -->
<div class="mbs-hero__facts">
  <div class="mbs-hero__fact"><i class="ph ph-clock"></i> 3 часа</div>
  <div class="mbs-hero__fact"><i class="ph ph-user"></i> Индивидуально</div>
  <div class="mbs-hero__fact"><i class="ph ph-calendar-blank"></i> В удобное время</div>
</div>

<!-- Price card -->
<div class="mbs-hero__price-card">
  <div class="mbs-hero__price-row-inner">
    <div class="mbs-hero__price-who">
      <i class="ph ph-user"></i>
      Один участник
    </div>
    <div class="mbs-hero__price-val">10 000 ₽</div>
  </div>
  <div class="mbs-hero__price-row-inner">
    <div class="mbs-hero__price-who">
      <i class="ph ph-users-two"></i>
      Вдвоём
    </div>
    <div class="mbs-hero__price-val mbs-hero__price-val--accent">14 000 ₽</div>
  </div>
</div>

<!-- Кнопки -->
<div class="mbs-hero__btns">
  <a href="https://…yclients…" target="_blank" rel="noopener noreferrer" class="mbs-hero__btn-primary">
    <i class="ph ph-calendar-check"></i>
    Записаться онлайн
  </a>
  <a href="#consalt" class="mbs-hero__btn-secondary">
    <i class="ph ph-chat-dots"></i>
    Оставить заявку
  </a>
</div>
```

### CSS

```css
/* Разделитель между facts и кнопками */
.mbs-hero__facts { margin-bottom: 16px; }
.mbs-hero__btns {
  padding-top: 20px;
  border-top: 1.5px solid #E7F2E3;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

/* Price card — горизонтальная карточка, два варианта в ряд */
.mbs-hero__price-card {
  background: #fff;
  border: 1.5px solid #E7F2E3;
  border-radius: 14px;
  padding: 0;
  display: flex;
  align-items: stretch;
  overflow: hidden;
  margin-bottom: 0;       /* нет gap — разделитель через border-top у btns */
}
.mbs-hero__price-row-inner {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 12px 16px;
  flex: 1;
}
.mbs-hero__price-row-inner + .mbs-hero__price-row-inner {
  border-left: 1px solid #E7F2E3;
}
.mbs-hero__price-who {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 600;
  color: #999;
  white-space: nowrap;    /* ← обязательно, иначе перенос на мобиле */
}
.mbs-hero__price-who i { color: #417033; font-size: 13px; }
.mbs-hero__price-val {
  font-size: 17px;
  font-weight: 900;
  color: #1F1F1F;
  white-space: nowrap;
}
.mbs-hero__price-val--accent { color: #417033; }  /* выделяем выгодный вариант */
```

### Правила

| Правило | Пояснение |
|---|---|
| `white-space: nowrap` на `.price-who` | Текст «Один участник» / «Вдвоём» не должен переноситься |
| Акцентный цвет `#417033` на более выгодном варианте | Визуально направляет к паре |
| Карточка между facts и кнопками | Логика: сначала формат → потом цена → потом действие |
| Зачёркнутая старая цена — **не показываем** | Экономия не нужна, лишний визуальный шум |
| `border-top` у `.btns`, не `margin-top` у price-card | Разделитель виден всегда, независимо от того есть ли price-card |
| На мобиле price-card остаётся в `content-bottom` | Та же позиция — под фото и subtitle, перед кнопками |

### Мобильный адаптив

На мобиле (`≤820px`) subtitle переносится под фото через отдельный элемент с `display: none / block`:

```html
<!-- В content-top — только на десктопе -->
<p class="mbs-hero__subtitle mbs-hero__subtitle--desktop">…</p>

<!-- После media-блока — только на мобиле -->
<p class="mbs-hero__subtitle mbs-hero__subtitle--mobile">…</p>
```

```css
.mbs-hero__subtitle--mobile { display: none; }

@media (max-width: 820px) {
  .mbs-hero__subtitle--desktop { display: none; }
  .mbs-hero__subtitle--mobile {
    display: block;
    grid-column: 1;
    grid-row: 3;          /* после media (row 2) */
    font-size: 15px;
    line-height: 1.5;
  }
  /* content-bottom смещается в row 4 */
  .mbs-hero__content-bottom { grid-row: 4; }
  .mbs-hero__card { grid-template-rows: auto auto auto auto; }
}
```

---

### Шапка и подвал — никогда не делаем свои

Ни в одном `tilda-block.html`, ни в `index.html` нет тегов `<nav>`, `<header>`, `<footer>`. **Шапка и подвал берётся из стандартных блоков Tilda** (настройки сайта).

Перед публикацией проверить в **Настройках страницы → Дополнительно**: опции «Отображать шапку» и «Отображать подвал» — выключить, если страница полностью заменяет стандартный лейаут.

---

---

## Tilda — глобальные стили перебивают цвет ссылок в Zero Block

**Проблема:** Tilda применяет глобальный стиль `a { color: ... }` ко всему содержимому страницы, включая Zero Block. Из-за этого кнопки-ссылки внутри кастомного блока получают цвет темы сайта (например, красный `#cc2841`) вместо заданного в блоке цвета.

**Решение:** на `color` и `text-decoration` у всех ссылок в Zero Block добавлять `!important`:

```css
.mbs-БЛОК__link {
  color: #1f1f1f !important;
  text-decoration: none !important;
}

.mbs-БЛОК__link:hover {
  color: #417033 !important;
}

.mbs-БЛОК__link--primary {
  color: #fff !important;
}

.mbs-БЛОК__link--primary:hover {
  color: #fff !important;
}
```

**Правило:** любой `<a>` внутри Zero Block, у которого задан кастомный цвет — должен иметь `color: ... !important`.

---

## Tilda Zero Block — подключение Phosphor Icons

Иконки Phosphor Icons (`@phosphor-icons/web`) используются на страницах МШБ вместо emoji.

**Подключение через CDN** (в начале `tilda-block.html`, до `<style>`):
```html
<link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css">
```

> ⚠️ Если Tilda не позволяет `<link>` внутри Zero Block — добавить строку в **Настройки сайта → Ещё → HTML-код в `<head>`** (один раз для всего сайта).

**Использование:**
```html
<i class="ph ph-house"></i>
<i class="ph ph-graduation-cap"></i>
<i class="ph ph-calendar"></i>
<i class="ph ph-coffee"></i>
<i class="ph ph-buildings"></i>
<i class="ph ph-map-pin"></i>
```

---

## Tilda `<head>` — глобальная диагностика сайта

В глобальном HTML-коде `<head>` Tilda подключён лёгкий мониторинг доступности сайта:

```html
<script defer src="https://api.barista-school.ru/site-health/monitor.js"></script>
```

**Правило:** не удалять этот скрипт при чистке аналитики, счётчиков или сторонних вставок в настройках сайта. Он нужен, чтобы отслеживать:

- частичную загрузку страниц;
- зависшие skeleton/loading-блоки;
- ошибки внешних ресурсов;
- JS-ошибки;
- медленные API-запросы и виджеты.

Где смотреть диагностику: `https://159-194-202-120.sslip.io/site-health`.

Подробности инфраструктуры и расшифровка логов: `YCLIENTS_SYNC.md`, раздел «Диагностика доступности сайта baristaschool.ru».

---

## ⚠️ Известные баги и ловушки (Tilda + кастомные HTML-блоки)

### Tilda popup-якорь конфликтует с `id` на видимой секции

**Симптом:** Кнопка с `href="#consalt"` скроллит страницу вниз вместо открытия Tilda-попапа.

**Причина:** Tilda перехватывает клик по `href="#consalt"` и открывает попап **только если** в DOM нет элемента с `id="consalt"`. Если в кастомном HTML-блоке у какой-либо секции стоит `id="consalt"` (или другой popup-якорь) — браузер находит этот элемент и просто скроллит к нему. Попап не открывается.

**Правило:** Никогда не ставить `id` равный Tilda popup-якорю (например `id="consalt"`, `id="popup1"` и т.д.) на видимые `<section>`, `<div>` или любые другие элементы в кастомных HTML-блоках.

**Пример бага (неправильно):**
```html
<!-- 07-cta.html — НЕПРАВИЛЬНО: id="consalt" на видимой секции -->
<section class="mbs-hb-cta" id="consalt">
  <button href="#consalt">Оставить заявку</button>  <!-- не откроет попап! -->
</section>
```

**Исправление:**
```html
<!-- 07-cta.html — ПРАВИЛЬНО: убрать id с видимой секции -->
<section class="mbs-hb-cta">
  <a href="#consalt">Оставить заявку</a>  <!-- теперь откроет попап -->
</section>
```

**Где встречалось:** `barista-course/home-barista-online/tilda-blocks/07-cta.html` — июнь 2025.

---

### Standalone snippet ломает проектный popup онлайн-записи

**Симптом:** после замены HTML-блока на странице кнопка «Онлайн запись» перестаёт открывать popup, хотя сам виджет записи может быть рабочим.

**Причина:** на некоторых страницах онлайн-запись встроена не как самостоятельный блок, а как проектный popup-wrapper. Кнопки открывают popup через класс страницы, например `.mbs-bc-online-open`, а обработчики открытия/закрытия, reset wizard, share-кнопка и fallback-загрузка JS находятся в отдельном проектном блоке popup. Standalone snippet виджета этих обработчиков не содержит.

**Правило:** перед заменой HTML-блока онлайн-записи сначала найти проектный popup-wrapper. Для страницы `baristaschool.ru/barista_courses` источник правды:

```text
barista-course/barista-courses/tilda-blocks/09-online-booking-popup.html
```

Не вставлять вместо него:

```text
schedule-online/basic-barista-booking/tilda/tilda-snippet.html
```

Этот snippet подходит только для самостоятельной вставки виджета, а не для страницы, где кнопки открывают уже встроенный popup.

---

*Версия: июнь 2026 · Сайт: baristaschool.ru*
