/* **************************************************************************************************************************************************************** */
/* POPUP OKNO */

// ZOBRAZENÍ/SKRYTÍ PŘÍSLUŠNÉHO POPUP OKNA
function togglePopup(btn, popup, closeBtn)
{
    const herniMod = btn.closest(".herniMod");
    const popupContent = popup.querySelector(".popup-content");

    function closePopup()
    {
        herniMod.classList.remove("popup-open");
        popup.classList.remove("is-open");
        popupContent.style.transform = "scale(0)";
    }

    btn.addEventListener("click", function() {
        document.querySelectorAll(".popup.is-open").forEach(openPopup => {
            openPopup.classList.remove("is-open");
            openPopup.querySelector(".popup-content").style.transform = "scale(0)";
        });
        document.querySelectorAll(".herniMod.popup-open").forEach(openMod => {
            openMod.classList.remove("popup-open");
        });

        herniMod.classList.add("popup-open");
        popup.classList.add("is-open");
        popupContent.style.transform = "scale(1)";

        if (popup.id === "popup-VlastniMisto")
        {
            setTimeout(function() {
                if (typeof map !== "undefined")
                {
                    map.invalidateSize({ pan: false });

                    if (typeof souradniceMista !== "undefined" && souradniceMista)
                    {
                        map.setView(souradniceMista, 12, { animate: false });
                    }
                }
            }, 450);
        }
    });

    closeBtn.addEventListener("click", function() {
        closePopup();
    });

    popup.addEventListener("click", function(event) {
        if (event.target === popup)
        {
            closePopup();
        }
    });
}


// TLAČÍTKO PRO OTEVŘENÍ POPUP OKNA, POPUP OKNO A ZAVÍRACÍ TLAČÍTKO UVNITŘ POPUP OKNA
function setupPopup(popupName)
{
    const btn = document.getElementById("btn-" + popupName);
    const popup = document.getElementById("popup-" + popupName);
    const closeBtn = document.getElementById("close-" + popupName);

    document.body.appendChild(popup);
    togglePopup(btn, popup, closeBtn);
}

/* **************************************************************************************************************************************************************** */
/* BUTTON HERNÍ MÓD */

// KONTROLA, ZDA BYL POKUS O SPUŠTĚNÍ HRY NA MOBILU
function jeMobil()
{
    const neniPC = /iPhone|iPad|iPod|Android|webOS|BlackBerry|Windows Phone|Tablet/i.test(navigator.userAgent);
    return neniPC;
}


// ZAPNUTÍ PŘÍSLUŠNÉHO HERNÍHO MÓDU
function zapnoutHru(nazevModu)
{
    const btnZapnoutHru = document.getElementById("btnZapnoutHru-" + nazevModu);

    btnZapnoutHru.addEventListener("click", function () {
        let mod = "";

        switch (nazevModu)
        {
            case "CelaCR":
                mod = "celaCR";

                if (jeMobil())
                {
                    document.querySelector(".neni-CelaCR").textContent = "Pouze na PC!";
                    return;
                }
            break;

            case "KrajeCR":
                // ZÍSKÁNÍ KLIKNUTÉHO KRAJE
                const selectedPath = document.querySelector('.mapdiv path.selected');
                const kraj = selectedPath ? selectedPath.getAttribute('name') : null;
                sessionStorage.setItem("kraj", kraj);

                if (!kraj)
                {
                    document.querySelector(".neni-KrajeCR").textContent = "Nevybral jsi kraj!";
                    return;
                }
                else if (jeMobil())
                {
                    document.querySelector(".neni-KrajeCR").textContent = "Pouze na PC!";
                    return;
                }

                mod = "krajeCR";
            break;

            case "VlastniMisto":
                // SOUŘADNICE MÍSTA
                sessionStorage.setItem("souradniceMista", JSON.stringify(souradniceMista));

                if (!souradniceMista)
                {
                    document.querySelector(".neni-VlastniMisto").textContent = "Nevybral jsi místo!";
                    return;
                }
                else if (jeMobil())
                {
                    document.querySelector(".neni-VlastniMisto").textContent = "Pouze na PC!";
                    return;
                }

                mod = "vlastniMisto";
            break;

            case "SpecifickaMista":
                // SPECIFICKÁ MÍSTA
                const specifickaMista = ziskejHodnotyCheckboxu("mistaSpecifickaMista");
                sessionStorage.setItem("specifickaMista", JSON.stringify(specifickaMista));

                if (!specifickaMista.some(prvek => prvek === true))
                {
                    document.querySelector(".neni-SpecifickaMista").textContent = "Nevybral jsi specifické místo!";
                    return;
                }
                else if (jeMobil())
                {
                    document.querySelector(".neni-SpecifickaMista").textContent = "Pouze na PC!";
                    return;
                }

                mod = "specifickaMista";
            break;

        }

        // OBTÍŽNOSTI
        const hodnotyObtiznosti = ziskejHodnotyCheckboxu(`obtiznosti${nazevModu}`);
        sessionStorage.setItem("hodnotyObtiznosti", JSON.stringify(hodnotyObtiznosti));

        // NÁPOVĚDY
        const hodnotyNapovedy = ziskejHodnotyCheckboxu(`napovedy${nazevModu}`);
        sessionStorage.setItem("hodnotyNapovedy", JSON.stringify(hodnotyNapovedy));

        // DRUH MAPY
        const selectedDruhMapy = getSelectedImageDruhMapy(`druhyMapy${nazevModu}`);
        sessionStorage.setItem("selectedDruhMapy", selectedDruhMapy);

        // HODNOTY SLIDERŮ
        const hodnotySlideru = getHodnotySlideru(`slidery${nazevModu}`);
        sessionStorage.setItem("hodnotySlideru", JSON.stringify(hodnotySlideru));


        // ZAPNUTÍ HRY
        sessionStorage.setItem("mod", mod);

        window.location.href = "hra.html";
    });
}

