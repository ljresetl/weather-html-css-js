// ======= helpers =======
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const API_KEY = window.OWM_API_KEY; // з index.html
const GEO_URL = "https://api.openweathermap.org/geo/1.0/direct";
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";

// normalize for startsWith across diacritics
const removeDiacritics = (s) =>
  (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const startsWithLocale = (name, query, lang) => {
  const a = removeDiacritics(String(name).toLocaleLowerCase(lang));
  const b = removeDiacritics(String(query).toLocaleLowerCase(lang));
  return a.startsWith(b);
};

let citiesFallback = []; // офлайн fallback з cities.json
let selectedPlace = null; // { name, lat, lon, country }

// ======= load fallback once =======
fetch("cities.json")
  .then((r) => (r.ok ? r.json() : []))
  .then((data) => (citiesFallback = Array.isArray(data) ? data : []))
  .catch(() => {});

// ======= UI refs =======
const input = $("#cityInput");
const suggestions = $("#suggestions");
const langSelect = $("#langSelect");
const searchBtn = $("#searchBtn");
const daysEl = $("#weather");

// ======= suggestions flow =======
async function fetchRemoteSuggestions(q, lang) {
  const url = new URL(GEO_URL);
  url.searchParams.set("q", q);
  url.searchParams.set("limit", "10");
  url.searchParams.set("appid", API_KEY);
  url.searchParams.set("lang", lang);

  const res = await fetch(url);
  if (!res.ok) throw new Error("Geo API error");
  const data = await res.json();

  return data
    .map((it) => {
      const local = (it.local_names && it.local_names[lang]) || null;
      const displayName = local || it.name;
      return {
        name: displayName,
        rawName: it.name,
        country: it.country || "",
        lat: it.lat,
        lon: it.lon,
      };
    })
    .filter((it) => startsWithLocale(it.name, q, lang));
}

function fetchLocalSuggestions(q, lang) {
  const key = lang === "uk" ? "name_uk" : lang === "cz" ? "name_cs" : "name_en";
  return (citiesFallback || [])
    .map((it) => ({
      name: it[key] || it.name_en,
      country: it.country || "",
      lat: null,
      lon: null,
    }))
    .filter((it) => startsWithLocale(it.name, q, lang))
    .slice(0, 10);
}

function renderSuggestions(items) {
  if (!items || items.length === 0) {
    suggestions.style.display = "none";
    suggestions.innerHTML = "";
    return;
  }
  const html = items
    .map(
      (it, idx) => `
      <div class="suggestions__item" data-idx="${idx}">
        <div class="suggestions__name">${it.name}</div>
        <div class="suggestions__cc">${it.country}</div>
      </div>`
    )
    .join("");
  suggestions.innerHTML = html;
  suggestions.style.display = "block";

  $$("#suggestions .suggestions__item").forEach((el, i) => {
    el.addEventListener("click", () => {
      const chosen = items[i];
      selectedPlace = chosen;
      input.value = chosen.name;
      suggestions.style.display = "none";
      suggestions.innerHTML = "";
    });
  });
}

let suggestTimer;
function handleInput() {
  const q = input.value.trim();
  const lang = langSelect.value;
  selectedPlace = null;

  if (q.length < 1) {
    renderSuggestions([]);
    return;
  }
  clearTimeout(suggestTimer);
  suggestTimer = setTimeout(async () => {
    try {
      const remote = await fetchRemoteSuggestions(q, lang);
      if (remote.length) return renderSuggestions(remote);
      const local = fetchLocalSuggestions(q, lang);
      renderSuggestions(local);
    } catch {
      const local = fetchLocalSuggestions(q, lang);
      renderSuggestions(local);
    }
  }, 120);
}

input.addEventListener("input", handleInput);
input.addEventListener("focus", handleInput);
langSelect.addEventListener("change", handleInput);
document.addEventListener("click", (e) => {
  if (!e.target.closest(".search__input-wrap")) {
    suggestions.style.display = "none";
  }
});

// ======= search flow =======
async function ensureCoords(placeName, lang) {
  if (selectedPlace && selectedPlace.lat && selectedPlace.lon) {
    return selectedPlace;
  }
  const url = new URL(GEO_URL);
  url.searchParams.set("q", placeName);
  url.searchParams.set("limit", "1");
  url.searchParams.set("appid", API_KEY);
  url.searchParams.set("lang", lang);

  const res = await fetch(url);
  if (!res.ok) throw new Error("Geocoding failed");
  const data = await res.json();
  if (!data || !data.length) throw new Error("Місто не знайдено");
  const it = data[0];
  return {
    name: (it.local_names && it.local_names[lang]) || it.name,
    lat: it.lat,
    lon: it.lon,
    country: it.country || "",
  };
}

function groupByDay(list) {
  const by = {};
  for (const item of list) {
    const date = item.dt_txt.split(" ")[0];
    (by[date] ||= []).push(item);
  }
  return by;
}

function pickRepresentative(items) {
  const noon = items.find((it) => it.dt_txt.includes("12:00:00"));
  return noon || items[Math.floor(items.length / 2)];
}

function classifyBg(main) {
  const m = (main || "").toLowerCase();
  if (m.includes("clear")) return "bg-sunny";
  if (m.includes("rain")) return "bg-rain";
  if (m.includes("snow")) return "bg-snow";
  if (m.includes("thunder")) return "bg-thunder";
  if (m.includes("drizzle")) return "bg-drizzle";
  if (m.includes("mist") || m.includes("fog") || m.includes("haze")) return "bg-mist";
  if (m.includes("cloud")) return "bg-clouds";
  return "bg-default";
}

function fmtDate(dateStr, lang) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(lang, { weekday: "short", day: "2-digit", month: "short" });
}

