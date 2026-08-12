# Сонячне затемнення над Україною: створюємо навчальну Canvas-анімацію

Цей матеріал — покроковий сценарій створення проєкту на чистих HTML, CSS і JavaScript.  Після завершення проєкт можна запустити звичайним відкриттям `index.html` у браузері.

> Важливо: візуалізація відтворює зібрані для міст час і відсоток закритої площі Сонця, але траєкторія Місяця є навчальною моделлю. Це не астрономічний симулятор для проведення вимірювань.

## 1. Що ми створюємо

На сторінці буде спільна шкала часу від 20:10 до 20:54 та дванадцять карток міст. У кожній картці Canvas показуватиме:

- колір вечірнього неба;
- Сонце, яке наближається до горизонту;
- Місяць, який частково перекриває сонячний диск;
- умовний горизонт;
- поточний відсоток закриття Сонця;
- стан спостереження: очікування, затемнення, видимий максимум або захід Сонця.

Користувач зможе запустити й призупинити анімацію, вручну пересувати повзунок часу та повернутися до початку.

## 2. Навчальні цілі

Під час роботи учень практикує:

- семантичну HTML-розмітку;
- CSS Grid, Flexbox, адаптивність і користувацькі властивості;
- створення DOM-елементів із JavaScript;
- роботу з масивом об’єктів;
- перетворення часу у зручний числовий формат;
- лінійну інтерполяцію та нормалізацію значень;
- Canvas API: градієнти, кола, контури, відсікання і масштабування;
- `requestAnimationFrame()`;
- обробку подій `click`, `input` і `resize`;
- базову доступність інтерактивної сторінки.

## 3. Постановка задачі до написання коду

Спочатку формулюємо не «намалювати затемнення», а конкретні вимоги.

### Функціональні вимоги

1. Усі міста мають використовувати одну спільну модель часу.
2. Для кожного міста зберігаються власні час початку, час видимого максимуму, час заходу Сонця та максимальний відсоток перекриття.
3. До початку затемнення Місяць не перекриває Сонце.
4. Від початку до максимуму перекриття плавно зростає.
5. Після максимуму й до заходу воно трохи змінюється.
6. Після заходу Сонце більше не показується як доступне для спостереження.
7. Повзунок і автоматичне відтворення мають керувати одним і тим самим станом.

### Нефункціональні вимоги

- проєкт працює без сервера і залежностей;
- сітка адаптується до ширини екрана;
- кнопками можна користуватися з клавіатури;
- зміни часу оголошуються допоміжним технологіям;
- Canvas залишається чітким на екранах із високою щільністю пікселів;
- дані й математична модель відокремлені від малювання.

## 4. Збір і перевірка даних

Для кожного міста нам потрібні чотири значення:

| Поле | Приклад | Значення |
|---|---:|---|
| `start` | `20:19` | початок видимої часткової фази |
| `maximum` | `20:47` | найбільша видима фаза до заходу |
| `sunset` | `20:50` | момент заходу Сонця |
| `obscuration` | `43.44` | максимальна закрита площа диска у відсотках |

Не слід плутати два поняття:

- **magnitude** описує, яку частину діаметра Сонця перекрито;
- **obscuration** описує, який відсоток площі диска закрито.

У цьому інтерфейсі показуємо саме `obscuration`, бо користувач читає значення як відсоток закритої площі Сонця.

Під час збору даних важливо перевірити часовий пояс і дату. У проєкті використовується київський місцевий час 12 серпня 2026 року. Астрономічне завершення затемнення може настати пізніше, але після місцевого заходу Сонця спостерігач його вже не бачить. Тому для кожного міста анімація видимого явища обмежується полем `sunset`.

Практична послідовність перевірки даних:

1. Визначити перелік міст.
2. Для кожного міста відкрити те саме надійне джерело.
3. Записати дату, часовий пояс, початок, максимум, захід і obscuration.
4. Не змішувати дані області та конкретного міста без позначки.
5. Орієнтовні значення явно позначити, наприклад `approximate: true`.
6. Перевірити логічну умову `start <= maximum <= sunset`.

## 5. План архітектури

Проєкт складається з трьох робочих файлів:

```text
solar-eclipse-ukraine-vanilla/
├── index.html
├── styles.css
├── app.js
└── README-LESSON-UA.md
```

Відповідальність файлів:

- `index.html` містить постійні частини інтерфейсу;
- `styles.css` відповідає за вигляд і адаптивність;
- `app.js` зберігає дані, створює картки, обчислює стан і малює кадри.

Картки міст не дублюємо вручну в HTML. Їхня структура однакова, тому JavaScript створить дванадцять карток із масиву даних. Це зменшує повторення і дозволяє додати місто одним новим об’єктом.

## 6. Крок 1. Створюємо HTML-каркас

Створіть `index.html` і додайте базову структуру:

