// ČASOVÝ LIMIT HERNÍHO KOLA
var casomira = document.getElementById("casomira");
var casovac;
function spustitCas(pocatecniCas)
{
    let zbyleSekundy = pocatecniCas;

    clearInterval(casovac);
    document.querySelector(".cas").classList.remove("blinking");

    casovac = setInterval(function() {
        if (zbyleSekundy <= 10)
        {
            // blikání pozadí časomíry
            document.querySelector(".cas").classList.add("blinking");
        }

        if (zbyleSekundy === 10)
        {
            // 1 blik přes celou stránku
            document.getElementById("cerveneOkraje").classList.add("blik");

            setTimeout(function() {
                document.getElementById("cerveneOkraje").classList.remove("blik");
            }, 1500);
        }

        if (zbyleSekundy <= 0)
        {
            clearInterval(casovac);
            casomira.innerText = "ČAS: 00:00";

            // blikání pozadí časomíry
            document.querySelector(".cas").classList.remove("blinking");

            // POKUD BYL OZNAČEN ODHAD BOD
            if (primkaBodyLayer.getLayers().length > 0)
            {
                // klikne se na tlačítko POTVRDIT
                btnPotvrdit.dispatchEvent(new Event("click"));
            }
            else
            {
                // Z NORMÁLNÍ MAPKY NA VÝSLEDKOVOU MAPU
                vysledek = true;

                // ZMĚNA CSS PRO MAPU
                cssNormalniMapkaNaVysledkovou();

                // ZMĚNA CSS PRO NÁPOVĚDY - SKRYJE TLAČÍTKA NÁPOVĚD
                cssSkryjTlacitkaNapoved();

                // SKRYJE OUTLINE KOLEM MAPY
                mapa.classList.remove("selected");

                // ZASTAVENÍ ČASOVAČE A BLIKÁNÍ POZADÍ
                clearInterval(casovac);
                document.querySelector(".cas").classList.remove("blinking");


                // NASTAVENÍ PRO PANORAMA MARKER
                // https://mapy.cz/?pid=57637542&newest=1&fov=1.571&x=17.5239328&y=49.2079562&z=16
                var odkaz = "https://mapy.cz/?pid=" + pid + "&newest=1&fov=1.571&x=" + souradnicePanorama.lng + "&y=" + souradnicePanorama.lat + "&z=16";

                var panoramaMarkerOptions = {
                    icon: L.divIcon({
                        iconSize: [22, 31],
                        iconAnchor: [11, 31],
                        html: `<a href="${odkaz}" target="_blank"><img src="img/body/panorama-marker.png"></a>`,
                        className: "panoramaBod"
                    }),
                    opacity: 1,
                    interactive: true
                };

                // ZOBRAZENÍ PANORAMA BODU
                var panoramaMarker = L.marker(souradnicePanorama, panoramaMarkerOptions);
                primkaBodyLayer.addLayer(panoramaMarker);
                vsechnyPrimkyBodyLayer.addLayer(panoramaMarker);

                // ZOBRAZENÍ OBDÉLNÍKU S NULOVÝM SKÓREM
                neniOdhadBod.style.display = "block";

                // VYCENTROVÁNÍ MAPY PODLE PANORAMA BODU
                setTimeout(() => {
                    map.fitBounds(primkaBodyLayer.getBounds().pad(0.1), {animate: false}); // zvětší hranice boundu o 10%
                }, 300);


                // PŘEHRÁNÍ ZVUKU
                if (zvukoveEfekty === true)
                {
                    var SadTrombone = new Audio("zvuk/Sad Trombone.wav");
                    SadTrombone.play();
                }

                
                // KONTROLA POSLEDNÍHO KOLA
                if (aktualniKolo >= pocetKol)
                {
                    konec = true;

                    // ZMĚNA CSS PRO TLAČÍTKO POD MAPOU
                    btnPotvrdit.textContent = "ZOBRAZ VÝSLEDKY";
                }
            }
        }
        else
        {
            const minuty = Math.floor(zbyleSekundy / 60); // celé minuty
            const sekundy = zbyleSekundy % 60; // zbývající sekundy

            casomira.innerText = `ČAS: ${minuty.toString().padStart(2, '0')}:${sekundy.toString().padStart(2, '0')}`;
            zbyleSekundy--;
        }
    }, 1000); // odpočítávadlo se aktualizuje každou sekundu
}
