const API_KEY = window.MAPY_GAME_API_KEY;

// VYTVOŘENÍ MAPY
var stredCR = L.latLng(49.80357765, 15.47488575); // střed ČR
var map = L.map('mapa', {   // vytvoření mapy
    center: stredCR,        // střed mapy
    zoom: 6,                // výchozí úroveň přiblížení
    zoomControl: false      // vypnutí výchozího ovládacího prvku zoomu
});

var vsechnyPrimkyBodyLayer = L.featureGroup();          // vrstva všech přímek a bodů (celá hra)
var primkaBodyLayer = L.featureGroup().addTo(map);      // vrstva přímky a bodů (jedno kolo)
var napovedyLayer = L.layerGroup().addTo(map);          // vrstva nápověd (jedno kolo)
var kruhLayer = L.layerGroup().addTo(map);              // vrstva pomocného kruhu nápovědy

function vytvorMapu()
{
    // DRUH VRSTVY MAPY
    if (druhMapy === "zakladni")
    {
        // VRSTVA - ZÁKLADNÍ MAPA
        L.tileLayer(`https://api.mapy.com/v1/maptiles/basic/256/{z}/{x}/{y}?apikey=${API_KEY}`, {
            minZoom: 6,     // minimální úroveň přiblížení
            maxZoom: 19,    // maximální úroveň přiblížení
            attribution: '<a href="https://api.mapy.com/copyright" target="_blank">&copy; Seznam.cz a.s. a další</a>'
        }).addTo(map);
    }
    else if (druhMapy === "turisticka")
    {
        // VRSTVA - TURISTICKÁ MAPA
        L.tileLayer(`https://api.mapy.com/v1/maptiles/outdoor/256/{z}/{x}/{y}?apikey=${API_KEY}`, {
            minZoom: 6,
            maxZoom: 19,
            attribution: '<a href="https://api.mapy.com/copyright" target="_blank">&copy; Seznam.cz a.s. a další</a>',
        }).addTo(map);
    }
    else if (druhMapy === "letecka")
    {
        // VRSTVA - LETECKÁ MAPA
        L.tileLayer(`https://api.mapy.com/v1/maptiles/aerial/256/{z}/{x}/{y}?apikey=${API_KEY}`, {
            minZoom: 6,
            maxZoom: 19,
            attribution: '<a href="https://api.mapy.com/copyright" target="_blank">&copy; Seznam.cz a.s. a další</a>',
        }).addTo(map);

        // VRSTVA - NÁZVY STÁTŮ, MĚST, ULIC
        L.tileLayer(`https://api.mapy.com/v1/maptiles/names-overlay/256/{z}/{x}/{y}?apikey=${API_KEY}`, {
            minZoom: 6,
            maxZoom: 19,
        }).addTo(map);
    }
    
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


/* ******************************************************************************************************************************** */
// GENERACE MÍSTA
function generace()
{
    vygenerujMisto();
}


// PRVNÍ NAČTENÍ STRÁNKY
var hrano;
window.onload = function() {
    //console.clear(); // vymaže konzoli

    vytvorMapu();
    vytvorOblastAZarovnejMapu();
    generace();


    // STATISTIKA - HRÁNO
    const now = new Date();
    const rok = now.getFullYear();
    const mesic = (now.getMonth() + 1).toString().padStart(2, "0");
    const den = now.getDate().toString().padStart(2, "0");
    const hodiny = now.getHours().toString().padStart(2, "0");
    const minuty = now.getMinutes().toString().padStart(2, "0");
    const vteriny = now.getSeconds().toString().padStart(2, "0");
    hrano = `${rok}-${mesic}-${den}T${hodiny}:${minuty}:${vteriny}`;
};


// ZVUKOVÉ EFEKTY
//var KidsCheering = new Audio("zvuk/Kids Cheering.wav");
//var SadTrombone = new Audio("zvuk/Sad Trombone.wav");
//var Bruh = new Audio("zvuk/Bruh.wav");
//var HitMarker = new Audio("zvuk/Hit Marker.wav");


// ZAOKROUHLENÍ A PŘEVEDENÍ VZDÁLENOSTI DO STRINGU (153 m nebo 1,753 km)
function vypocetVzdalenosti(vzdalenost)
{
    var vzdalenostZaokrouhlena;
    if (Math.round(vzdalenost) >= 1000)
    {
        vzdalenostZaokrouhlena = Math.round(vzdalenost)/1000 + " km";
    }
    else
    {
        vzdalenostZaokrouhlena = Math.round(vzdalenost) + " m";
    }

    return vzdalenostZaokrouhlena;
}


// VÝPOČET SKÓRE ZE VZDÁLENOSTI
function vypocetSkore(vzdalenost)
{
    var skore = Math.max(0, 100 - vzdalenost * 100 / maxVzdalenost);

    return Math.round(skore);
}


// ZOBRAZENÍ PŘÍMKY
var celkoveSkore = 0;
var perfektnichKol = 0;
function zobrazPrimku()
{
    // ODSTRANĚNÍ ODHAD BODU
    primkaBodyLayer.clearLayers();

    // VÝPOČET VZDÁLENOSTI
    var vzdalenost = souradniceOdhadu.distanceTo(souradnicePanorama); // vzdálenost v metrech
    var vzdalenostZaokrouhlena = vypocetVzdalenosti(vzdalenost);

    // VÝPOČET SKÓRE
    var skore = vypocetSkore(vzdalenost);
    celkoveSkore += skore;
    document.getElementById("celkove-skore").innerText = "CELKOVÉ SKÓRE: " + celkoveSkore;

    // NASTAVENÍ PRO PŘÍMKU
    var primkaOptions = {
        color: 'blue',
        opacity: 0.8,
        weight: 4,
        dashArray: '5, 10',
        interactive: false
    };
    
    // ZOBRAZENÍ PŘÍMKY NA MAPĚ
    var primka = L.polyline([souradniceOdhadu, souradnicePanorama], primkaOptions);
    primkaBodyLayer.addLayer(primka);
    vsechnyPrimkyBodyLayer.addLayer(primka);

    // NASTAVENÍ PRO PANORAMA MARKER
    // https://mapy.cz/?pid=57637542&newest=1&fov=1.571&x=17.5239328&y=49.2079562&z=16
    var odkaz = "https://mapy.cz/?pid=" + pid + "&newest=1&fov=1.571&x=" + souradnicePanorama.lng + "&y=" + souradnicePanorama.lat + "&z=16";

    var panoramaMarkerOptions = {
        icon: L.divIcon({
            iconSize: [22, 31],
            iconAnchor: [11, 31],
            html: `<a href="${odkaz}" target="_blank"><img src="img/body/panorama-marker.png"></a>`,
            className: "panoramaBod"
        }),
        opacity: 1,
        interactive: true
    };

    // ZOBRAZENÍ PANORAMA BODU
    var panoramaMarker = L.marker(souradnicePanorama, panoramaMarkerOptions);
    primkaBodyLayer.addLayer(panoramaMarker);
    vsechnyPrimkyBodyLayer.addLayer(panoramaMarker);

    // NASTAVENÍ PRO ODHAD MARKER
    var odhadMarkerOptions = {
        icon: L.divIcon({
            iconSize: [22, 31],
            iconAnchor: [11, 31],
            html: `<img src="img/body/odhad-marker.png">`,
            className: 'odhadBod'
        }),
        opacity: 1,
        interactive: true
    };

    // VIZITKA NAD ODHAD BODEM
    var popupOptions = {
        //maxWidth: 200,      // maximální šířka popupu
        //minWidth: 200,      // minimální šířka popupu
        autoPan: true,      // automatické posunutí mapy tak, aby byl popup viditelný
        closeButton: true,  // zobrazit tlačítko pro zavření popupu
        autoClose: true,    // automaticky zavřít popup po kliknutí na jiný popup nebo mapu
        className: 'vizitkaBodu'
    };
    var obsahVizitky = "Vzdálenost: " + vzdalenostZaokrouhlena + "<br>Skóre: " + skore;

    // ZOBRAZENÍ ODHAD BODU S VIZITKOU
    var odhadMarker = L.marker(souradniceOdhadu, odhadMarkerOptions); // zobrazení bodu
    odhadMarker.bindPopup(obsahVizitky, popupOptions); // vytvoření vizitky
    primkaBodyLayer.addLayer(odhadMarker);
    odhadMarker.openPopup(); // zobrazení vizitky automaticky
    vsechnyPrimkyBodyLayer.addLayer(odhadMarker);

    // VYCENTROVÁNÍ MAPY PODLE PŘÍMKY A BODŮ
    setTimeout(() => {
        map.fitBounds(primkaBodyLayer.getBounds().pad(0.1), {animate: false}); // zvětší hranice boundu o 10%
    }, 300);


    // PŘEHRÁNÍ ZVUKU
    if (zvukoveEfekty === true)
    {
        if (skore >= 50)
        {
            var KidsCheering = new Audio("zvuk/Kids Cheering.wav");
            KidsCheering.play();
        }
        else
        {
            var SadTrombone = new Audio("zvuk/Sad Trombone.wav");
            SadTrombone.play();
        }
    }


    // STATISTIKA - POČET PERFEKTNÍCH KOL
    if (skore === 100)
    {
        perfektnichKol++;
    }
}


// ZOBRAZENÍ VŠECH VÝSLEDKŮ (PŘÍMKY, PANORAMA BODY A ODHAD BODY S VIZITKAMI)
function zobrazVysledky()
{
    cssNormalniMapkaNaVysledkovou();

    // ZOBRAZENÍ VŠECH PŘÍMEK A BODŮ (PANORAMA + ODHAD)
    vsechnyPrimkyBodyLayer.addTo(map);

    // VYCENTROVÁNÍ MAPY PODLE VŠECH PŘÍMEK A BODŮ
    setTimeout(() => {
        map.fitBounds(vsechnyPrimkyBodyLayer.getBounds().pad(0.1), {animate: false}); // zvětší hranice boundu o 10%
    }, 300);
}


// POZADÍ MAPY, MAPA S TLAČÍTKEM, SAMOTNÁ MAPA, SAMOTNÉ TLAČÍTKO
const mapaParent = document.getElementById("mapa-parent");
const mapaKontejner = document.getElementById("mapa-kontejner");
const mapa = document.getElementById("mapa");
const btnPotvrdit = document.getElementById("btnPotvrdit");
const neniOdhadBod = document.getElementById("neniOdhadBod");
var velikostMapky = 2;
var timeoutZmenseniMapy;


// ODSTRANĚNÍ PŘÍMKY, PANORAMA BODU A ODHAD BODU
function odstraneniBoduPrimek()
{
    primkaBodyLayer.clearLayers();

    neniOdhadBod.style.display = "none";
}


// ZMĚNA CSS PRO MAPU - Z VÝSLEDKOVÉ MAPY NA NORMÁLNÍ MAPKU
function cssVysledkovaMapaNaNormalni1()
{
    // ZMĚNA CSS PRO MAPU
    mapaParent.style.transition = "0s";
    mapaParent.style.width = "0%";
    mapaParent.style.height = "0%";

    mapaKontejner.style.transition = "0s";
    mapaKontejner.style.width = "300px";
    mapaKontejner.style.height = "242px";
    mapaKontejner.style.top = "calc(100vh - 252px)";
    mapaKontejner.style.right = "10px";
    mapaKontejner.style.opacity = "0.4";

    // ZMĚNA CSS PRO TLAČÍTKO POD MAPOU
    btnPotvrdit.textContent = "POTVRDIT";
}


// ZMĚNA CSS PRO MAPU - Z NORMÁLNÍ MAPKY NA VÝSLEDKOVOU MAPU
function cssNormalniMapkaNaVysledkovou()
{
    // RESET VELIKOSTI MAPY A PINU A SKRYTÍ VELIKOSTÍ MAPY
    clearTimeout(timeoutZmenseniMapy);
    velikostMapky = 2;
    document.getElementById("velikosti").style.display = "none";
    mapaKontejner.style.borderTopLeftRadius = "10px";
    mapa.style.borderTopLeftRadius = "10px";
    pinVelikost.classList.remove("selected");
    zvetsitVelikost.classList.remove("limit");
    zmensitVelikost.classList.remove("limit");

    // ZMĚNA CSS PRO MAPU
    mapaParent.style.transition = "0s";
    mapaParent.style.width = "100%";
    mapaParent.style.height = "100%";

    mapaKontejner.style.transition = "0s";
    mapaKontejner.style.width = "1400px";
    mapaKontejner.style.height = "calc(100vh - 100px)";
    mapaKontejner.style.top = "80px";
    mapaKontejner.style.right = "calc(50vw - 700px)";
    mapaKontejner.style.opacity = "1";

    // ZMĚNA CSS PRO TLAČÍTKO POD MAPOU
    btnPotvrdit.textContent = "DALŠÍ KOLO";
}


// ZMĚNA CSS PRO NÁPOVĚDY - SKRYJE TLAČÍTKA NÁPOVĚD
function cssSkryjTlacitkaNapoved()
{
    // POVOLENA NÁPOVĚDA - VZDÁLENOST
    if (hodnotyNapovedy[0])
    {
        vzdalenostHelp.classList.remove("selected");
        vzdalenostHelp.style.display = "none";
    }

    // POVOLENA NÁPOVĚDA - SMĚR
    if (hodnotyNapovedy[1])
    {
        smerHelp.classList.remove("selected");
        smerHelp.style.display = "none";
    }

    // POVOLENA NÁPOVĚDA - KRUH
    if (hodnotyNapovedy[2])
    {
        kruhHelp.classList.remove("selected");
        kruhHelp.style.display = "none";

        // VYMAZÁNÍ KRUHU
        kruhLayer.clearLayers();
    }
}


// ZMĚNA CSS PRO NÁPOVĚDY - ODSTRANÍ VŠECHNY BODY A POLYGONY NÁPOVĚD A ZOBRAZÍ ZPÁTKY TLAČÍTKA NÁPOVĚD
function cssZobrazTlacitkaNapoved()
{
    // POVOLENA NÁPOVĚDA - VZDÁLENOST
    if (hodnotyNapovedy[0])
    {
        vzdalenostHelp.style.display = "flex";
    }

    // POVOLENA NÁPOVĚDA - SMĚR
    if (hodnotyNapovedy[1])
    {
        smerHelp.style.display = "flex";
    }

    // POVOLENA NÁPOVĚDA - KRUH
    if (hodnotyNapovedy[2])
    {
        kruhHelp.style.display = "flex";
    }
}


// ZMĚNA CSS PRO NORMÁLNÍ MAPKU - 1. VELIKOST
function cssNormalni1()
{
    // ZMĚNA CSS PRO MAPU
    mapaParent.style.transition = "0.3s";
    mapaKontejner.style.transition = "0.3s";

    mapaKontejner.style.width = "300px";
    mapaKontejner.style.height = "242px";
    mapaKontejner.style.top = "calc(100vh - 252px)";
    mapaKontejner.style.opacity = "1";
}


// ZMĚNA CSS PRO NORMÁLNÍ MAPKU - 2. VELIKOST
function cssNormalni2()
{
    // ZMĚNA CSS PRO MAPU
    mapaParent.style.transition = "0.3s";
    mapaKontejner.style.transition = "0.3s";

    mapaKontejner.style.width = "480px";
    mapaKontejner.style.height = "375px";
    mapaKontejner.style.top = "calc(100vh - 385px)";
    mapaKontejner.style.opacity = "1";
}


// ZMĚNA CSS PRO NORMÁLNÍ MAPKU - 3. VELIKOST
function cssNormalni3()
{
    // ZMĚNA CSS PRO MAPU
    mapaParent.style.transition = "0.3s";
    mapaKontejner.style.transition = "0.3s";

    mapaKontejner.style.width = "864px";
    mapaKontejner.style.height = "682px";
    mapaKontejner.style.top = "calc(100vh - 692px)";
    mapaKontejner.style.opacity = "1";
}


// ZMĚNA CSS PRO NORMÁLNÍ MAPKU - 4. VELIKOST
function cssNormalni4()
{
    // ZMĚNA CSS PRO MAPU
    mapaParent.style.transition = "0.3s";
    mapaKontejner.style.transition = "0.3s";

    mapaKontejner.style.width = "1248px";
    mapaKontejner.style.height = "782px";
    mapaKontejner.style.top = "calc(100vh - 792px)";
    mapaKontejner.style.opacity = "1";
}


// KLIKNUTÍ NA TLAČÍTKO POTVRDIT
var vysledek = false;
var konec = false;
var vypnout = false;

function zkontrolujPosledniKolo()
{
    if (aktualniKolo >= pocetKol)
    {
        aktualniKolo = pocetKol;
        konec = true;
        btnPotvrdit.textContent = "ZOBRAZ VÝSLEDKY";
    }
}

btnPotvrdit.addEventListener("click", function() {
    console.clear(); // vymaže konzoli

    // ZOBRAZENÍ VÝSLEDKOVÉ MAPY, KONEČNÉ MAPY A NORMÁLNÍ MAPKY
    if (konec || (vysledek && aktualniKolo >= pocetKol))
    {
        // Z VÝSLEDKOVÉ MAPY NA KONEČNOU MAPU
        konec = false;
        vysledek = false;

        // ZMĚNA CSS PRO TLAČÍTKO POD MAPOU
        btnPotvrdit.textContent = "VYPNOUT";

        // ZMĚNA CSS PRO NÁPOVĚDY - ODSTRANÍ VŠECHNY BODY A POLYGONY NÁPOVĚD
        napovedyLayer.clearLayers();
        kruhLayer.clearLayers();

        // ODSTRANĚNÍ PŘÍMKY, PANORAMA BODU A ODHAD BODU
        odstraneniBoduPrimek();

        // ZOBRAZENÍ VŠECH PŘÍMEK, PANORAMA BODŮ A ODHAD BODŮ S VIZITKAMI
        zobrazVysledky();
        btnPotvrdit.textContent = "VYPNOUT";

        // ZVÝRAZNĚNÍ MENU HRY
        document.querySelector(".navigation").style.zIndex = 100;

        // PRO ZOBRAZENÍ KONEČNÉ MAPY
        vypnout = true;


        // STATISTIKY
        var casovyLimit;
        if (cas === 0)
        {
            casovyLimit = "&infin;";
        }
        else
        {
            const minuty = Math.floor(cas / 60); // celé minuty
            const sekundy = cas % 60; // zbývající sekundy
            casovyLimit = `${minuty.toString().padStart(2, '0')}:${sekundy.toString().padStart(2, '0')}`;
        }

        var novaHra = {
            datum: hrano,
            herniMod: mod,
            pocetKol: pocetKol,
            casovyLimit: casovyLimit,
            obtiznosti: hodnotyObtiznosti,
            pouzitoNapoved: pouzitoNapoved,
            druhMapy: druhMapy,
            skore: celkoveSkore,
            perfektnichKol: perfektnichKol,
        };

        var historieHer = JSON.parse(localStorage.getItem("historieHer"));
        if (historieHer === null)
        {
            historieHer = [];
        }
        historieHer.push(novaHra);
        localStorage.setItem("historieHer", JSON.stringify(historieHer));


        // ANALYTICS - CUSTOM EVENT
        // Beam Analytics
        if (typeof window.beam === "function")
        {
            window.beam(`Dokončení hry/${mod}_${hodnotyObtiznosti}_${hodnotyNapovedy}_${druhMapy}_${cas}_${pocetKol}_${radius}`);
        }

        // GoatCounter
        let cislo = Math.floor(100000 + Math.random() * 900000);

        if (window.goatcounter && typeof window.goatcounter.count === "function")
        {
            window.goatcounter.count({
                path:  `Dokončení hry/${cislo}`,
                title: `${mod}_${hodnotyObtiznosti}_${hodnotyNapovedy}_${druhMapy}_${cas}_${pocetKol}_${radius}`,
                event: true,
            });
        }
    }
    else if (vypnout)
    {
        // Z KONEČNÉ MAPY NA ÚVODNÍ STRÁNKU
        vypnout = false;

        window.location.href = "index.html"; // přesměruje na úvodní stránku
    }
    else if (vysledek)
    {
        // Z VÝSLEDKOVÉ MAPY NA NORMÁLNÍ MAPKU

        // POSLEDNÍ KOLO UŽ NESMÍ SPUSTIT DALŠÍ GENERACI
        if (aktualniKolo >= pocetKol)
        {
            zkontrolujPosledniKolo();
            return;
        }

        // ZMĚNA CSS PRO MAPU
        cssVysledkovaMapaNaNormalni1();

        // ZMĚNA CSS PRO NÁPOVĚDY - ZOBRAZÍ TLAČÍTKA NÁPOVĚD
        cssZobrazTlacitkaNapoved();

        // ODSTRANÍ VŠECHNY BODY A POLYGONY NÁPOVĚD
        napovedyLayer.clearLayers();
        kruhLayer.clearLayers();

        // ODSTRANĚNÍ PŘÍMKY, PANORAMA BODU A ODHAD BODU
        odstraneniBoduPrimek();

        // VYCENTROVÁNÍ MAPY PODLE HÁDACÍHO POLYGONU
        setTimeout(() => {
            map.fitBounds(oblastBounds, {animate: false});
        }, 300);

        // GENERACE DALŠÍ SOUŘADNICE
        generace();

        // DALŠÍ KOLO
        aktualniKolo = Math.min(aktualniKolo + 1, pocetKol);
        document.getElementById("kolo").innerText = "KOLO: " + aktualniKolo + "/" + pocetKol;

        vysledek = false;
    }
    else if (!vysledek)
    {
        // POKUD BYL OZNAČEN ODHAD BOD
        if (primkaBodyLayer.getLayers().length > 0)
        {
            // Z NORMÁLNÍ MAPKY NA VÝSLEDKOVOU MAPU
            vysledek = true;

            // ZMĚNA CSS PRO MAPU
            cssNormalniMapkaNaVysledkovou();

            // ZMĚNA CSS PRO NÁPOVĚDY - SKRYJE TLAČÍTKA NÁPOVĚD
            cssSkryjTlacitkaNapoved();

            // SKRYJE OUTLINE KOLEM MAPY
            mapa.classList.remove("selected");

            // ZASTAVENÍ ČASOVAČE A VYPNUTÍ BLIKÁNÍ POZADÍ ČASOMÍRY
            clearInterval(casovac);
            document.querySelector(".cas").classList.remove("blinking");

            // ZOBRAZENÍ PŘÍMKY, PANORAMA BODU A ODHAD BODU S VIZITKOU
            zobrazPrimku();

            // KONTROLA POSLEDNÍHO KOLA
            zkontrolujPosledniKolo();
        }
        else
        {
            console.log("NEBYL OZNAČEN ODHAD BOD!");
        }
    }
});


// KLIKNUTÍ NA ZVĚTŠENÍ/ZMENŠENÍ/PIN CELÉHO OKNA MAPY
const zvetsitVelikost = document.getElementById("zvetsitVelikost");
const zmensitVelikost = document.getElementById("zmensitVelikost");
const pinVelikost = document.getElementById("pinVelikost");

// ZVĚTŠENÍ MAPY
function zvetsitMapu()
{
    if (!zvetsitVelikost.classList.contains("limit"))
    {
        velikostMapky++;
        zmensitVelikost.classList.remove("limit");

        switch (velikostMapky)
        {
            case 1: cssNormalni1(); break;
            case 2: cssNormalni2(); break;
            case 3: cssNormalni3(); break;
            case 4: cssNormalni4(); break;
        }

        if (velikostMapky === 4)
        {
            zvetsitVelikost.classList.add("limit");
        }
    }
}

// ZMENŠENÍ MAPY
function zmensitMapu()
{
    if (!zmensitVelikost.classList.contains("limit"))
    {
        velikostMapky--;
        zvetsitVelikost.classList.remove("limit");

        switch (velikostMapky)
        {
            case 1: cssNormalni1(); break;
            case 2: cssNormalni2(); break;
            case 3: cssNormalni3(); break;
            case 4: cssNormalni4(); break;
        }

        if (velikostMapky === 1)
        {
            zmensitVelikost.classList.add("limit");
        }
    }
}

// ZVĚTŠENÍ MAPY
zvetsitVelikost.addEventListener("click", function() {
    zvetsitMapu();
});

// ZMENŠENÍ MAPY
zmensitVelikost.addEventListener("click", function() {
    zmensitMapu();
});

// PIN MAPY
pinVelikost.addEventListener("click", function() {
    pinVelikost.classList.toggle("selected");
    clearTimeout(timeoutZmenseniMapy);
});


// PŘEHRÁNÍ BRUH ZVUKU
function prehratBruhZvuk()
{
    if (zvukoveEfekty === true)
    {
        var Bruh = new Audio("zvuk/Bruh.wav");
        Bruh.play();
    }
}


// KLIKNUTÍ MYŠÍ NA MAPU KDYŽ NENÍ MAPA JAKO VÝSLEDEK => MAPA JE JAKO NORMÁLNÍ MAPKA
var odhadBod;
var souradniceOdhadu;
var pouzitoNapoved = 0;
function klikNaMapu(e) // kliknulo se na mapu
{
    if (!vysledek)
    {
        var souradniceNapovedy = e.latlng; // souřadnice kliknutí

        // JE ZVOLENA NÁPOVĚDA - KRUH
        if (kruhHelp.classList.contains("selected"))
        {
            var radiusHelp = 0.2 * maxVzdalenost; // počet metrů poloměru kruhu

            // NASTAVENÍ PRO KRUH
            var kruhOptions = {
                fillColor: 'rgb(150, 0, 0)', // červená
                fillOpacity: 0.5,
                color: 'rgb(75, 0, 0)',
                opacity: 0.8,
                weight: 6,
                radius: radiusHelp,
                interactive: false,
                smoothFactor: 1,
            };

            // KDYŽ JE SOUŘADNICE PANORAMA UVNITŘ KRUHU NÁPOVĚDY
            if (radiusHelp >= souradniceNapovedy.distanceTo(souradnicePanorama))
            {
                kruhOptions.fillColor = "rgb(0, 150, 0)"; // zelená
                kruhOptions.color = "rgb(0, 75, 0)";
            }

            // ZOBRAZENÍ KRUHU
            var kruhNapoveda = L.circle(souradniceNapovedy, kruhOptions);
            napovedyLayer.addLayer(kruhNapoveda); // zobrazení kruhu

            // ODOZNAČÍ TLAČÍTKO NÁPOVĚDY A SKRYJE KRUH KOLEM KURZORU
            kruhHelp.classList.remove("selected");

            // VYMAZÁNÍ KRUHU
            kruhLayer.clearLayers();

            // SKRYJE OUTLINE KOLEM MAPY
            mapa.classList.remove("selected");


            // PŘEHRÁNÍ ZVUKU
            prehratBruhZvuk();


            // STATISTIKA - POUŽITA NÁPOVĚDA
            pouzitoNapoved++;
        }
        // JE ZVOLENA NÁPOVĚDA - VZDÁLENOST
        else if (vzdalenostHelp.classList.contains("selected"))
        {
            // VÝPOČET VZDÁLENOSTI ZAOKROUHLENÉ NA CELÉ ČÍSLO
            var vzdalenost = souradniceNapovedy.distanceTo(souradnicePanorama); // vzdálenost v metrech
            var vzdalenostZaokrouhlena;
            if (Math.round(vzdalenost) >= 1000)
            {
                vzdalenostZaokrouhlena = Math.round(vzdalenost/1000) + "<br>km";
            }
            else
            {
                vzdalenostZaokrouhlena = Math.round(vzdalenost) + "<br>m";
            }

            // NASTAVENÍ PRO VZDÁLENOST MARKER
            var vzdalenostMarkerOptions = {
                icon: L.divIcon({
                    iconSize: [34, 34],
                    iconAnchor: [17, 17],
                    html: `<img src="img/napovedy/vzdalenostHelp.png"><div>${vzdalenostZaokrouhlena}</div>`,
                    className: 'vzdalenostNapoveda'
                }),
                opacity: 1,
                interactive: false
            };
        
            // ZOBRAZENÍ VZDÁLENOST NÁPOVĚDY
            var vzdalenostNapoveda = L.marker(souradniceNapovedy, vzdalenostMarkerOptions);
            napovedyLayer.addLayer(vzdalenostNapoveda); // zobrazení bodu

            // ODOZNAČÍ TLAČÍTKO NÁPOVĚDY
            vzdalenostHelp.classList.remove("selected");

            // SKRYJE OUTLINE KOLEM MAPY
            mapa.classList.remove("selected");

            
            // PŘEHRÁNÍ ZVUKU
            prehratBruhZvuk();


            // STATISTIKA - POUŽITA NÁPOVĚDA
            pouzitoNapoved++;
        }
        // JE ZVOLENA NÁPOVĚDA - SMĚR
        else if (smerHelp.classList.contains("selected"))
        {
            // VYPOČTENÍ SMĚRU K PANORAMA BODU OD ODHAD BODU
            /* http://www.movable-type.co.uk/scripts/latlong.html#bearing */

            var lat1 = souradniceNapovedy.lat * Math.PI/180; // North = nahoru, dolů - do radiánů
            var lng1 = souradniceNapovedy.lng * Math.PI/180; // Eest = doleva, doprava - do radiánů

            var lat = souradnicePanorama.lat * Math.PI/180; // North = nahoru, dolů - do radiánů
            var lng = souradnicePanorama.lng * Math.PI/180; // Eest = doleva, doprava - do radiánů

            const x = Math.cos(lat1) * Math.sin(lat) - Math.sin(lat1) * Math.cos(lat) * Math.cos(lng - lng1);
            const y = Math.sin(lng - lng1) * Math.cos(lat);
            const theta = Math.atan2(y, x);
            const smer = (theta * 180/Math.PI + 360) % 360; // ve stupních


            // NASTAVENÍ PRO SMĚR MARKER
            var smerMarkerOptions = {
                icon: L.divIcon({
                    iconSize: [34, 34],
                    iconAnchor: [17, 17],
                    html: `<img src="img/napovedy/smerHelp.png" style="transform: rotate(${smer}deg)">`,
                    className: 'smerNapoveda'
                }),
                opacity: 1,
                interactive: false
            };
        
            // ZOBRAZENÍ SMĚR NÁPOVĚDY
            var smerNapoveda = L.marker(souradniceNapovedy, smerMarkerOptions);
            napovedyLayer.addLayer(smerNapoveda); // zobrazení bodu

            // ODOZNAČÍ TLAČÍTKO NÁPOVĚDY
            smerHelp.classList.remove("selected");

            // SKRYJE OUTLINE KOLEM MAPY
            mapa.classList.remove("selected");


            // PŘEHRÁNÍ ZVUKU
            prehratBruhZvuk();


            // STATISTIKA - POUŽITA NÁPOVĚDA
            pouzitoNapoved++;
        }
        else
        {
            primkaBodyLayer.clearLayers();

            souradniceOdhadu = e.latlng; // souřadnice kliknutí

            // NASTAVENÍ PRO PRVNÍ ODHAD MARKER
            var odhadMarkerOptions = {
                icon: L.divIcon({
                    iconSize: [22, 31],
                    iconAnchor: [11, 31],
                    html: `<img src="img/body/odhad-marker.png">`,
                    className: 'odhadBod'
                }),
                opacity: 1,
                interactive: false
            };
        
            // ZOBRAZENÍ ODHAD BODU
            var odhadBod = L.marker(souradniceOdhadu, odhadMarkerOptions);
            primkaBodyLayer.addLayer(odhadBod); // zobrazení bodu


            // PŘEHRÁNÍ ZVUKU
            if (zvukoveEfekty === true)
            {
                var HitMarker = new Audio("zvuk/Hit Marker.wav");
                HitMarker.play();
            }
        }
    }
}

map.on('click', klikNaMapu); // volání funkce při kliknutí na mapu


// KLIKNUTÍ NA NÁPOVĚDU
const vzdalenostHelp = document.getElementById("vzdalenostHelp");
const smerHelp = document.getElementById("smerHelp");
const kruhHelp = document.getElementById("kruhHelp");

function klikNaNapovedu(napoveda)
{
    if (napoveda.classList.contains("selected"))
    {
        if (kruhHelp.classList.contains("selected"))
        {
            kruhLayer.clearLayers(); // vymaže kruh
        }

        napoveda.classList.remove("selected");

        // SKRYJE OUTLINE KOLEM MAPY
        mapa.classList.remove("selected");
    }
    else
    {
        vzdalenostHelp.classList.remove("selected");
        smerHelp.classList.remove("selected");
        kruhHelp.classList.remove("selected");

        napoveda.classList.add("selected");

        if (kruhHelp.classList.contains("selected"))
        {
            zobrazKruh(kurzorMysi); // zobrazí kruh
        }

        // ZOBRAZÍ OUTLINE KOLEM MAPY
        mapa.classList.add("selected");
    }
}

vzdalenostHelp.addEventListener("click", function() {
    klikNaNapovedu(vzdalenostHelp);
});

smerHelp.addEventListener("click", function() {
    klikNaNapovedu(smerHelp);
});

kruhHelp.addEventListener("click", function() {
    klikNaNapovedu(kruhHelp);
});


// OZNAČENÍ NÁPOVĚDY POMOCÍ KLÁVESOVÉ ZKRATKY
document.addEventListener("keydown", function(event) {
    if (event.code === "Digit1" || event.code === "Digit2" || event.code === "Digit3")
    {
        event.preventDefault();

        if (event.code === "Digit1" && hodnotyNapovedy[0])
        {
            klikNaNapovedu(vzdalenostHelp);
        }
        else if (event.code === "Digit2" && hodnotyNapovedy[1])
        {
            klikNaNapovedu(smerHelp);
        }
        else if (event.code === "Digit3" && hodnotyNapovedy[2])
        {
            klikNaNapovedu(kruhHelp);
        }
    }
});


// ZOBRAZÍ POMOCNÝ KRUH POD KURZOREM
function zobrazKruh(e)
{
    // VYMAZÁNÍ KRUHU
    kruhLayer.clearLayers();

    var souradniceKuruzoru = e.latlng;

    var radiusHelp = 0.2 * maxVzdalenost; // počet metrů poloměru kruhu

    // NASTAVENÍ PRO KRUH
    var kruhOptions = {
        fillColor: 'rgb(0, 150, 0)', // zelená
        fillOpacity: 0.5,
        color: 'rgb(0, 75, 0)',
        opacity: 0.8,
        weight: 6,
        radius: radiusHelp,
        interactive: false,
        smoothFactor: 1,
    };

    // ZOBRAZENÍ KRUHU
    var kruh = L.circle(souradniceKuruzoru, kruhOptions);
    kruhLayer.addLayer(kruh); // zobrazení kruhu
}

// ZOBRAZENÍ NÁPOVĚDY - KRUH NA MAPCE
var kurzorMysi;
map.on('mousemove', function(e) {
    kurzorMysi = e;

    if (kruhHelp.classList.contains("selected"))
    {
        zobrazKruh(e); // zobrazí kruh
    }
});

map.on('mouseover', function(e) {
    if (kruhHelp.classList.contains("selected"))
    {
        //zobrazKruh(e); // zobrazí kruh
    }
});

map.on('mouseout', function(e) {
    if (kruhHelp.classList.contains("selected"))
    {
        kruhLayer.clearLayers(); // vymaže kruh
    }
});


// ZOBRAZENÍ KURZORU CROSSHAIR/GRABBING
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


// PŘI POHNUTÍ S MAPOU ZA LIMIT, ZAROVNÁ MAPU NA STŘED HÁDACÍHO POLYGONU
function vratNaStredPolygonu()
{
    var stredCR = L.latLng(49.80357765, 15.47488575); // střed ČR
    var stredMapy = map.getCenter(); // získá střed mapy
    var vzdalenost = stredCR.distanceTo(stredMapy); // vzdálenost v metrech

    if (vzdalenost > 300000)
    {
        // VYCENTROVÁNÍ MAPY PODLE HÁDACÍHO POLYGONU
        map.setView(stredPolygonu);
    }
}

// volání funkce při pohybu s mapou
map.on('moveend', function() {
    vratNaStredPolygonu();
});