```html
<!doctype html>
<html lang="uk">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#07101f" />
  <meta
    name="description"
    content="Анімація часткового сонячного затемнення 12 серпня 2026 року для міст України"
  />
  <title>Сонячне затемнення 2026 — Україна</title>
  <link rel="stylesheet" href="styles.css" />
  <script src="app.js" defer></script>
</head>
<body>
  <main class="page-shell">
    <!-- Вміст сторінки додамо далі -->
  </main>
</body>
</html>
```

`lang="uk"` допомагає браузеру й програмам екранного доступу правильно визначити мову. `viewport` потрібен для адаптивного відображення. Атрибут `defer` відкладає виконання JavaScript до завершення розбору HTML, тому елементи сторінки вже існуватимуть, коли `app.js` почне шукати їх через `querySelector()`.

## 7. Крок 2. Додаємо постійні частини інтерфейсу

Усередині `<main>` створіть заголовок, панель керування, контейнер карток, попередження і примітку про джерела:

```html
<header class="hero">
  <div>
    <p class="eyebrow">12 серпня 2026 · захід і центр України</p>
    <h1>Сонячне затемнення</h1>
    <p class="lede">
      Подивіться, як змінюється видима фаза затемнення залежно від міста —
      безпосередньо перед заходом Сонця.
    </p>
  </div>

  <div class="time-panel" aria-live="polite">
    <span>Київський час</span>
    <strong id="current-time">20:10</strong>
    <span id="phase-label">До початку</span>
  </div>
</header>

<section class="controls" aria-label="Керування анімацією">
  <button
    id="play-button"
    class="play-button"
    type="button"
    aria-label="Відтворити анімацію"
  >
    <span id="play-icon" aria-hidden="true">▶</span>
    <span id="play-text">Відтворити</span>
  </button>

  <label class="timeline-label" for="timeline">
    <span>20:10</span>
    <input
      id="timeline"
      type="range"
      min="0"
      max="44"
      value="0"
      step="0.05"
    />
    <span>20:54</span>
  </label>

  <button id="restart-button" class="icon-button" type="button">
    Почати спочатку
  </button>
</section>

<section aria-labelledby="cities-heading">
  <div class="section-heading">
    <div>
      <p class="eyebrow">Порівняння міст</p>
      <h2 id="cities-heading">Один момент — різне небо</h2>
    </div>

    <div class="legend" aria-label="Умовні позначення">
      <span><i class="legend-sun"></i> Сонце</span>
      <span><i class="legend-moon"></i> Місяць</span>
      <span><i class="legend-horizon"></i> Горизонт</span>
    </div>
  </div>

  <div id="cities-grid" class="cities-grid"></div>
</section>

<aside class="safety" aria-labelledby="safety-title">
  <div class="safety-icon" aria-hidden="true">◉</div>
  <div>
    <h2 id="safety-title">Спостерігайте безпечно</h2>
    <p>
      Не дивіться на Сонце без сертифікованих окулярів ISO 12312-2.
      Звичайні сонцезахисні окуляри та камера без спеціального сонячного
      фільтра не захищають очі.
    </p>
  </div>
</aside>

<footer>
  <p>
    Час і відсоток покриття: Timeanddate. Візуалізація є навчальною
    моделлю; місцевий рельєф і атмосферна рефракція можуть змінити
    фактичний момент заходу.
  </p>
</footer>
```

Контейнер `#cities-grid` спочатку порожній — картки з’являться після виконання JavaScript. `aria-live="polite"` повідомляє допоміжним технологіям, що текст часу може змінюватися. Нативні `<button>` та `<input type="range">` вже мають клавіатурну поведінку, тому не варто замінювати їх на неінтерактивні `<div>`.

## 8. Крок 3. Створюємо базові стилі

У `styles.css` спочатку визначте палітру, глобальну модель розмірів і фон:

```css
:root {
  color-scheme: dark;
  --ink: #f7f5ed;
  --muted: #aab4c8;
  --panel: rgba(13, 24, 43, 0.8);
  --line: rgba(255, 255, 255, 0.12);
  --accent: #ffcb66;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
  color: var(--ink);
  background:
    radial-gradient(circle at 78% -10%, rgba(122, 92, 172, 0.28), transparent 34rem),
    linear-gradient(180deg, #111b31 0, #07101f 34rem, #050b15 100%);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system,
    BlinkMacSystemFont, "Segoe UI", sans-serif;
}

button,
input {
  font: inherit;
}

.page-shell {
  width: min(1480px, calc(100% - 40px));
  margin: 0 auto;
  padding: 56px 0 36px;
}
```

Користувацькі властивості в `:root` збирають кольори в одному місці. `box-sizing: border-box` робить розрахунок ширини елементів передбачуваним: padding і border входять у вказану ширину.

Далі оформіть верхню частину та панель часу:

