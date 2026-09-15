// VYTVOŘÍ ŘÁDEK TABULKY S DATY Z POLE historieHerKopie
function vytvorTabulkovyRadek(data)
{
    // VYTVOŘÍ ŘÁDEK
    const tr = document.createElement("tr");

    // DATUM
    var sloupec = document.createElement("td");
    var datum = new Date(data.datum);
    var upraveneDatum = datum.toLocaleString("cs-CZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false // Zajistí, že čas bude ve 24h formátu
    });
    sloupec.textContent = upraveneDatum;
    tr.appendChild(sloupec);

    // HERNÍ MÓD
    var sloupec = document.createElement("td");
    switch (data.herniMod)
    {
        case "celaCR": sloupec.textContent = "celá ČR"; break;
        case "krajeCR": sloupec.textContent = "kraje ČR"; break;
        case "vlastniMisto": sloupec.textContent = "vlastní místo"; break;
        case "specifickaMista": sloupec.textContent = "specifická místa"; break;
    }
    tr.appendChild(sloupec);

    // POČET KOL
    var sloupec = document.createElement("td");
    sloupec.textContent = data.pocetKol;
    tr.appendChild(sloupec);

    // ČASOVÝ LIMIT
    var sloupec = document.createElement("td");
    sloupec.innerHTML = data.casovyLimit;
    tr.appendChild(sloupec);

    // OBTÍŽNOSTI
    var sloupec = document.createElement("td");
    var div = document.createElement("div");
    if (data.obtiznosti[0] === true)
    {
        div.insertAdjacentHTML('beforeend', '<img src="img/obtiznostiTabulka/pohybOn.png" alt="pohybON">');
    }
    else
    {
        div.insertAdjacentHTML('beforeend', '<img src="img/obtiznostiTabulka/pohybOff.png" alt="pohybOFF">');
    }

    if (data.obtiznosti[1] === true)
    {
        div.insertAdjacentHTML('beforeend', '<img src="img/obtiznostiTabulka/otaceniOn.png" alt="otáčeníON">');
    }
    else
    {
        div.insertAdjacentHTML('beforeend', '<img src="img/obtiznostiTabulka/otaceniOff.png" alt="otáčeníOFF">');
    }

    if (data.obtiznosti[2] === true)
    {
        div.insertAdjacentHTML('beforeend', '<img src="img/obtiznostiTabulka/zoomOn.png" alt="zoomON">');
    }
    else
    {
        div.insertAdjacentHTML('beforeend', '<img src="img/obtiznostiTabulka/zoomOff.png" alt="zoomOFF">');
    }
    div.classList.add("obtiznosti");
    sloupec.appendChild(div);
    tr.appendChild(sloupec);

    // POUŽITO NÁPOVĚD
    var sloupec = document.createElement("td");
    sloupec.textContent = data.pouzitoNapoved;
    tr.appendChild(sloupec);

    // DRUH MAPY
    var sloupec = document.createElement("td");
    switch (data.druhMapy)
    {
        case "zakladni": sloupec.textContent = "základní"; break;
        case "turisticka": sloupec.textContent = "turistická"; break;
        case "letecka": sloupec.textContent = "letecká"; break;
    }
    tr.appendChild(sloupec);

    // SKÓRE
    var sloupec = document.createElement("td");
    sloupec.textContent = data.skore;
    tr.appendChild(sloupec);

    // PERFEKTNÍCH KOL
    var sloupec = document.createElement("td");
    sloupec.textContent = data.perfektnichKol;
    tr.appendChild(sloupec);


    return tr;
}


// NAČTENÍ TABULKY
const tbody = document.querySelector("#historieTabulka tbody");

// ZOBRAZENÍ ŘÁDKŮ TABULKY S DATY Z POLE historieHerKopie
const pocetRadkuCelkem = document.getElementById("pocetRadkuCelkem");
var celkemStranek;
function zobrazRadky()
{
    // KDYŽ NEJSOU ŽÁDNÁ DATA
    if (historieHerKopie.length === 0)
    {
        return;
    }


    // VYMAZÁNÍ VŠECH ŘÁDKŮ
    tbody.innerHTML = "";


    // ZVOLENY VŠECHNY ŘÁDKY NA STRÁNKU
    if (pocetRadkuSelect.value === "all")
    {
        historieHerKopie.forEach(data => {
            const radek = vytvorTabulkovyRadek(data);
            tbody.appendChild(radek);
        });

        celkemStranek = 1;
        pocetRadkuCelkem.textContent = "Zobrazeno 1-" + historieHerKopie.length + " z " + historieHerKopie.length + " řádků";
        
        // zobrazí tlačítka stránek
        generujTlacitkaStranek();

        // ztmavne tlačítka vpřed a vzad
        btnVpred.classList.add("limit");
        btnVzad.classList.add("limit");

        return;
    }

    // ZVOLEN POČET ŘÁDKŮ NA STRÁNKU
    const pocetRadku = parseInt(pocetRadkuSelect.value);
    const prvniRadek = (stranka - 1) * pocetRadku;
    const posledniRadek = prvniRadek + pocetRadku;
    celkemStranek = Math.ceil(historieHerKopie.length / pocetRadku);

    var pocetRadkuNaStrance;
    for (let index = prvniRadek; index < posledniRadek; index++)
    {
        const radek = vytvorTabulkovyRadek(historieHerKopie[index]);
        tbody.appendChild(radek);
        pocetRadkuNaStrance = index + 1;

        if (pocetRadkuNaStrance === historieHerKopie.length)
        {
            break;
        }
    }

    pocetRadkuCelkem.textContent = "Zobrazeno " + (prvniRadek + 1) + "-" + pocetRadkuNaStrance + " z " + historieHerKopie.length + " řádků";

    if (pocetRadkuNaStrance === historieHerKopie.length)
    {
        btnVpred.classList.add("limit");
    }
    else
    {
        btnVpred.classList.remove("limit");
    }

    if (prvniRadek + 1 === 1)
    {
        btnVzad.classList.add("limit");
    }
    else
    {
        btnVzad.classList.remove("limit");
    }


    // zobrazí tlačítka stránek
    generujTlacitkaStranek();
}

