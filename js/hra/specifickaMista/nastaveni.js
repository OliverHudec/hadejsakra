// NAČTE HODNOTY POTŘEBNÉ PRO FUNGOVÁNÍ MÓDU
function nactiHodnotyModu()
{
    // SPECIFICKÁ MÍSTA
    specifickaMista = JSON.parse(sessionStorage.getItem("specifickaMista"));
    sessionStorage.removeItem("specifickaMista");

    // NÁZEV MÓDU DO MENU
    document.getElementById("mod").innerText = "MÓD: specifická místa";

    cas = Number(hodnotySlideru[1]);
    pocetKol = Number(hodnotySlideru[0]);
    document.getElementById("kolo").innerText = "KOLO: " + "1" + "/" + pocetKol;

    maxVzdalenost = specifickaMista[12] ? 500 : 158447;
}

nactiHodnotyModu();


// VŠECHNA SPECIFICKÁ MÍSTA
const vsechnaMista = ["hrady", "zamky", "supermarkety", "letiste", "dalnice", "urady", "policie", "hasici", "nemocnice", "vlakovaNadrazi", "kina", "divadla", "dpmb"];


// NAČTE SKRIPTY POTŘEBNÉ PRO FUNGOVÁNÍ MÓDU
function nactiScriptyModu()
{
    // NAČTENÍ SCRIPTU CzechRepublic.js
    var scriptElement = document.createElement('script');
    scriptElement.src = "polygony/CzechRepublic.js";
    document.body.appendChild(scriptElement);

    
    // NAČTENÍ PŘÍSLUŠNÉHO SCRIPTU PODLE VYBRANÝCH SPECIFICKÝCH MÍST
    for (let index = 0; index < specifickaMista.length; index++)
    {
        if (specifickaMista[index] === true)
        {
            var scriptElement = document.createElement('script');
            scriptElement.src = "specifickaMista/" + vsechnaMista[index] + ".js";
            document.body.appendChild(scriptElement);
        }
    }
}

nactiScriptyModu();
