// NAČTE HODNOTY POTŘEBNÉ PRO FUNGOVÁNÍ MÓDU
function nactiHodnotyModu()
{
    // NÁZEV MÓDU DO MENU
    document.getElementById("mod").innerText = "MÓD: celá ČR";

    cas = Number(hodnotySlideru[1]);
    pocetKol = Number(hodnotySlideru[0]);
    document.getElementById("kolo").innerText = "KOLO: " + "1" + "/" + pocetKol;

    maxVzdalenost = 158447;
}

nactiHodnotyModu();


// NAČTE SKRIPTY POTŘEBNÉ PRO FUNGOVÁNÍ MÓDU
function nactiScriptyModu()
{
    return nactiScriptHry("polygony/CzechRepublic.js");
}

window.dataModuReady = nactiScriptyModu();
