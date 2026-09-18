const MAPY_SITE_API_KEY = window.MAPY_SITE_API_KEY;

// VYTVOŘENÍ MAPY
var stredCR = L.latLng(49.80357765, 15.47488575); // střed ČR
var map = L.map('mapa', {   // vytvoření mapy
    center: stredCR,        // střed mapy
    zoom: 6,                // výchozí úroveň přiblížení
    zoomControl: false      // vypnutí výchozího ovládacího prvku zoomu
});

var markerLayer = L.layerGroup().addTo(map);    // vytvoření vrstvy bodů
var geometryLayer = L.layerGroup().addTo(map);  // vytvoření vrstvy geometrických útvarů

function vytvorMapu()
{
    // VRSTVA - ZÁKLADNÍ MAPA
    L.tileLayer(`https://api.mapy.com/v1/maptiles/basic/256/{z}/{x}/{y}?apikey=${MAPY_SITE_API_KEY}`, {
        minZoom: 6, // minimální úroveň přiblížení
        maxZoom: 19, // maximální úroveň přiblížení
        attribution: '<a href="https://api.mapy.com/copyright" target="_blank">&copy; Seznam.cz a.s. a další</a>'
    }).addTo(map);
    
    // TLAČÍTKA + A - PRO ZOOM MAPY
    L.control.zoom({
        position: 'topright',
        zoomInText: '+',
        zoomOutText: '-',
    }).addTo(map);

    // CHYBÍ ZDE ZOBRAZENÍ BODŮ ZÁJMŮ (POI)
    
    // KONTROLA A OPRAVA VELIKOSTI OKNA <div>#map
    var resizeObserverMap = new ResizeObserver(function () {
        map.invalidateSize();
    });
    resizeObserverMap.observe(document.getElementById("mapa"));

    // LOGO MAPY.CZ
    const LogoControl = L.Control.extend({
        options: {
            position: 'bottomleft',
        },
    
        onAdd: function (map) {
            const container = L.DomUtil.create('div');
            const link = L.DomUtil.create('a', '', container);
    
            link.setAttribute('href', 'https://mapy.cz/');
            link.setAttribute('target', '_blank');
            link.innerHTML = '<img src="https://api.mapy.com/img/api/logo.svg" />';
            L.DomEvent.disableClickPropagation(link);
    
            return container;
        },
    });
    new LogoControl().addTo(map);
}


// VYTVOŘENÍ KRUHU A NÁSLEDNÉ ZAROVNÁNÍ A ZOOM MAPY PODLE VELIKOSTI KRUHU
function zobrazKruh()
{
    // VYMAZÁNÍ KRUHU A BODU
    geometryLayer.clearLayers();
    markerLayer.clearLayers();
    
    // ZÍSKÁNÍ POLOMĚRU V METRECH
    var polomer = document.getElementById('slideryVlastniMisto').querySelector('.radius-slider').value * 1000;

    // NASTAVENÍ PRO KRUH
    var kruhOptions = {
        fillColor: "#2951b8",
        fillOpacity: 0.2,
        color: 'blue',
        opacity: 0.8,
        weight: 2,
        radius: polomer,
        interactive: false,
        smoothFactor: 1,
    };

    // ZOBRAZENÍ KRUHU
    var kruh = L.circle(souradniceMista, kruhOptions).addTo(geometryLayer);

    // NASTAVENÍ PRO MARKER
    var markerOptions = {
        icon: L.icon({
            iconUrl: 'img/body/bod-marker.png',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        }),
        opacity: 1,
        interactive: false
    };

    // ZOBRAZENÍ BODU (STŘEDU KRUHU)
    var marker = L.marker(souradniceMista, markerOptions).addTo(markerLayer);

    // VYCENTROVÁNÍ MAPY PODLE HÁDACÍHO POLYGONU
    var zoomOptions = {
        animate: true,  // animace
        duration: 1     // délka animace v sekundách
    };

    map.fitBounds(kruh.getBounds(), zoomOptions);
}


/* ******************************************************************************************************************************** */
// PRVNÍ NAČTENÍ STRÁNKY
window.onload = function() {
    vytvorMapu();
};


// KLIKNUTÍ MYŠÍ NA MAPU
function klikNaMapu(e) // kliknulo se na mapu
{
    var souradniceKliku = e.latlng; // souřadnice kliknutí

    if (L.polygon(CzechRepublic).contains(souradniceKliku))
    {
        souradniceMista = souradniceKliku;

        zobrazKruh();
        document.querySelector("#vyhledavacMista").value = souradniceKliku.lat.toFixed(7) + ", " + souradniceKliku.lng.toFixed(7);
        document.querySelector(".neni-VlastniMisto").textContent = "";
    }
}

map.on('click', klikNaMapu); // volání funkce při kliknutí na mapu


// ZMĚNA POLOMĚRU KRUHU
const sliderRadius = document.getElementById('slideryVlastniMisto').querySelector('.radius-slider');

// pomocí kurzoru myši
let timeoutZoomKruhu;
sliderRadius.addEventListener('input', function() {
    if (souradniceMista)
    {
        clearTimeout(timeoutZoomKruhu);

        timeoutZoomKruhu = setTimeout(function () {
            zobrazKruh();
        }, 200);
    }
});

// pomocí kolečka myši
sliderRadius.addEventListener("wheel", function() {
    if (souradniceMista)
    {
        clearTimeout(timeoutZoomKruhu);

        timeoutZoomKruhu = setTimeout(function () {
            zobrazKruh();
        }, 200);
    }
});


// ZOBRAZENÍ KURZORU CROSSHAIR/GRABBING
const mapa = document.getElementById("mapa");
var isDragging = false;

mapa.addEventListener("mousedown", function() {
    isDragging = true;
});

mapa.addEventListener("mouseup", function() {
    isDragging = false;
    mapa.style.cursor = "crosshair";
});

mapa.addEventListener("mousemove", function() {
    if (isDragging)
    {
        mapa.style.cursor = "grabbing";
    }
    else
    {
        mapa.style.cursor = "crosshair";
    }
});

mapa.addEventListener("mouseleave", function() {
    isDragging = false;
});