// ZVOLEN POČET ŘÁDKŮ NA STRÁNKU
const pocetRadkuSelect = document.getElementById("selectPocetRadku");
pocetRadkuSelect.addEventListener("change", function() {
    stranka = 1;
    zobrazRadky();
});

// DALŠÍ STRÁNKA TABULKY
const btnVpred = document.getElementById("btnVpred");
btnVpred.addEventListener("click", function() {
    if (stranka < celkemStranek)
    {
        stranka++;
        zobrazRadky();
    }
});

// PŘEDCHOZÍ STRÁNKA TABULKY
const btnVzad = document.getElementById("btnVzad");
btnVzad.addEventListener("click", function() {
    if (stranka > 1)
    {
        stranka--;
        zobrazRadky();
    }
});



// SEŘAZENÍ POLE PODLE VYBRANÉHO KLÍČE
function seradPodleKlice(klic)
{
    return function (a, b)
    {
        if (a[klic] < b[klic]) return -1;
        if (a[klic] > b[klic]) return 1;
        return 0;
    };
}


// KLIKNULO SE NA HLAVIČKU TABULKY
document.querySelectorAll("#historieTabulka th").forEach((th) => {
    th.addEventListener("click", () => {
        const tridiciKlic = th.getAttribute("data-sort");

        if (posledniTridiciKlic === tridiciKlic)
        {
            historieHerKopie.reverse();

            // zobrazí/skryje se šipka dolů
            th.classList.toggle("serazeno-desc");

            // skryje/zobrazí se šipka nahoru
            th.classList.toggle("serazeno-asc");
        }
        else
        {
            historieHerKopie.sort(seradPodleKlice(tridiciKlic));

            // zobrazí se šipka nahoru
            th.classList.add("serazeno-asc");

            // schovají se obě šipky u předchozího seřazení
            const THposlednihoTridicihoKlice = document.querySelector(`th[data-sort="${posledniTridiciKlic}"]`);
            THposlednihoTridicihoKlice.classList.remove("serazeno-asc");
            THposlednihoTridicihoKlice.classList.remove("serazeno-desc");
        }


        posledniTridiciKlic = tridiciKlic;
        stranka = 1;
        zobrazRadky();
    });
});



// VYTVOŘÍ A ZOBRAZÍ TLAČÍTKA STRÁNEK
function generujTlacitkaStranek()
{
    let zacatek;
    let konec;

    if (celkemStranek <= 5)
    {
        // Pokud je celkový počet stránek menší nebo roven 5, zobrazíme všechny stránky
        zacatek = 1;
        konec = celkemStranek;
    }
    else
    {
        // Pokud je celkový počet stránek větší než 5
        if (stranka <= 3)
        {
            // Zobrazíme prvních 5 stránek, pokud jsme na jedné z prvních 3 stránek
            zacatek = 1;
            konec = 5;
        }
        else if (stranka >= celkemStranek - 2)
        {
            // Zobrazíme posledních 5 stránek, pokud jsme na jedné z posledních 2 stránek
            zacatek = celkemStranek - 4;
            konec = celkemStranek;
        }
        else
        {
            // Zobrazíme 5 stránek kolem aktuální stránky
            zacatek = stranka - 2;
            konec = stranka + 2;
        }
    }

    // Vygenerování tlačítek pro jednotlivé stránky
    let tlacitkaHtml = '';
    for (let i = zacatek; i <= konec; i++)
    {
        let tlacitkoClass = "strankovaciTlacitko";
        if (i === stranka)
        {
            tlacitkoClass += " aktualniStranka";
        }
        tlacitkaHtml += `<button class="${tlacitkoClass}" data-stranka="${i}">${i}</button>`;
    }
    
    // Vložení tlačítek do HTML
    const strankovaniTlacitkaElement = document.querySelector('.stranky');
    strankovaniTlacitkaElement.innerHTML = tlacitkaHtml;



    // Přidání event listeneru pro kliknutí na tlačítka
    const tlacitka = document.querySelectorAll('.strankovaciTlacitko');
    tlacitka.forEach((tlacitko) => {
        tlacitko.addEventListener('click', () => {
            stranka = parseInt(tlacitko.getAttribute('data-stranka'));
            zobrazRadky();
        });
    });
}



// INICIALIZACE TABULKY
var posledniTridiciKlic = "datum";
historieHerKopie.sort(seradPodleKlice(posledniTridiciKlic));
historieHerKopie.reverse();
document.querySelector(`th[data-sort="${posledniTridiciKlic}"]`).classList.add("serazeno-desc");

var stranka = 1;
zobrazRadky();
