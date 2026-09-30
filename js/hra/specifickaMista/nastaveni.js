// NAČTE HODNOTY POTŘEBNÉ PRO FUNGOVÁNÍ MÓDU
function nactiHodnotyModu()
{
    // SPECIFICKÁ MÍSTA
    specifickaMista = JSON.parse(sessionStorage.getItem("specifickaMista"));
    sessionStorage.removeItem("specifickaMista");
    zastavkyMHD = JSON.parse(sessionStorage.getItem("zastavkyMHD")) || [false, false];
    sessionStorage.removeItem("zastavkyMHD");

    // NÁZEV MÓDU DO MENU
    document.getElementById("mod").innerText = "MÓD: specifická místa";

    cas = Number(hodnotySlideru[1]);
    pocetKol = Number(hodnotySlideru[0]);
    document.getElementById("kolo").innerText = "KOLO: " + "1" + "/" + pocetKol;

    maxVzdalenost = zastavkyMHD.some(zastavka => zastavka) ? 500 : 158447;
}

nactiHodnotyModu();


// VŠECHNA SPECIFICKÁ MÍSTA
const vsechnaMista = ["hrady", "zamky", "supermarkety", "letiste", "dalnice", "urady", "policie", "hasici", "nemocnice", "vlakovaNadrazi", "kina", "divadla"];
const vsechnyZastavkyMHD = [
    { soubor: "dpmb", data: "dpmb" },
    { soubor: "blansko", data: "zastavky" }
];


// NAČTE SKRIPTY POTŘEBNÉ PRO FUNGOVÁNÍ MÓDU
function nactiScriptyModu()
{
    const scripts = [nactiScriptHry("polygony/CzechRepublic.js")];

    for (let index = 0; index < specifickaMista.length; index++)
    {
        if (specifickaMista[index] === true)
        {
            scripts.push(nactiScriptHry("specifickaMista/" + vsechnaMista[index] + ".js"));
        }
    }

    for (let index = 0; index < zastavkyMHD.length; index++)
    {
        if (zastavkyMHD[index] === true)
        {
            scripts.push(nactiScriptHry("specifickaMista/" + vsechnyZastavkyMHD[index].soubor + ".js"));
        }
    }

    return Promise.all(scripts);
}

window.dataModuReady = nactiScriptyModu();
