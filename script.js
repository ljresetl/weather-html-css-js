document.addEventListener("DOMContentLoaded", () => {
  const API_KEY = "75fb45190a5b14c47de1c6a53e0ca8ab";

  const cityInput = document.getElementById("cityInput");
  const searchBtn = document.getElementById("searchBtn");
  const daysEl = document.getElementById("weather");
  const ctx = document.getElementById("hourlyChart")?.getContext("2d");
  const langSelect = document.getElementById("langSelect");
  const autocompleteEl = document.getElementById("autocomplete");

  if (!cityInput || !searchBtn || !daysEl || !ctx || !langSelect || !autocompleteEl) {
    console.error("Some elements are missing in the DOM!");
    return;
  }

  let currentLang = "cs";
  let chart;
  let groupedData = {};
  let cities = [];

  // 🔹 Завантаження JSON онлайн
  fetch("https://raw.githubusercontent.com/ljresetl/weather-cities/refs/heads/main/cities.json")
    .then(res => res.json())
    .then(data => { 
      cities = data; 
      console.log("Cities loaded:", cities.length); 
    })
    .catch(err => console.error("Cannot load cities.json", err));

  const texts = {
    cs: { title: "Předpověď počasí", search: "Hledat", placeholder: "Zadejte město", subtitle: "Hodinová předpověď", notFound: "Město nenalezeno" },
    uk: { title: "Прогноз погоди", search: "Пошук", placeholder: "Введіть місто", subtitle: "Погодинний прогноз", notFound: "Місто не знайдено" },
    en: { title: "Weather Forecast", search: "Search", placeholder: "Enter city", subtitle: "Hourly forecast", notFound: "City not found" }
  };

  function updateTexts() {
    const t = texts[currentLang];
    document.getElementById("title").textContent = t.title;
    searchBtn.textContent = t.search;
    cityInput.placeholder = t.placeholder;
    document.getElementById("subtitle").textContent = t.subtitle;
  }

  function fmtDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString(currentLang, { weekday: "short", day: "2-digit", month: "short" });
  }

  function makeIconUrl(icon) {
    return `https://openweathermap.org/img/wn/${icon}@2x.png`;
  }

  function renderDays(data) {
    daysEl.innerHTML = "";
    groupedData = {};

    data.list.forEach(item => {
      const date = item.dt_txt.split(" ")[0];
      if (!groupedData[date]) groupedData[date] = [];
      groupedData[date].push(item);
    });

    Object.keys(groupedData).slice(0, 5).forEach((date, i) => {
      const items = groupedData[date];
      const temps = items.map(x => x.main.temp);
      const tmin = Math.round(Math.min(...temps));
      const tmax = Math.round(Math.max(...temps));
      const now = Math.round(items[0].main.temp);
      const wind = items[0].wind.speed;
      const humidity = items[0].main.humidity;
      const icon = items[4]?.weather[0].icon || items[0].weather[0].icon;
      const desc = items[4]?.weather[0].description || items[0].weather[0].description;

      const el = document.createElement("div");
      el.className = `day ${i===0 ? "active" : ""}`;
      el.innerHTML = `
        <div class="day-overlay"></div>
        <div class="day-content">
          <div class="day-top">
            <div>
              <div class="day-date">${fmtDate(date)}</div>
              <div class="day-desc">${desc}</div>
            </div>
            <img src="${makeIconUrl(icon)}" alt="${desc}" width="64" height="64" />
          </div>
          <div class="day-temp">
            <div class="now">${now}°</div>
            <div class="minmax">${tmin}° / ${tmax}°</div>
          </div>
          <div class="day-meta">
            <div>💨 ${wind} м/с</div>
            <div>💧 ${humidity}%</div>
          </div>
        </div>
      `;
      el.onclick = () => {
        document.querySelectorAll(".day").forEach(d => d.classList.remove("active"));
        el.classList.add("active");
        renderChart(items);
      };
      daysEl.appendChild(el);
    });

    renderChart(groupedData[Object.keys(groupedData)[0]]);
  }

  function renderChart(items) {
    const labels = items.map(i => i.dt_txt.split(" ")[1].slice(0,5));
    const temps = items.map(i => i.main.temp);
    if (chart) chart.destroy();

    const gradient = ctx.createLinearGradient(0,0,0,300);
    gradient.addColorStop(0, 'rgba(37, 99, 235, 0.5)');
    gradient.addColorStop(1, 'rgba(37, 99, 235, 0)');

    chart = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets: [{ data: temps, borderColor: '#2563eb', backgroundColor: gradient, tension: 0.4, fill: true, pointBackgroundColor: '#ffbb33', pointRadius: 5, pointHoverRadius: 7 }] },
      options: { responsive: true, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { grid: { borderDash: [5,5] } } } }
    });
  }

  async function getWeather() {
    const city = cityInput.value.trim();
    if (!city) return;

    // Перевірка, чи місто є у базі
    const cityExists = cities.some(c => 
      c.name.toLowerCase() === city.toLowerCase() ||
      (c.uk && c.uk.toLowerCase() === city.toLowerCase()) ||
      (c.cs && c.cs.toLowerCase() === city.toLowerCase())
    );

    if (!cityExists) {
      alert(texts[currentLang].notFound);
      setTimeout(() => location.reload(), 3000);
      return;
    }

    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=${currentLang}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.cod === "200") {
        renderDays(data);
      } else {
        alert(texts[currentLang].notFound);
        setTimeout(() => location.reload(), 3000);
      }
    } catch (err) {
      console.error(err);
      alert(texts[currentLang].notFound);
      setTimeout(() => location.reload(), 3000);
    }
  }

  // 🔹 Автокомпліт без виклику getWeather
  cityInput.addEventListener("input", () => {
    const val = cityInput.value.toLowerCase();
    autocompleteEl.innerHTML = "";
    if (!val) return;

    const matches = cities.filter(c => 
      c.name.toLowerCase().includes(val) ||
      (c.uk && c.uk.toLowerCase().includes(val)) ||
      (c.cs && c.cs.toLowerCase().includes(val))
    ).slice(0, 10);

    matches.forEach(c => {
      const item = document.createElement("div");
      item.className = "autocomplete-item";
      item.textContent = `${c.name} / ${c.uk || ""} / ${c.cs || ""}, ${c.country}`;
      item.onclick = () => {
        cityInput.value = c.name;       // вставляємо назву міста
        autocompleteEl.innerHTML = "";  // ховаємо автокомпліт
        cityInput.focus();              // залишаємо фокус
      };
      autocompleteEl.appendChild(item);
    });
  });

  // Закрити автокомпліт при кліку поза полем
  document.addEventListener("click", e => {
    if (!e.target.closest(".search")) autocompleteEl.innerHTML = "";
  });

  // Пошук по кнопці і Enter
  searchBtn.onclick = getWeather;
  cityInput.addEventListener("keydown", e => {
    if (e.key === "Enter") getWeather();
  });

  // Зміна мови
  langSelect.onchange = () => { currentLang = langSelect.value; updateTexts(); };
  updateTexts();
});
