# GeoGuessr ČR

Jednoduchá webová hra inspirovaná GeoGuessr pro území České republiky. Hráč dostane panoramatický pohled na místo v ČR a musí uhádnout, kde se nachází, pomocí interaktivní mapy. Aplikace je připravená pro statické hostování na GitHub Pages.

## Funkce

- Dvě herní režimy:
  - Celá Česká republika
  - Okolí vybraného místa podle poloměru v km
- Nativní panorama přes oficiální Mapy.cz Loader JS SDK
- Interaktivní mapa na základě Leaflet a Mapy.cz dlaždic
- Systém bodování podle vzdálenosti od správné lokace
- Fallback pro situaci, kdy panorama není dostupná

## Struktura projektu

- `index.html` – HTML šablona aplikace
- `style.css` – vizuální design a responzivní rozložení
- `config.js` – konfigurace API klíče
- `app.js` – herní logika, režimy, panorama a interaktivní mapa

## Nastavení API klíče

V souboru `config.js` upravte hodnotu klíče:

```js
const MAPY_CZ_API_KEY = "VASE_MAPY_CZ_API_KEY";
window.MAPY_CZ_API_KEY = MAPY_CZ_API_KEY;
```

Důležité:
- API klíč musí být platný pro Mapy.cz.
- Bez klíče nebude fungovat mapová vrstva a některé služby Mapy.cz.

## Spuštění lokálně

Protože se jedná o statickou aplikaci, stačí otevřít `index.html` v prohlížeči.

Pro jednoduchý lokální server můžete použít například:

```bash
python -m http.server 8000
```

Poté otevřete v prohlížeči:

```text
http://localhost:8000
```

## GitHub Pages

1. Nahrajte všechny soubory projektu do repozitáře.
2. V nastavení repozitáře přejděte do sekce Pages.
3. Zvolte zdroj `Deploy from a branch` nebo GitHub Actions.
4. Vyberte hlavní větev a složku `/root`.
5. Uložte a publikujte.

## Herní režimy

### 1) Celá Česká republika

Aplikace vybírá náhodnou lokaci z připraveného seznamu ověřených míst v ČR.

### 2) Okolí vybraného místa

- Uživatel vybere výchozí bod ze seznamu míst.
- Nastaví poloměr v kilometrech.
- Aplikace filtrováním pomocí Haversineho vzorce vybere pouze lokace v daném okruhu.

## Poznámka k panoramě

Aplikace používá oficiální JavaScript SDK loader od Mapy.cz a nativní `MapyCZ.Panorama`, aby se předešlo problémům s `iframe` a blokováním přes `X-Frame-Options`.

V případě, že panorama není dostupná, aplikace zobrazí čistý fallback se jménem lokace a souřadnicemi.
