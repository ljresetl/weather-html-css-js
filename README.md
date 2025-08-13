Při zadání prvního písmene autocomplete dotazuje OpenWeather Geocoding s parametrem lang (uk/en/cz) a filtruje pouze ty názvy, které začínají zadaným znakem v odpovídajícím jazyce (pomocí normalizace diakritiky).

Po kliknutí na návrh uložíme souřadnice, ale nenahráváme předpověď, dokud nestisknete „Hledat“.

Po „Hledat“ načteme 5denní / 3hodinovou předpověď, seskupíme podle dat a zobrazíme po jednom čtvercovém bloku na každý den (ve sloupci).

Pozadí každého dne se automaticky vybírá podle weather.main (slunce / déšť / sníh / mraky / mlha / bouřka / mrholení).