```css
.hero {
  display: flex;
  justify-content: space-between;
  gap: 32px;
  align-items: end;
  padding-bottom: 34px;
  border-bottom: 1px solid var(--line);
}

.eyebrow {
  margin: 0 0 12px;
  color: var(--accent);
  font-size: 0.76rem;
  font-weight: 750;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  max-width: 880px;
  font-size: clamp(2.8rem, 7vw, 6.8rem);
  font-weight: 650;
  line-height: 0.93;
  letter-spacing: -0.055em;
}

.lede {
  max-width: 760px;
  margin: 22px 0 0;
  color: var(--muted);
  font-size: clamp(1rem, 1.6vw, 1.25rem);
  line-height: 1.55;
}

.time-panel {
  flex: 0 0 auto;
  min-width: 220px;
  padding: 20px 24px;
  border: 1px solid var(--line);
  border-radius: 20px;
  background: rgba(7, 16, 31, 0.58);
  backdrop-filter: blur(16px);
}

.time-panel span {
  display: block;
  color: var(--muted);
  font-size: 0.78rem;
}

.time-panel strong {
  display: block;
  margin: 3px 0;
  font-size: 2.9rem;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
```

`clamp()` дозволяє заголовку плавно змінюватися між мінімальним і максимальним розміром. `font-variant-numeric: tabular-nums` робить цифри однакової ширини: показник часу не «стрибає» під час зміни.

## 9. Крок 4. Оформлюємо керування і сітку

```css
.controls {
  position: sticky;
  top: 12px;
  z-index: 20;
  display: flex;
  gap: 18px;
  align-items: center;
  margin: 22px 0 42px;
  padding: 12px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: rgba(7, 16, 31, 0.82);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(18px);
}

.play-button,
.icon-button {
  min-height: 46px;
  border: 0;
  border-radius: 12px;
  cursor: pointer;
}

.play-button {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 0 18px;
  color: #1b170f;
  background: var(--accent);
  font-weight: 760;
}

.icon-button {
  padding: 0 16px;
  color: var(--ink);
  background: rgba(255, 255, 255, 0.08);
}

.play-button:focus-visible,
.icon-button:focus-visible,
input:focus-visible {
  outline: 3px solid #fff;
  outline-offset: 3px;
}

.timeline-label {
  display: grid;
  grid-template-columns: auto minmax(160px, 1fr) auto;
  gap: 12px;
  align-items: center;
  flex: 1;
  color: var(--muted);
  font-size: 0.78rem;
  font-variant-numeric: tabular-nums;
}

input[type="range"] {
  width: 100%;
  accent-color: var(--accent);
  cursor: pointer;
}

.cities-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.city-card {
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 22px;
  background: var(--panel);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.16);
}

.sky-wrap {
  position: relative;
  aspect-ratio: 1.62;
  overflow: hidden;
  background: #342a45;
}

.city-canvas {
  display: block;
  width: 100%;
  height: 100%;
}
```

`position: sticky` залишає керування у видимій частині сторінки. `minmax(0, 1fr)` важливий у Grid: нульова мінімальна ширина дозволяє колонкам реально стискатися і не розпирати контейнер.

Решту декоративних правил можна дослідити в готовому `styles.css`. Для логіки проєкту ключове, щоб Canvas мав CSS-розміри `width: 100%`, `height: 100%`, а його контейнер — стабільне `aspect-ratio`.

## 10. Крок 5. Додаємо адаптивність

```css
@media (max-width: 1040px) {
  .cities-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .page-shell {
    width: min(100% - 24px, 680px);
    padding-top: 32px;
  }

  .hero,
  .section-heading {
    align-items: stretch;
    flex-direction: column;
  }

  .controls {
    flex-wrap: wrap;
  }

  .timeline-label {
    order: 3;
    flex-basis: 100%;
  }

  .cities-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 500px) {
  .cities-grid {
    grid-template-columns: 1fr;
  }
}
```

Сітка послідовно переходить від чотирьох колонок до трьох, двох і однієї. Це простіше контролювати, ніж намагатися вмістити будь-яку кількість карток одним автоматичним правилом.

## 11. Крок 6. Описуємо міста як дані

У `app.js` створіть масив:

```js
const cities = [
  { name: "Ужгород", start: "20:19", maximum: "20:47", sunset: "20:50", obscuration: 43.44 },
  { name: "Львів", start: "20:17", maximum: "20:43", sunset: "20:51", obscuration: 40.44 },
  { name: "Луцьк", start: "20:15", maximum: "20:41", sunset: "20:53", obscuration: 38.58 },
  { name: "Рівне", start: "20:15", maximum: "20:37", sunset: "20:46", obscuration: 30.57 },
  { name: "Івано-Франківськ", start: "20:18", maximum: "20:38", sunset: "20:46", obscuration: 27.69 },
  { name: "Тернопіль", start: "20:17", maximum: "20:36", sunset: "20:43", obscuration: 26.41 },
  { name: "Хмельницький", start: "20:17", maximum: "20:31", sunset: "20:38", obscuration: 16.33 },
  { name: "Чернівці", start: "20:19", maximum: "20:32", sunset: "20:38", obscuration: 15.01 },
  { name: "Житомир", start: "20:15", maximum: "20:26", sunset: "20:37", obscuration: 12.04 },
  { name: "Вінниця", start: "20:16", maximum: "20:24", sunset: "20:31", obscuration: 6.85 },
  { name: "Київ", start: "20:14", maximum: "20:18", sunset: "20:29", obscuration: 2.67 },
  {
    name: "Черкаси",
    start: "20:14",
    maximum: "20:18",
    sunset: "20:22",
    obscuration: 0.7,
    approximate: true,
  },
];
```

