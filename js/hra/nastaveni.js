// KONTROLA ZAPNUTÍ HRY SKRZE NASTAVENÍ
var mod = sessionStorage.getItem("mod");
sessionStorage.removeItem("mod");
if (mod === null)
{
    window.location.href = "index.html";
}
else
{
    nactiHodnoty();
}


// NAČTENÍ VŠECH HODNOT Z NASTAVENÍ
//const polomerZeme = 6371e3; // 6 371 000 metrů poloměr Země
var hodnotyObtiznosti, hodnotyNapovedy, druhMapy, hodnotySlideru;
var cas, pocetKol, radius, souradniceMista, kraj, specifickaMista;
var aktualniKolo = 1;
var celkoveSkore = 0;
var maxVzdalenost;
function nactiHodnoty()
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


    // NAČTENÍ SCRIPTU nastaveni.js
    var scriptElement = document.createElement('script');
    scriptElement.src = "js/hra/" + mod + "/nastaveni.js";
    document.body.appendChild(scriptElement);

    // NAČTENÍ SCRIPTU generace.js
    var scriptElement = document.createElement('script');
    scriptElement.src = "js/hra/" + mod + "/generace.js";
    document.body.appendChild(scriptElement);

    // NAČTENÍ SCRIPTU vytvorOblastAZarovnejMapu.js
    var scriptElement = document.createElement('script');
    scriptElement.src = "js/hra/vytvorOblastAZarovnejMapu.js";
    document.body.appendChild(scriptElement);
}
