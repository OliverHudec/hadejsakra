
## 📜 Licencování a Původní Autor
Původní projekt vytvořil **Martin Hruboš** hadejkde.cz. 

Tento fork je distribuován pod stejnou licencí **European Union Public Licence v. 1.2 (EUPL v1.2)**. Kompletní text licence naleznete v souboru `LICENSE`.

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

## Multiplayer

Host si v nastavení zvoleného módu vybere „Vytvořit multiplayer místnost“ ještě před vstupem do herní čekárny. Odtud pošle soupeři šestimístný kód a spustí hru až po jeho připojení. Soupeř zadá kód přímo na úvodní stránce; mód i jeho nastavení se převezmou od hostitele automaticky. Po každém kole se zobrazí jejich skóre vedle sebe a další panorama se načte až po tipu a potvrzení připravenosti obou hráčů. Pro signalizaci se používá PeerJS cloud služba; hra samotná a skóre se synchronizují přímým WebRTC spojením. Vlastní server není potřeba, takže multiplayer funguje i při hostování přes GitHub Pages. Sólo hru lze spustit samostatně.
