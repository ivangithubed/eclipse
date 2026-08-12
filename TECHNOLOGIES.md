# Технології та складові проєкту

## 1. HTML (семантична розмітка)

- Семантичні теги: `main`, `header`, `section`, `aside`, `footer`, `article`, `h1-h3`
- Інтерактивні елементи: `button`, `input type="range"`
- Базова доступність: `lang="uk"`, `aria-live`, `aria-label`, зв’язки `label` + `for`
- Підключення скрипта з `defer`

## 2. CSS (стилізація та адаптивність)

- CSS custom properties (`:root` змінні)
- Layout: CSS Grid + Flexbox
- Адаптивність: media queries
- Візуальні ефекти: градієнти, тіні, blur, `aspect-ratio`, `position: sticky`
- Керування станом фокусу: `:focus-visible`

## 3. JavaScript (Vanilla JS)

- Робота з даними через масив об’єктів міст
- DOM API: створення карток, оновлення тексту, пошук елементів
- Обробники подій: `click`, `input`, `resize`
- Анімація: `requestAnimationFrame()`, керування станом (`isPlaying`, `currentOffset`)
- Математика моделі: нормалізація часу, інтерполяція, `smoothstep`, двійковий пошук

## 4. Canvas API (2D-графіка)

- Малювання неба, Сонця, Місяця, горизонту
- Градієнти: `createLinearGradient`, `createRadialGradient`
- Геометрія: `arc`, `fillRect`, `clip`, контури
- Підтримка HiDPI: масштабування через `devicePixelRatio`

## 5. Доступність і UX

- Керування з клавіатури (нативні елементи форми)
- Оголошення змін часу через `aria-live`
- Візуально помітний фокус для інтерактивних елементів
- Підтримка `prefers-reduced-motion`

## 6. Архітектурні принципи

- Розділення відповідальностей: `index.html` (структура), `styles.css` (вигляд), `app.js` (логіка)
- Єдине джерело стану та централізований `render()`
- Відокремлення даних і математичної моделі від рендерингу Canvas
