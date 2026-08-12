const cities = [
  {
    name: "Ужгород",
    start: "20:19",
    maximum: "20:47",
    sunset: "20:50",
    obscuration: 43.44,
  },
  {
    name: "Львів",
    start: "20:17",
    maximum: "20:43",
    sunset: "20:51",
    obscuration: 40.44,
  },
  {
    name: "Луцьк",
    start: "20:15",
    maximum: "20:41",
    sunset: "20:53",
    obscuration: 38.58,
  },
  {
    name: "Рівне",
    start: "20:15",
    maximum: "20:37",
    sunset: "20:46",
    obscuration: 30.57,
  },
  {
    name: "Івано-Франківськ",
    start: "20:18",
    maximum: "20:38",
    sunset: "20:46",
    obscuration: 27.69,
  },
  {
    name: "Тернопіль",
    start: "20:17",
    maximum: "20:36",
    sunset: "20:43",
    obscuration: 26.41,
  },
  {
    name: "Хмельницький",
    start: "20:17",
    maximum: "20:31",
    sunset: "20:38",
    obscuration: 16.33,
  },
  {
    name: "Чернівці",
    start: "20:19",
    maximum: "20:32",
    sunset: "20:38",
    obscuration: 15.01,
  },
  {
    name: "Житомир",
    start: "20:15",
    maximum: "20:26",
    sunset: "20:37",
    obscuration: 12.04,
  },
  {
    name: "Вінниця",
    start: "20:16",
    maximum: "20:24",
    sunset: "20:31",
    obscuration: 6.85,
  },
  {
    name: "Київ",
    start: "20:14",
    maximum: "20:18",
    sunset: "20:29",
    obscuration: 2.67,
  },
  {
    name: "Черкаси",
    start: "20:14",
    maximum: "20:18",
    sunset: "20:22",
    obscuration: 0.7,
    approximate: true,
  },
];
const startMinute = 1210,
  duration = 44;
const timeline = document.querySelector("#timeline"),
  playButton = document.querySelector("#play-button"),
  playIcon = document.querySelector("#play-icon"),
  playText = document.querySelector("#play-text"),
  restartButton = document.querySelector("#restart-button"),
  timeOutput = document.querySelector("#current-time"),
  phaseLabel = document.querySelector("#phase-label"),
  grid = document.querySelector("#cities-grid");
const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
let currentOffset = 0,
  isPlaying = false,
  previousFrame = 0,
  animationFrame = 0;
function toMinute(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}
function formatMinute(value) {
  const total = Math.round(value);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}
