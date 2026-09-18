# KdeToSakra.cz (Community Fork)

Tento projekt je neoficiálním komunitním forkem původní hry **KdeToSakra.cz**. 

Cílem tohoto forku je zachovat hru plně funkční a bezplatně přístupnou pro všechny hráče skrze přechod na novější verze mapových API.

## 🛠️ Provedené změny
* **[září 2026]**: Refaktorování kódu a aktualizace mapového API na nejnovější verzi.
* Modernizace uživatelského rozhraní (UI/UX) a úprava responzivity.

## 📜 Licencování a Původní Autor
Původní projekt vytvořil **Martin Hruboš** hadejkde.cz. 

Tento fork je distribuován pod stejnou licencí **European Union Public Licence v. 1.2 (EUPL v1.2)**[cite: 1]. Kompletní text licence naleznete v souboru `LICENSE`.

---
*Více informací o původním projektu a licenčních podmínkách naleznete v přiložené dokumentaci.*

## Použité technologie

- HTML, CSS a JavaScript bez build systému
- [Mapy.com REST API](https://developer.mapy.com/rest-api/) pro dlaždice a našeptávač míst
- [Mapy.com JS Panorama](https://developer.mapy.com/js-panorama/) pro panoramatické snímky
- [Leaflet 1.9.4](https://leafletjs.com/) pro interaktivní mapu
- [Leaflet.PointInPolygon](https://github.com/hayeswise/Leaflet.PointInPolygon) pro kontrolu bodu v polygonu

## Struktura projektu

- `index.html` - výběr herního režimu a nastavení hry
- `hra.html` - herní obrazovka s panoramatem a mapou
- `js/hra/` - herní logika, generování míst, mapa a panorama
- `js/popupOkno/` - výběr vlastního místa a našeptávač
- `css/` - globální, herní a responzivní styly
- `polygony/` a `specifickaMista/` - geografická data hry