function makeIconUrl(icon) {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}

function renderDays(cityName, data, lang) {
  daysEl.innerHTML = "";
  if (!data || !data.list) {
    daysEl.innerHTML = `<p>Немає даних.</p>`;
    return;
  }
  const byDay = groupByDay(data.list);
  const dates = Object.keys(byDay).slice(0, 5);

  dates.forEach((date) => {
    const items = byDay[date];
    const rep = pickRepresentative(items);
    const main = rep.weather?.[0]?.main || "";
    const desc = rep.weather?.[0]?.description || "";
    const icon = rep.weather?.[0]?.icon || "01d";
    const now = Math.round(rep.main?.temp ?? 0);
    const tmin = Math.round(Math.min(...items.map((i) => i.main.temp_min)));
    const tmax = Math.round(Math.max(...items.map((i) => i.main.temp_max)));
    const wind = Math.round(rep.wind?.speed ?? 0);
    const humidity = Math.round(rep.main?.humidity ?? 0);

    const bgClass = classifyBg(main);

    const el = document.createElement("div");
    el.className = `day ${bgClass}`;
    el.innerHTML = `
      <div class="day__overlay"></div>
      <div class="day__content">
        <div class="day__top">
          <div>
            <div class="day__date">${fmtDate(date, lang)}</div>
            <div class="day__desc">${desc}</div>
          </div>
          <img src="${makeIconUrl(icon)}" alt="${desc}" width="64" height="64" />
        </div>
        <div class="day__temp">
          <div class="now">${now}°</div>
          <div class="minmax">${tmin}° / ${tmax}°</div>
        </div>
        <div class="day__meta">
          <div>💨 ${wind} м/с</div>
          <div>💧 ${humidity}%</div>
        </div>
      </div>
    `;
    daysEl.appendChild(el);
  });
}

async function onSearch() {
  const lang = langSelect.value;
  const q = input.value.trim();
  if (!q) {
    input.focus();
    return;
  }
  daysEl.innerHTML = `<p>Завантаження…</p>`;
  try {
    const place = await ensureCoords(q, lang);
    const url = new URL(FORECAST_URL);
    url.searchParams.set("lat", place.lat);
    url.searchParams.set("lon", place.lon);
    url.searchParams.set("appid", API_KEY);
    url.searchParams.set("units", "metric");
    url.searchParams.set("lang", lang);

    const res = await fetch(url);
    if (!res.ok) throw new Error("Forecast API failed");
    const data = await res.json();
    renderDays(place.name, data, lang);
  } catch (err) {
    daysEl.innerHTML = `<p>${err.message}</p>`;
  }
}

searchBtn.addEventListener("click", onSearch);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") onSearch();
});