/* **************************************************************************************************************************************************************** */
/* SLIDERY */

// PŘÍSLUŠNÉ OTOČENÍ OBRÁZKU VE SLIDERU
function zobrazHodnotu(hodnota, slider)
{
    const progress = ((hodnota - slider.min) / (slider.max - slider.min)) * 100;
    slider.style.background = `linear-gradient(to right, var(--prvek) ${progress}%, var(--text) ${progress}%)`;

    const thumbRotate = ((hodnota - slider.min) / (slider.max - slider.min)) * 360;
    slider.style.setProperty("--thumb-rotate", `${thumbRotate}deg`);
}

// KONTROLUJE POHYB SLIDERŮ A ZOBRAZUJE JEJICH HODNOTY
function initSlider(slider, hodnotaSelector)
{
    // pomocí kurzoru myši
    slider.addEventListener('input', function() {
        const hodnota = this.value;
        zobrazHodnotu(hodnota, this);

        if (hodnotaSelector == ".cas-hodnota")
        {
            const minuty = Math.floor(hodnota / 60); // Celé minuty
            const formatovaneMinuty = minuty < 10 ? `0${minuty}` : minuty;
            const sekundy = hodnota % 60; // Zbývající sekundy
            const formatovaneSekundy = sekundy < 10 ? `0${sekundy}` : sekundy;
        
            if (minuty == 0 && sekundy == 0)
            {
                this.closest('.slidery').querySelector(hodnotaSelector).innerHTML = "&infin;";
            }
            else
            {
                this.closest('.slidery').querySelector(hodnotaSelector).textContent = formatovaneMinuty + ":" + formatovaneSekundy;
            }  
        }
        else if (hodnotaSelector == ".radius-hodnota")
        {
            this.closest('.slidery').querySelector(hodnotaSelector).textContent = hodnota + " km";
        }
        else if (hodnotaSelector == ".pocetKol-hodnota")
        {
            this.closest('.slidery').querySelector(hodnotaSelector).textContent = hodnota;
        }
    });

    // pomocí kolečka myši
    slider.addEventListener("wheel", function(event) {
        event.preventDefault();
        event.stopPropagation();

        const step = parseInt(slider.step);

        if (event.deltaY > 0)
        {
            // pohyb dolů
            slider.value -= step;
        }
        else
        {
            // pohyb nahoru
            slider.valueAsNumber += step;
        }

        slider.dispatchEvent(new Event("input"));
    });
}


// INICIALIZACE SLIDERŮ PRO VŠECHNY SLIDER TABULKY
function initSlidersForTable(tableName)
{
    const sliderTable = document.getElementById(`slidery${tableName}`);

    initSlider(sliderTable.querySelector('.pocetKol-slider'), '.pocetKol-hodnota');
    initSlider(sliderTable.querySelector('.cas-slider'), '.cas-hodnota');

    if (tableName === "VlastniMisto")
    {
        initSlider(sliderTable.querySelector('.radius-slider'), '.radius-hodnota');
    }
}


