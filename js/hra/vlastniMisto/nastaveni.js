// NAČTE HODNOTY POTŘEBNÉ PRO FUNGOVÁNÍ MÓDU
function nactiHodnotyModu()
{
    // SOUŘADNICE MÍSTA
    var souradniceMistaPole = JSON.parse(sessionStorage.getItem("souradniceMista"));
    souradniceMista = L.latLng(souradniceMistaPole.lat, souradniceMistaPole.lng);
    sessionStorage.removeItem("souradniceMista");

    // NÁZEV MÓDU DO MENU
    document.getElementById("mod").innerText = "MÓD: vlastní místo";

    cas = Number(hodnotySlideru[2]);
    pocetKol = Number(hodnotySlideru[1]);
    document.getElementById("kolo").innerText = "KOLO: " + "1" + "/" + pocetKol;
    radius = Number(hodnotySlideru[0]) * 1000;

    maxVzdalenost = 1 * radius;
}

nactiHodnotyModu();
