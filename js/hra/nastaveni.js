// KONTROLA ZAPNUTÍ HRY SKRZE NASTAVENÍ
var mod = sessionStorage.getItem("mod");
sessionStorage.removeItem("mod");
window.dataModuReady = Promise.resolve();
var gameSetupReady = Promise.resolve();
if (mod === null)
{
    window.location.href = "index.html";
}
else
{
    gameSetupReady = nactiHodnoty();
}


// NAČTENÍ VŠECH HODNOT Z NASTAVENÍ
//const polomerZeme = 6371e3; // 6 371 000 metrů poloměr Země
var hodnotyObtiznosti, hodnotyNapovedy, druhMapy, hodnotySlideru;
var cas, pocetKol, radius, souradniceMista, kraj, specifickaMista, zastavkyMHD;
var aktualniKolo = 1;
var celkoveSkore = 0;
var maxVzdalenost;
async function nactiHodnoty()
{
    // HODNOTY SLIDERŮ
    hodnotySlideru = JSON.parse(sessionStorage.getItem("hodnotySlideru"));
    sessionStorage.removeItem("hodnotySlideru");

    // OBTÍŽNOSTI
    hodnotyObtiznosti = JSON.parse(sessionStorage.getItem("hodnotyObtiznosti"));
    sessionStorage.removeItem("hodnotyObtiznosti");

    // NÁPOVĚDY
    hodnotyNapovedy = JSON.parse(sessionStorage.getItem("hodnotyNapovedy"));
    sessionStorage.removeItem("hodnotyNapovedy");

    // DRUH MAPY
    druhMapy = sessionStorage.getItem("selectedDruhMapy");
    sessionStorage.removeItem("selectedDruhMapy");


    await nactiScriptHry("js/hra/" + mod + "/nastaveni.js");
    await window.dataModuReady;
    await nactiScriptHry("js/hra/" + mod + "/generace.js");
    await nactiScriptHry("js/hra/vytvorOblastAZarovnejMapu.js");
}

function nactiScriptHry(src)
{
    return new Promise((resolve, reject) => {
        const scriptElement = document.createElement("script");
        scriptElement.src = src;
        scriptElement.onload = resolve;
        scriptElement.onerror = () => reject(new Error("Nepodařilo se načíst " + src));
        document.body.appendChild(scriptElement);
    });
}