function smoothstep(value) {
  const clamped = Math.max(0, Math.min(1, value));
  return clamped * clamped * (3 - 2 * clamped);
}
function getCoverage(city, minute) {
  const start = toMinute(city.start),
    maximum = toMinute(city.maximum),
    sunset = toMinute(city.sunset);
  if (minute <= start || minute >= sunset) return 0;
  if (minute <= maximum)
    return (
      city.obscuration *
      smoothstep((minute - start) / Math.max(1, maximum - start))
    );
  const endCoverage = city.obscuration * 0.88,
    progress = smoothstep((minute - maximum) / Math.max(1, sunset - maximum));
  return city.obscuration + (endCoverage - city.obscuration) * progress;
}
function separationForArea(areaFraction) {
  if (areaFraction <= 0) return 2.03;
  let low = 0,
    high = 2;
  for (let index = 0; index < 30; index += 1) {
    const middle = (low + high) / 2,
      overlap =
        2 * Math.acos(middle / 2) -
        0.5 * middle * Math.sqrt(4 - middle * middle),
      fraction = overlap / Math.PI;
    if (fraction > areaFraction) low = middle;
    else high = middle;
  }
  return (low + high) / 2;
}
function createCard(city, index) {
  const article = document.createElement("article");
  article.className = "city-card";
  article.innerHTML = `<div class="sky-wrap"><canvas class="city-canvas" aria-label="Схематичне затемнення для міста ${city.name}"></canvas><span class="status-badge">Очікування</span></div><div class="city-info"><h3>${city.name}</h3><strong class="coverage">0,00%</strong><p class="city-meta">початок ${city.start} · максимум ${city.maximum}${city.approximate ? " · орієнтовно" : ""}</p></div>`;
  grid.append(article);
  city.canvas = article.querySelector("canvas");
  city.coverageNode = article.querySelector(".coverage");
  city.statusNode = article.querySelector(".status-badge");
  city.visualIndex = index;
}
function resizeCanvas(canvas) {
  const ratio = Math.min(window.devicePixelRatio || 1, 2),
    rectangle = canvas.getBoundingClientRect(),
    width = Math.max(1, Math.round(rectangle.width * ratio)),
    height = Math.max(1, Math.round(rectangle.height * ratio));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  return { width, height, ratio };
}
function drawCity(city, minute) {
  const { canvas } = city,
    { width, height, ratio } = resizeCanvas(canvas),
    context = canvas.getContext("2d"),
    start = toMinute(city.start),
    sunset = toMinute(city.sunset),
    coverage = getCoverage(city, minute),
    daylightProgress = Math.max(
      0,
      Math.min(1, (minute - startMinute) / (sunset - startMinute)),
    ),
    horizon = height * 0.78,
    radius = Math.min(width, height) * 0.125,
    sunX = width * (0.51 + ((city.visualIndex % 3) - 1) * 0.012),
    sunY = height * 0.27 + daylightProgress * height * 0.58;
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
  const glow = context.createRadialGradient(
    sunX,
    sunY,
    radius * 0.4,
    sunX,
    sunY,
    radius * 2.6,
  );
  glow.addColorStop(0, "rgba(255,192,61,.38)");
  glow.addColorStop(1, "rgba(255,112,34,0)");
  context.fillStyle = glow;
  context.beginPath();
  context.arc(sunX, sunY, radius * 2.6, 0, Math.PI * 2);
  context.fill();
  context.save();
  context.beginPath();
  context.rect(0, 0, width, horizon);
  context.clip();
  context.shadowColor = "rgba(255,171,44,.8)";
  context.shadowBlur = 17 * ratio;
  context.fillStyle = "#ffc34d";
  context.beginPath();
  context.arc(sunX, sunY, radius, 0, Math.PI * 2);
  context.fill();
  context.shadowBlur = 0;
  if (minute > start && minute < sunset && coverage > 0.01) {
    const separation = separationForArea(coverage / 100) * radius,
      angle = -0.68,
      moonX = sunX + Math.cos(angle) * separation,
      moonY = sunY + Math.sin(angle) * separation;
    context.fillStyle = "#17182a";
    context.beginPath();
    context.arc(moonX, moonY, radius * 1.025, 0, Math.PI * 2);
    context.fill();
  }
  context.restore();
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
  context.fillStyle = "rgba(7,13,20,.75)";
  context.fillRect(0, height * 0.9, width, height * 0.1);
  const formatted = coverage.toLocaleString("uk-UA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  city.coverageNode.textContent = minute >= sunset ? "захід" : `${formatted}%`;
  if (minute < start) city.statusNode.textContent = `початок ${city.start}`;
  else if (minute >= sunset)
    city.statusNode.textContent = `Сонце зайшло · ${city.sunset}`;
  else if (Math.abs(minute - toMinute(city.maximum)) < 0.6)
    city.statusNode.textContent = "Видимий максимум";
  else city.statusNode.textContent = "Затемнення триває";
}
function render() {
  const minute = startMinute + currentOffset;
  timeOutput.textContent = formatMinute(minute);
  timeline.value = String(currentOffset);
  if (minute < 1214) phaseLabel.textContent = "До початку";
  else if (minute < 1222) phaseLabel.textContent = "Початок у центрі України";
  else if (minute < 1244) phaseLabel.textContent = "Затемнення над Україною";
  else phaseLabel.textContent = "Фінальна фаза на заході";
  cities.forEach((city) => drawCity(city, minute));
}
function setPlaying(nextValue) {
  isPlaying = nextValue;
  playIcon.textContent = isPlaying ? "Ⅱ" : "▶";
  playText.textContent = isPlaying ? "Пауза" : "Відтворити";
  playButton.setAttribute(
    "aria-label",
    isPlaying ? "Призупинити анімацію" : "Відтворити анімацію",
  );
}
function animate(timestamp) {
  if (!isPlaying) return;
  if (!previousFrame) previousFrame = timestamp;
  currentOffset +=
    ((timestamp - previousFrame) / 1000) * (reducedMotion ? 1.2 : 2.25);
  previousFrame = timestamp;
  if (currentOffset >= duration) {
    currentOffset = duration;
    setPlaying(false);
  }
  render();
  if (isPlaying) animationFrame = requestAnimationFrame(animate);
}
cities.forEach(createCard);
render();
playButton.addEventListener("click", () => {
  if (currentOffset >= duration) currentOffset = 0;
  setPlaying(!isPlaying);
  previousFrame = 0;
  cancelAnimationFrame(animationFrame);
  if (isPlaying) animationFrame = requestAnimationFrame(animate);
});
timeline.addEventListener("input", (event) => {
  currentOffset = Number(event.currentTarget.value);
  previousFrame = 0;
  render();
});
restartButton.addEventListener("click", () => {
  setPlaying(false);
  cancelAnimationFrame(animationFrame);
  currentOffset = 0;
  previousFrame = 0;
  render();
});
window.addEventListener("resize", render);