Ми зберігаємо час як зрозумілий людині рядок, а перед математичними операціями перетворюємо його на кількість хвилин від початку доби.

## 12. Крок 7. Описуємо глобальний таймлайн і стан

```js
const startMinute = 1210;
const duration = 44;

const timeline = document.querySelector("#timeline");
const playButton = document.querySelector("#play-button");
const playIcon = document.querySelector("#play-icon");
const playText = document.querySelector("#play-text");
const restartButton = document.querySelector("#restart-button");
const timeOutput = document.querySelector("#current-time");
const phaseLabel = document.querySelector("#phase-label");
const grid = document.querySelector("#cities-grid");

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

let currentOffset = 0;
let isPlaying = false;
let previousFrame = 0;
let animationFrame = 0;
```

20:10 — це `20 * 60 + 10 = 1210`. `currentOffset` не зберігає абсолютний час, а показує, скільки хвилин минуло від 20:10. Тому значення повзунка `0…44` безпосередньо відповідає цьому стану.

Стан проєкту мінімальний:

- `currentOffset` — позиція на шкалі;
- `isPlaying` — чи триває відтворення;
- `previousFrame` — час попереднього кадру;
- `animationFrame` — ідентифікатор запланованого кадру.

## 13. Крок 8. Перетворюємо й форматуємо час

