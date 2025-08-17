Popis aplikace

Tato aplikace zobrazuje předpověď počasí pro vybraná města. Uživatel může vyhledávat město pomocí našeptávače a zobrazit hodinovou i denní předpověď. Aplikace podporuje více jazyků: češtinu, ukrajinštinu a angličtinu.

Funkce

Vyhledávání města s automatickým doplňováním

Denní a hodinová předpověď

Graf teplot po hodinách

Informace o větru a vlhkosti

Vícejazyčné prostředí (čeština, ukrajinština, angličtina)

Použité technologie a kód

HTML5 – struktura aplikace

CSS3 – stylování a responzivní design

JavaScript (ES6) – logika aplikace, práce s API a událostmi

Chart.js – grafy hodinových teplot

OpenWeatherMap API – získávání aktuálních dat o počasí

JSON – seznam měst pro automatické doplňování

Fetch API – dotazy na externí zdroje dat

Spuštění aplikace

Klonování repozitáře:

git clone https://github.com/ljresetl/weather-app.git
cd weather-app

Spuštění lokálního serveru:

# Python 3

python -m http.server 8000

Otevřete prohlížeč a přejděte na:

http://localhost:8000

Použití:

Zadejte název města do vyhledávacího pole

Klikněte na Hledat / Search / Пошук nebo stiskněte Enter

Vyberte jazyk z rozbalovací nabídky

Zobrazte hodinový graf a denní přehled

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

Aktivní den je zvýrazněn; kliknutím se mění graf hodinové předpovědi

Hodinový graf:

Vykreslovaný pomocí Chart.js

Zobrazuje teploty po jednotlivých hodinách vybraného dne

Vícejazyčné prostředí:

Možnost přepínání mezi češtinou, ukrajinštinou a angličtinou

Překlady textů jsou v objektu texts v script.js

API a data:

Seznam měst je načítán z JSON online

Předpověď se načítá z OpenWeatherMap REST API
