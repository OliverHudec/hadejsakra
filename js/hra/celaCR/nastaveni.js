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
    // NAČTENÍ SCRIPTU CzechRepublic.js
    var scriptElement = document.createElement('script');
    scriptElement.src = "polygony/CzechRepublic.js";
    document.body.appendChild(scriptElement);
}

nactiScriptyModu();