```js
function toMinute(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatMinute(value) {
  const total = Math.round(value);

  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(
    total % 60,
  ).padStart(2, "0")}`;
}
```

`toMinute("20:19")` повертає `1219`. З числами можна порівнювати моменти часу й обчислювати прогрес. `formatMinute(1219)` виконує зворотну операцію і повертає `"20:19"`.

`padStart(2, "0")` гарантує формат із двома цифрами: не `8:5`, а `08:05`.

## 14. Крок 9. Робимо зміни плавними

Лінійний прогрес від 0 до 1 виглядає механічно. Додамо easing-функцію `smoothstep`:

```js
function smoothstep(value) {
  const clamped = Math.max(0, Math.min(1, value));
  return clamped * clamped * (3 - 2 * clamped);
}
```

Спочатку значення обмежується діапазоном `0…1`. Потім формула уповільнює зміну біля початку й кінця. Наприклад, якщо минула половина відрізка, результат теж буде `0.5`, але на ранніх і пізніх ділянках перехід стане м’якшим.

## 15. Крок 10. Обчислюємо поточне перекриття

```js
function getCoverage(city, minute) {
  const start = toMinute(city.start);
  const maximum = toMinute(city.maximum);
  const sunset = toMinute(city.sunset);

  if (minute <= start || minute >= sunset) {
    return 0;
  }

  if (minute <= maximum) {
    const progress = (minute - start) / Math.max(1, maximum - start);
    return city.obscuration * smoothstep(progress);
  }

  const endCoverage = city.obscuration * 0.88;
  const progress = smoothstep(
    (minute - maximum) / Math.max(1, sunset - maximum),
  );

  return city.obscuration +
    (endCoverage - city.obscuration) * progress;
}
```

Функція має три ділянки:

1. До початку або після заходу повертаємо `0`.
2. Від початку до максимуму нормалізуємо час у діапазон `0…1` і множимо на максимальний відсоток.
3. Від максимуму до заходу переводимо значення від максимуму до умовних 88% цього максимуму.

Число `0.88` — дизайнерське припущення навчальної моделі, а не нове астрономічне спостереження. Для фізично точної симуляції потрібні додаткові ефермеридні дані для всього часового ряду.

`Math.max(1, maximum - start)` захищає від ділення на нуль, якщо в помилкових або округлених даних два моменти збіглися.

## 16. Крок 11. Перетворюємо площу перекриття на відстань між колами

Canvas малює Сонце і Місяць як два кола однакового радіуса. Але дані містять відсоток площі, а не координату Місяця. Нам треба знайти таку відстань між центрами кіл, за якої площа їх перетину відповідає потрібному відсотку.

Для двох одиничних кіл площа перетину залежить від відстані `d`:

```text
overlap = 2 × arccos(d / 2) − 0.5 × d × √(4 − d²)
```

Діління на `π` дає частку площі одного кола. Зворотного простого виразу для `d` тут не використовуємо, тому знаходимо його двійковим пошуком:

```js
function separationForArea(areaFraction) {
  if (areaFraction <= 0) {
    return 2.03;
  }

  let low = 0;
  let high = 2;

  for (let index = 0; index < 30; index += 1) {
    const middle = (low + high) / 2;
    const overlap =
      2 * Math.acos(middle / 2) -
      0.5 * middle * Math.sqrt(4 - middle * middle);
    const fraction = overlap / Math.PI;

    if (fraction > areaFraction) {
      low = middle;
    } else {
      high = middle;
    }
  }

  return (low + high) / 2;
}
```

Можливі відстані для однакових кіл лежать між `0` і `2` радіусами. При `d = 0` кола повністю збігаються; при `d = 2` лише торкаються. За 30 повторів двійковий пошук дає значно більшу точність, ніж потрібно для екрана.

Функція повертає відстань у радіусах. Під час малювання ми помножимо її на фактичний радіус Сонця.

## 17. Крок 12. Генеруємо картки міст

```js
function createCard(city, index) {
  const article = document.createElement("article");
  article.className = "city-card";

  article.innerHTML = `
    <div class="sky-wrap">
      <canvas
        class="city-canvas"
        aria-label="Схематичне затемнення для міста ${city.name}"
      ></canvas>
      <span class="status-badge">Очікування</span>
    </div>
    <div class="city-info">
      <h3>${city.name}</h3>
      <strong class="coverage">0,00%</strong>
      <p class="city-meta">
        початок ${city.start} · максимум ${city.maximum}
        ${city.approximate ? " · орієнтовно" : ""}
      </p>
    </div>
  `;

  grid.append(article);

  city.canvas = article.querySelector("canvas");
  city.coverageNode = article.querySelector(".coverage");
  city.statusNode = article.querySelector(".status-badge");
  city.visualIndex = index;
}
```

Після вставлення картки ми зберігаємо посилання на її Canvas і текстові вузли прямо в об’єкті міста. Завдяки цьому під час кожного кадру не потрібно повторно шукати елементи у всьому DOM.

Для даних, отриманих від користувача або зовнішнього API, вставляти значення через `innerHTML` без очищення небезпечно. Тут масив є контрольованою частиною власного коду. У загальному випадку текстові значення слід додавати через `textContent`.

Створюємо всі картки:

```js
cities.forEach(createCard);
```

Метод `forEach()` передає функції і сам об’єкт міста, і його індекс, тому сигнатура `createCard(city, index)` працює без додаткової обгортки.

## 18. Крок 13. Налаштовуємо чіткий Canvas

CSS-розмір Canvas і кількість його внутрішніх пікселів — різні речі. На Retina/HiDPI-екрані Canvas із внутрішньою шириною 300 пікселів може розтягуватися на 600 фізичних пікселів і виглядати розмитим.

```js
function resizeCanvas(canvas) {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const rectangle = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.round(rectangle.width * ratio));
  const height = Math.max(1, Math.round(rectangle.height * ratio));

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }

  return { width, height, ratio };
}
```

`getBoundingClientRect()` повертає CSS-розмір. Ми множимо його на `devicePixelRatio`, але обмежуємо коефіцієнт числом `2`, щоб надмірно великі полотна не витрачали пам’ять і час на малювання.

Зміна `canvas.width` або `canvas.height` очищає полотно. У нашому випадку це нормально: після перевірки розміру поточний кадр усе одно малюється заново.

## 19. Крок 14. Малюємо один кадр одного міста

Функція `drawCity(city, minute)` має виконувати передбачувану послідовність:

1. отримати розміри Canvas;
2. обчислити поточний стан;
3. намалювати небо;
4. намалювати світіння й Сонце;
5. за потреби намалювати Місяць;
6. намалювати горизонт поверх небесних тіл;
7. оновити текст картки.

Початок функції:

```js
function drawCity(city, minute) {
  const { canvas } = city;
  const { width, height, ratio } = resizeCanvas(canvas);
  const context = canvas.getContext("2d");
  const start = toMinute(city.start);
  const sunset = toMinute(city.sunset);
  const coverage = getCoverage(city, minute);

  const daylightProgress = Math.max(
    0,
    Math.min(1, (minute - startMinute) / (sunset - startMinute)),
  );

  const horizon = height * 0.78;
  const radius = Math.min(width, height) * 0.125;
  const sunX = width * (0.51 + (city.visualIndex % 3 - 1) * 0.012);
  const sunY = height * 0.27 + daylightProgress * height * 0.58;
```

`daylightProgress` дорівнює `0` на початку глобального таймлайна і наближається до `1` біля заходу конкретного міста. Координата `sunY` через це зростає: в Canvas вісь Y спрямована вниз, отже Сонце опускається.

Невелике зміщення `sunX` залежно від індексу руйнує надто механічну однаковість усіх карток, не впливаючи на дані.

### Малюємо небо

```js
  const sky = context.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(
    0,
    `hsl(${248 - daylightProgress * 18} 28% ${22 - daylightProgress * 7}%)`,
  );
  sky.addColorStop(
    0.62,
    `hsl(${18 + daylightProgress * 4} ${42 + daylightProgress * 18}% ${36 - daylightProgress * 7}%)`,
  );
  sky.addColorStop(1, "#17131c");

  context.fillStyle = sky;
  context.fillRect(0, 0, width, height);
```

Компоненти HSL змінюються разом із часом. Завдяки цьому небо не просто темнішає, а поступово змінює відтінок і насиченість.

### Малюємо світіння

```js
  const glow = context.createRadialGradient(
    sunX,
    sunY,
    radius * 0.4,
    sunX,
    sunY,
    radius * 2.6,
  );

  glow.addColorStop(0, "rgba(255, 192, 61, 0.38)");
  glow.addColorStop(1, "rgba(255, 112, 34, 0)");

  context.fillStyle = glow;
  context.beginPath();
  context.arc(sunX, sunY, radius * 2.6, 0, Math.PI * 2);
  context.fill();
```

`createRadialGradient()` створює перехід між двома колами. Внутрішня частина напівпрозора, зовнішня повністю прозора.

### Обмежуємо малювання небом і додаємо Сонце

```js
  context.save();
  context.beginPath();
  context.rect(0, 0, width, horizon);
  context.clip();

  context.shadowColor = "rgba(255, 171, 44, 0.8)";
  context.shadowBlur = 17 * ratio;
  context.fillStyle = "#ffc34d";
  context.beginPath();
  context.arc(sunX, sunY, radius, 0, Math.PI * 2);
  context.fill();
  context.shadowBlur = 0;
```

Після `clip()` усе наступне малюється тільки над лінією горизонту. Коли Сонце опускається, його нижня частина автоматично зникає. `save()` зберігає попередній стан контексту, а `restore()` пізніше скасує область відсікання.

### Малюємо Місяць

```js
  if (minute > start && minute < sunset && coverage > 0.01) {
    const separation = separationForArea(coverage / 100) * radius;
    const angle = -0.68;
    const moonX = sunX + Math.cos(angle) * separation;
    const moonY = sunY + Math.sin(angle) * separation;

    context.fillStyle = "#17182a";
    context.beginPath();
    context.arc(moonX, moonY, radius * 1.025, 0, Math.PI * 2);
    context.fill();
  }

  context.restore();
```

`coverage / 100` перетворює відсоток на частку. `angle` задає напрямок від центра Сонця до центра Місяця. `Math.cos()` визначає горизонтальну складову, `Math.sin()` — вертикальну.

Місяць трохи більший за Сонце (`1.025`) лише для візуальної чистоти краю в навчальній схемі.

### Малюємо горизонт поверх Сонця

```js
  context.fillStyle = "#101b18";
  context.beginPath();
  context.moveTo(0, horizon + height * 0.03);

  for (let x = 0; x <= width; x += width / 8) {
    context.lineTo(
      x,
      horizon - Math.sin(x * 0.026 + city.visualIndex) * height * 0.015,
    );
  }

  context.lineTo(width, height);
  context.lineTo(0, height);
  context.closePath();
  context.fill();

  context.fillStyle = "rgba(7, 13, 20, 0.75)";
  context.fillRect(0, height * 0.9, width, height * 0.1);
```

Цикл створює кілька точок хвилястого силуету. Це не реальний рельєф міста, а декоративний умовний горизонт.

### Оновлюємо текст

```js
  const formatted = coverage.toLocaleString("uk-UA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  city.coverageNode.textContent = minute >= sunset
    ? "захід"
    : `${formatted}%`;

  if (minute < start) {
    city.statusNode.textContent = `початок ${city.start}`;
  } else if (minute >= sunset) {
    city.statusNode.textContent = `Сонце зайшло · ${city.sunset}`;
  } else if (Math.abs(minute - toMinute(city.maximum)) < 0.6) {
    city.statusNode.textContent = "Видимий максимум";
  } else {
    city.statusNode.textContent = "Затемнення триває";
  }
}
```

`toLocaleString("uk-UA")` форматує десяткову кому відповідно до української локалі. Перевірка максимуму використовує допуск `0.6`, бо час змінюється дробовими кроками й може не дорівнювати цілій хвилині точно.

## 20. Крок 15. Створюємо єдину функцію render

```js
function render() {
  const minute = startMinute + currentOffset;

  timeOutput.textContent = formatMinute(minute);
  timeline.value = String(currentOffset);

  if (minute < 1214) {
    phaseLabel.textContent = "До початку";
  } else if (minute < 1222) {
    phaseLabel.textContent = "Початок у центрі України";
  } else if (minute < 1244) {
    phaseLabel.textContent = "Затемнення над Україною";
  } else {
    phaseLabel.textContent = "Фінальна фаза на заході";
  }

  cities.forEach((city) => drawCity(city, minute));
}
```

Це центральна ідея архітектури: будь-яка дія змінює стан, а потім викликає `render()`. І автоматичне відтворення, і повзунок, і перезапуск використовують той самий шлях оновлення. Через це різні частини інтерфейсу не розсинхронізуються.

## 21. Крок 16. Керуємо виглядом кнопки

```js
function setPlaying(nextValue) {
  isPlaying = nextValue;
  playIcon.textContent = isPlaying ? "Ⅱ" : "▶";
  playText.textContent = isPlaying ? "Пауза" : "Відтворити";
  playButton.setAttribute(
    "aria-label",
    isPlaying ? "Призупинити анімацію" : "Відтворити анімацію",
  );
}
```

Функція змінює і візуальний текст, і доступну назву кнопки. Це краще, ніж розкидати ті самі три операції в кількох обробниках.

## 22. Крок 17. Створюємо цикл анімації

```js
function animate(timestamp) {
  if (!isPlaying) {
    return;
  }

  if (!previousFrame) {
    previousFrame = timestamp;
  }

  const elapsedSeconds = (timestamp - previousFrame) / 1000;
  const speed = reducedMotion ? 1.2 : 2.25;

  currentOffset += elapsedSeconds * speed;
  previousFrame = timestamp;

  if (currentOffset >= duration) {
    currentOffset = duration;
    setPlaying(false);
  }

  render();

  if (isPlaying) {
    animationFrame = requestAnimationFrame(animate);
  }
}
```

`requestAnimationFrame()` передає функції `timestamp` — кількість мілісекунд на часовій шкалі браузера. Ми використовуємо різницю між поточним і попереднім кадром, а не додаємо фіксоване число. Тому швидкість анімації не залежить від частоти оновлення екрана чи випадково пропущеного кадру.

За звичайного режиму одна реальна секунда просуває модель на `2.25` хвилини. Уся 44-хвилинна подія відтворюється приблизно за 19.6 секунди.

У поточній версії для `prefers-reduced-motion` анімація не вимикається повністю, а сповільнюється. Для суворішої реалізації доступності можна не запускати автоматичне відтворення й залишити тільки ручний повзунок.

## 23. Крок 18. Підключаємо події

Після створення карток і першого кадру:

```js
cities.forEach(createCard);
render();
```

Додаємо кнопку відтворення:

```js
playButton.addEventListener("click", () => {
  if (currentOffset >= duration) {
    currentOffset = 0;
  }

  setPlaying(!isPlaying);
  previousFrame = 0;
  cancelAnimationFrame(animationFrame);

  if (isPlaying) {
    animationFrame = requestAnimationFrame(animate);
  }
});
```

Якщо анімація вже дійшла до кінця, новий запуск починається з нуля. Перед створенням нового циклу скасовуємо попередній запит, щоб випадково не отримати два паралельні цикли.

Додаємо ручне перемотування:

```js
timeline.addEventListener("input", (event) => {
  currentOffset = Number(event.currentTarget.value);
  previousFrame = 0;
  render();
});
```

Подія `input` спрацьовує безперервно під час руху повзунка. Значення `<input>` завжди є рядком, тому виконуємо явне `Number(...)`.

Додаємо перезапуск:

```js
restartButton.addEventListener("click", () => {
  setPlaying(false);
  cancelAnimationFrame(animationFrame);
  currentOffset = 0;
  previousFrame = 0;
  render();
});
```

І перемальовування після зміни розміру вікна:

```js
window.addEventListener("resize", render);
```

Після зміни ширини CSS-розміри Canvas змінюються. Новий `render()` викличе `resizeCanvas()` для кожного полотна і перемалює його в актуальній роздільній здатності.

## 24. Як мислити про потік даних

У проєкті діє простий односпрямований цикл:

```text
дані міст + currentOffset
        ↓
   обчислення часу
        ↓
 getCoverage(city, minute)
        ↓
 drawCity(city, minute)
        ↓
 Canvas + текст у картці
```

Події не малюють окремі деталі самостійно. Вони змінюють `currentOffset` або `isPlaying`, після чого викликається спільний `render()`. Це важливий принцип, який пізніше легко перенести у більші застосунки.

## 25. Перевірка проєкту

Не обмежуйтеся перевіркою «анімація рухається». Пройдіть чекліст.

### Дані

- У кожному об’єкті є всі обов’язкові поля.
- Час записаний у форматі `HH:MM`.
- Для кожного міста `start <= maximum <= sunset`.
- Відсоток не менший за 0 і не більший за 100.
- Орієнтовні дані позначені.

### Логіка

- О 20:10 усі міста перебувають у стані очікування.
- У момент початку відсоток близький до нуля.
- У момент максимуму показник близький до `obscuration`.
- Після `sunset` картка показує «захід».
- Після завершення кнопка знову показує «Відтворити».
- Повторний запуск після завершення починається з 20:10.

### Інтерфейс

- На широкому екрані є чотири колонки.
- На планшеті — дві або три.
- На вузькому телефоні — одна.
- Керування не виходить за межі екрана.
- Canvas не виглядає розмитим.

### Доступність

- Кнопки отримують видимий фокус через Tab.
- Enter і Space активують кнопки.
- Повзунок працює клавішами зі стрілками.
- Заголовки утворюють логічну ієрархію `h1 → h2 → h3`.
- Значення не передаються лише кольором: є текст і відсоток.
- На сторінці є попередження про безпечне спостереження.

## 26. Типові помилки й діагностика

### Картки не з’явилися

Перевірте консоль браузера. Найчастіші причини: неправильний шлях до `app.js`, помилка синтаксису або відсутній `defer` при запуску коду до створення `#cities-grid`.

### Canvas порожній

Переконайтеся, що `.sky-wrap` має висоту через `aspect-ratio`, а `.city-canvas` — `width: 100%` і `height: 100%`. Canvas у контейнері без висоти може отримати нульовий розмір.

### Затемнення виглядає однаково в усіх містах

Перевірте, що в `drawCity()` передається поточний об’єкт `city`, а `getCoverage()` використовує його `start`, `maximum`, `sunset` і `obscuration`.

### Час змінюється надто швидко на потужному екрані

Не додавайте до `currentOffset` фіксоване значення на кадр. Використовуйте різницю `timestamp - previousFrame`.

### Після кількох натискань усе прискорилося

Ймовірно, одночасно працює кілька циклів. Зберігайте ідентифікатор `requestAnimationFrame()` і викликайте `cancelAnimationFrame()` перед запуском нового.

### Зображення розмите

CSS-розмір Canvas не збігається з його внутрішнім bitmap-розміром. Використайте `devicePixelRatio` у `resizeCanvas()`.

## 27. Що в моделі точне, а що умовне

Це потрібно проговорити учням окремо. Якісна візуалізація не повинна маскувати припущення.

Точно відтворюються введені в масив:

- назви міст;
- час початку;
- час видимого максимуму;
- час заходу;
- максимальний відсоток obscuration.

Умовними є:

- швидкість відтворення;
- колір неба;
- форма горизонту;
- кут руху Місяця;
- зміна фази між опорними моментами;
- коефіцієнт `0.88` після максимуму;
- невеликі відмінності горизонтальної позиції Сонця.

Якщо потрібна науково точна симуляція, слід отримати для кожного міста координати Сонця й Місяця або готові значення фази для багатьох моментів часу. Тоді `getCoverage()` не вигадуватиме криву між кількома точками, а інтерполюватиме реальний часовий ряд.

## 28. Варіанти розвитку проєкту

### Базовий рівень

- додати ще одне місто;
- змінити швидкість відтворення;
- додати кнопку переходу до видимого максимуму;
- показувати час заходу в метаданих картки;
- додати перемикач сортування за відсотком.

### Середній рівень

- винести масив міст у `data.js` або JSON;
- додати фільтр «захід / центр»;
- зберігати вибрану швидкість у `localStorage`;
- зробити паузу автоматично, коли вкладка прихована;
- додати клавіатурні скорочення для відтворення й перемотування.

### Просунутий рівень

- завантажувати дані через Fetch API;
- використовувати координати міст і астрономічну бібліотеку;
- відтворювати азимут і висоту Сонця;
- побудувати карту України з синхронними маркерами;
- експортувати Canvas-кадри для подальшого створення відео;
- написати автоматичні тести для функцій часу й перекриття.

## 29. Запитання для обговорення на уроці

1. Чому час зручніше перетворити на хвилини, а не порівнювати як рядки?
2. Чому картки генеруються з масиву, а не дублюються в HTML?
3. Чим відрізняються CSS-розміри Canvas від `canvas.width` і `canvas.height`?
4. Чому для анімації використано `requestAnimationFrame()`, а не `setInterval()`?
5. Чому відсоток площі не можна напряму використати як координату Місяця?
6. Які частини візуалізації є даними, а які — дизайнерськими припущеннями?
7. Як змінилася б архітектура, якби дані надходили з API?
8. Як зробити режим reduced motion ще коректнішим?

## 30. Підсумок

У цьому проєкті HTML створює семантичний каркас і доступні елементи керування, CSS формує адаптивний інтерфейс, а JavaScript поєднує дані, час, математику, DOM і Canvas.

Найважливіший результат уроку — не саме зображення затемнення, а спосіб побудови проєкту:

1. сформулювати вимоги;
2. зібрати й перевірити дані;
3. відокремити дані від представлення;
4. зберігати мінімальний стан;
5. обчислювати весь інтерфейс із цього стану;
6. чесно позначати межі точності моделі;
7. перевіряти не лише вигляд, а й логіку, адаптивність та доступність.

Саме цей підхід робить невелику анімацію повноцінним навчальним frontend-проєктом.
