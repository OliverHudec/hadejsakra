// ZOBRAZENÍ EXISTUJÍCÍHO PANORAMA
var nastaveniPanorama;
var panoData;
var pid;
async function zobrazPanorama()
{
    const container = document.querySelector(".panorama");

    // NASTAVENÍ PANORAMA
    nastaveniPanorama = {
        apiKey: API_KEY,
        parent: container,
        lon: souradnicePanorama.lng,
        lat: souradnicePanorama.lat,
    
        yaw: "point",
        pitch: Math.PI * 0,
        fov: Math.PI * 0.5,
        showNavigation: true,
        lang: "cs"
    };

    // NASTAVENÍ OBTÍŽNOSTI PANORAMA
    if (hodnotyObtiznosti[0] === false) // skrytí šipek, vypnutí pohybu
    {
        nastaveniPanorama.showNavigation = false;
    }

    // VYTVOŘENÍ PANORAMA
    if (panoData)
    {
        panoData.destroy();
    }
    panoData = await Panorama.panoramaFromPosition(nastaveniPanorama);

    // KONTROLA SPRÁVNÉHO VYTVOŘENÍ PANORAMA
    if (panoData.error)
    {
        document.getElementById("mapa-kontejner").style.display = "none"; // skryje mapku
        document.querySelector(".loading .kolecko").style.display = "none"; // skryje načítací kolečko
        document.getElementById("loadingText").innerHTML = `KÓD: ${panoData.errorCode}<br>ZPRÁVA: ${panoData.error}`; // zobrazí chybový text
        return;
    }
    else
    {
        pid = panoData.setCamera({})._place._data.pid // získání panorama id

        console.log("SOUŘADNICE PANORAMA:\n" + souradnicePanorama);

        document.querySelector(".loading").style.display = "none"; // skryje celé načítání
        document.getElementById("mapa-kontejner").style.transform = "translate(-50%, -50%) scale(1)"; // zobrazí mapku uprostřed

        // SPUŠTĚNÍ ČASU
        if (cas !== 0)
        {
            spustitCas(cas - 1);
        }
    }

    // NASTAVENÍ OBTÍŽNOSTI PANORAMA
    await obtiznostPanorama();
}


// NASTAVENÍ OBTÍŽNOSTI PANORAMA
async function obtiznostPanorama()
{
    const elementy = document.querySelectorAll(".panorama-kontejner *");

    if (hodnotyObtiznosti[1] === false) // vypnutí otáčení
    {
        var isDragging = false;

        elementy.forEach(element => {
            element.addEventListener("mousedown", function() {
                isDragging = true;
            });
        
            element.addEventListener("mouseup", function() {
                isDragging = false;
            });
        
            element.addEventListener("mousemove", function(event) {
                if (isDragging) // pokud jsem kliknul myší a otáčím panorama
                {
                    event.preventDefault();
                    event.stopPropagation();
                }
            });
        });

        // VYPNUTÍ ŠIPEK DOPRAVA, DOLEVA A KLÁVES A a D
        document.addEventListener("keydown", function(event) {
            console.log(event.target);
            if (['ArrowLeft', 'ArrowRight', 'a', 'A', 'd', 'D'].includes(event.key))
            {
                event.preventDefault();
                event.stopPropagation();
            }
        });
    }
    if (hodnotyObtiznosti[2] === false) // vypnutí zoomu
    {
        const eventy = ['wheel', 'dblclick'];

        elementy.forEach(element => {
            eventy.forEach(event => {
                element.addEventListener(event, function(event) {
                    event.preventDefault();
                    event.stopPropagation();
                });
            });
        });
    }
}


/* ******************************************************************************************************************************** */
// TLAČÍTKO = NÁVRAT NA ZAČÁTEK AKTUÁLNÍHO KOLA
document.getElementById("resetPanorama").addEventListener("click", async function() {
    if (!panoData || !nastaveniPanorama)
    {
        return;
    }

    panoData.destroy();
    panoData = await Panorama.panoramaFromPosition(nastaveniPanorama);

    if (!panoData.error)
    {
        await obtiznostPanorama();
    }
});



// HLASITOST TLAČÍTKO = VYPNUTÍ/ZAPNUTÍ ZVUKOVÝCH EFEKTŮ
var zvukoveEfekty = JSON.parse(localStorage.getItem("zvukoveEfekty"));
if (zvukoveEfekty === null)
{
    zvukoveEfekty = true;
}
if (zvukoveEfekty === false)
{
    document.getElementById("zvuk").innerHTML = "<i class='fa-solid fa-volume-xmark'></i>";
}

document.getElementById("zvuk").addEventListener("click", function() {
    if (zvukoveEfekty === true)
    {
        zvukoveEfekty = false;
        document.getElementById("zvuk").innerHTML = "<i class='fa-solid fa-volume-xmark'></i>";
    }
    else
    {
        zvukoveEfekty = true;
        document.getElementById("zvuk").innerHTML = "<i class='fa-solid fa-volume-high'></i>";
    }
    
    localStorage.setItem("zvukoveEfekty", zvukoveEfekty);
});



// VYGENERUJE SOUŘADNICI A ZKONTROLUJE, ZDA SE SOUŘADNICE NACHÁZÍ UVNITŘ POLYGONU
var souradnicePanorama;
async function vygenerujMisto()
{
    // začíná načítání panorama
    document.querySelector(".loading").style.display = "flex"; // zobrazí celé načítání
    document.getElementById("loadingText").innerHTML = "NAČÍTÁM PANORAMA, POČKEJ PROSÍM."; // zobrazí načítací text

    var pocetPokusu = 0;
    while (true)
    {
        pocetPokusu++; // přidá další pokus

        var vygenerovanaSouradnice = await vygenerujSouradnici(); // vygeneruje souřadnici uvnitř polygonu
        var existuje = await existujePanorama(vygenerovanaSouradnice); // zjistí, zdali se nachází nějaké panorama do 1000 metrů okolo vygenerované souřadnice

        if (pocetPokusu > 30) // pokud byla vygenerována souřadnice více než 30krát
        {
            console.log("SOUŘADNICE PANORAMA NENALEZENA ANI NA 30. POKUS");
            document.querySelector(".loading .kolecko").style.display = "none"; // skryje načítací kolečko
            document.getElementById("loadingText").innerHTML = "NEBYLO NALEZENO ŽÁDNÉ PANORAMA.<br>VYBER SI JINÉ MÍSTO!"; // zobrazí chybový text;
            return;
        }

        if (existuje.exists) // pokud panorama existuje
        {
            souradnicePanorama = L.latLng(existuje.info.lat, existuje.info.lon);

            if (kontrolaSouradnice(souradnicePanorama)) // pokud je souřadnice panorama uvnitř polygonu
            {
                console.log("SOUŘADNICE PANORAMA NALEZENA NA " + pocetPokusu + ". POKUS");
                zobrazPanorama(); // zobrazí panorama
                return;
            }
        }

    }
}


// ZKONTROLUJE, ZDALI EXISTUJE PANORAMA V OKOLÍ VYGENEROVANÉ SOUŘADNICE
async function existujePanorama(souradnice)
{
    var existencePanorama = {
        apiKey: API_KEY,
        lon: souradnice.lng,
        lat: souradnice.lat,
        radius: 1000 // 1000 metrů
    };

    const existsData = await Panorama.panoramaExists(existencePanorama);

    return existsData;
}
