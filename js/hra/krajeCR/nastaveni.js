// NAČTE HODNOTY POTŘEBNÉ PRO FUNGOVÁNÍ MÓDU
function nactiHodnotyModu()
{
    // KRAJ
    kraj = sessionStorage.getItem("kraj");
    sessionStorage.removeItem("kraj");

    // NÁZEV MÓDU DO MENU
    document.getElementById("mod").innerText = "MÓD: kraj ČR";

    cas = Number(hodnotySlideru[1]);
    pocetKol = Number(hodnotySlideru[0]);
    document.getElementById("kolo").innerText = "KOLO: " + "1" + "/" + pocetKol;
}

nactiHodnotyModu();


// NAČTE SKRIPTY POTŘEBNÉ PRO FUNGOVÁNÍ MÓDU
function nactiScriptyModu()
{
    // NAČTENÍ PŘÍSLUŠNÉHO SCRIPTU PODLE KRAJE
    var scriptElement = document.createElement('script');
    switch (kraj)
    {
        case 'Praha': scriptElement.src = "polygony/HlavniMestoPraha.js"; maxVzdalenost = 12568; break;
        case 'Jihočeský': scriptElement.src = "polygony/Jihocesky.js"; maxVzdalenost = 56582; break;
        case 'Jihomoravský': scriptElement.src = "polygony/Jihomoravsky.js"; maxVzdalenost = 47833; break;
        case 'Karlovarský': scriptElement.src = "polygony/Karlovarsky.js"; maxVzdalenost = 32461; break;
        case 'Královéhradecký': scriptElement.src = "polygony/Kralovehradecky.js"; maxVzdalenost = 38921; break;
        case 'Liberecký': scriptElement.src = "polygony/Liberecky.js"; maxVzdalenost = 31732; break;
        case 'Moravskoslezský': scriptElement.src = "polygony/Moravskoslezsky.js"; maxVzdalenost = 41562; break;
        case 'Olomoucký': scriptElement.src = "polygony/Olomoucky.js"; maxVzdalenost = 40963; break;
        case 'Pardubický': scriptElement.src = "polygony/Pardubicky.js"; maxVzdalenost = 37928; break;
        case 'Plzeňský': scriptElement.src = "polygony/Plzensky.js"; maxVzdalenost = 49343; break;
        case 'Středočeský': scriptElement.src = "polygony/Stredocesky.js"; maxVzdalenost = 58980; break;
        case 'Ústecký': scriptElement.src = "polygony/Ustecky.js"; maxVzdalenost = 41223; break;
        case 'Vysočina': scriptElement.src = "polygony/Vysocina.js"; maxVzdalenost = 46510; break;
        case 'Zlínský': scriptElement.src = "polygony/Zlinsky.js"; maxVzdalenost = 35517; break;
    }
    document.body.appendChild(scriptElement);
}

nactiScriptyModu();
