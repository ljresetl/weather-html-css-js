Weather Forecast App
Popis aplikace

Tato aplikace zobrazuje předpověď počasí pro vybraná města. Uživatel může vyhledávat město pomocí našeptávače a zobrazit hodinovou i denní předpověď. Aplikace podporuje více jazyků: češtinu, ukrajinštinu a angličtinu.

Spuštění aplikace

Klonujte repozitář nebo stáhněte soubory projektu.

Otevřete index.html ve webovém prohlížeči (např. Chrome, Firefox nebo Edge).

Zadejte město do vyhledávacího pole a klikněte na Hledat nebo stiskněte Enter.

Hodinová předpověď se zobrazí v grafu, denní přehled ve formě seznamu.

Poznámka: Pro zobrazení dat je nutné mít aktivní připojení k internetu, protože aplikace načítá data z OpenWeatherMap API a seznam měst z JSON online.

Podporované prohlížeče

Google Chrome (poslední verze)

Mozilla Firefox (poslední verze)

Microsoft Edge (poslední verze)

Struktura projektu
weather-html-css-js/
│
├─ index.html # Hlavní HTML stránka (Single Page Application)
├─ style.css # Stylování aplikace
├─ script.js # Logika aplikace: vyhledávání, načítání dat, vykreslování
├─ README.md # Tento soubor
└─ cities.json # Seznam měst pro našeptávač (načítá se online)

Popis modulů / komponent

Vyhledávací pole a našeptávač:

Input pro zadání města

Dynamický seznam návrhů (autocomplete)

Zobrazení předpovědi:

Denní přehled s minimální a maximální teplotou, větrnými podmínkami a vlhkostí

Aktivní den je zvýrazněn a kliknutím se mění graf hodinové předpovědi

Hodinový graf:

Vykreslovaný pomocí Chart.js

Zobrazuje teploty po jednotlivých hodinách vybraného dne

Vícejazyčné prostředí:

Možnost přepínání mezi češtinou, ukrajinštinou a angličtinou

Překlady textů jsou v objektu texts v script.js

API a data:

Seznam měst je načítán z JSON online

Předpověď se načítá z OpenWeatherMap REST API