// ZÍSKÁ HODNOTY SLIDERŮ V KONKRETNÍ TABULCE
function getHodnotySlideru(tableId)
{
    const table = document.getElementById(tableId);

    const pocetKol = table.querySelector(".pocetKol-slider").value;
    const cas = table.querySelector(".cas-slider").value;

    if (tableId === "slideryVlastniMisto")
    {
        const radius = table.querySelector(".radius-slider").value;
        var hodnotySlideru = [radius, pocetKol, cas];
    }
    else
    {
        var hodnotySlideru = [pocetKol, cas];
    } 

    return hodnotySlideru;
}

/* **************************************************************************************************************************************************************** */
/* INICIALIZACE PRO POPUP OKNO, BUTTON HERNÍ MÓD A SLIDERY */

// VŠECHNY HERNÍ MÓDY
const vsechnyMody = ["CelaCR", "KrajeCR", "VlastniMisto", "SpecifickaMista"];
vsechnyMody.forEach(mod => {
    setupPopup(mod);
    zapnoutHru(mod);
    initSlidersForTable(mod);
});

/* **************************************************************************************************************************************************************** */
/* SWITCHE */

// ZISKÁ HODNOTY CHECKBOXŮ V KONKRETNÍ TABULCE
function ziskejHodnotyCheckboxu(tabulkaId)
{
    const hodnotyCheckboxu = [];
    const tabulka = document.getElementById(tabulkaId);
    const checkboxy = tabulka.querySelectorAll('input[type="checkbox"]');
    
    checkboxy.forEach(function(checkbox) {
        hodnotyCheckboxu.push(checkbox.checked);
    });
  
    return hodnotyCheckboxu;
}


// VŠECHNY SWITCHE V MÓDU SPECIFICKÁ MÍSTA V ČR
const checkmarks = document.querySelectorAll("#mistaSpecifickaMista .misto .checkmark");
checkmarks.forEach(checkmark => {
    const checkbox = checkmark.previousElementSibling;

    checkmark.addEventListener("click", function() {
        checkbox.checked = !checkbox.checked;
    });
});

/* **************************************************************************************************************************************************************** */
/* DRUHY MAPY */

// OZNAČÍ ZVOLENÝ DRUH MAPY
function selectImage(clickedImage)
{
    // Získání odkazu na nadřazený prvek tabulky (tr)
    let tableRow = clickedImage.closest("tr");
  
    // Získání pole všech obrázků v rámci daného řádku tabulky
    let images = tableRow.querySelectorAll(".image-selector");
  
    // Odebrání třídy "selected" ze všech obrázků v rámci tabulky
    images.forEach((image) => {
        image.classList.remove("selected");
    });
  
    // Přidání třídy "selected" pouze kliknutému obrázku
    clickedImage.classList.add("selected");
  
    let dataDruhMapy = clickedImage.getAttribute("data-druhMapy");
    console.log("Byla vybrána mapa: " + dataDruhMapy);
}

// ZÍSKÁ ZVOLENÝ DRUH MAPY
function getSelectedImageDruhMapy(tableId)
{
    // Získání tabulky pomocí ID
    const table = document.getElementById(tableId);
  
    // Vyhledání označeného obrázku ve specifické tabulce
    const selectedImage = table.querySelector(".image-selector.selected");
  
    // Získání hodnoty data-druhMapy z označeného obrázku
    const druhMapy = selectedImage.getAttribute('data-druhMapy');
  
    // Návrat hodnoty data-druhMapy
    return druhMapy;
}

/* **************************************************************************************************************************************************************** */
/* KRAJ */

// MAPA SVG
document.querySelectorAll('.mapdiv path').forEach(function(path) {
    path.addEventListener('click', function() {
        document.querySelectorAll('.mapdiv path').forEach(function(p) {
            p.classList.remove('selected');
        });
        this.classList.add('selected');

        var selectedValue = this.getAttribute('name');

        var nazevKraje = document.querySelector('.kraj');
        if (selectedValue === "Praha")
        {
            nazevKraje.textContent = "Hlavní město " + selectedValue;
        }
        else if (selectedValue === "Vysočina")
        {
            nazevKraje.textContent = "Kraj " + selectedValue;
        }
        else
        {
            nazevKraje.textContent = selectedValue + " kraj";
        }

        document.querySelector(".neni-KrajeCR").textContent = "";
    });
});

/* **************************************************************************************************************************************************************** */
