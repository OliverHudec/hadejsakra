// VYTVOŘENÍ OBLASTI/HRANICE A NÁSLEDNÉ ZAROVNÁNÍ A ZOOM MAPY PODLE OBLASTI
var stredPolygonu;
var oblastBounds;
var hranice = [];
var oblastPolygonuLayer = L.layerGroup().addTo(map);    // vrstva oblasti polygonu/kruhu
function vytvorOblastAZarovnejMapu()
{
    // NASTAVENÍ PRO POLYGON/KRUH OBLAST
    var oblastOptions = {
        fillColor: "#2951b8",
        fillOpacity: 0.2,
        color: 'blue',
        opacity: 0.8,
        weight: 2,
        interactive: false,
        smoothFactor: 1,

        radius: radius
    };


    switch (mod)
    {
        case 'celaCR':
            hranice = CzechRepublic;
        break;

        case 'krajeCR':
            switch (kraj)
            {
                case 'Praha': hranice = HlavniMestoPraha; break;
                case 'Jihočeský': hranice = Jihocesky; break;
                case 'Jihomoravský': hranice = Jihomoravsky; break;
                case 'Karlovarský': hranice = Karlovarsky; break;
                case 'Královéhradecký': hranice = Kralovehradecky; break;
                case 'Liberecký': hranice = Liberecky; break;
                case 'Moravskoslezský': hranice = Moravskoslezsky; break;
                case 'Olomoucký': hranice = Olomoucky; break;
                case 'Pardubický': hranice = Pardubicky; break;
                case 'Plzeňský': hranice = Plzensky; break;
                case 'Středočeský': hranice = Stredocesky; break;
                case 'Ústecký': hranice = Ustecky; break;
                case 'Vysočina': hranice = Vysocina; break;
                case 'Zlínský': hranice = Zlinsky; break;
            }
        break;

        case 'vlastniMisto':
            // NIC
        break;

        case 'specifickaMista':
            hranice = CzechRepublic;
        break;

    }

    if (mod === "vlastniMisto")
    {
        // VYTVOŘENÍ KRUHU OBLAST
        var oblast = L.circle(souradniceMista, oblastOptions);
    }
    else
    {
        // VYTVOŘENÍ POLYGONU OBLAST
        var oblast = L.polygon(hranice, oblastOptions);
    }


    // POVOLENA NÁPOVĚDA - VZDÁLENOST
    if (hodnotyNapovedy[0])
    {
        vzdalenostHelp.style.display = "flex";
    }

    // POVOLENA NÁPOVĚDA - SMĚR
    if (hodnotyNapovedy[1])
    {
        smerHelp.style.display = "flex";
    }

    // POVOLENA NÁPOVĚDA - KRUH
    if (hodnotyNapovedy[2])
    {
        kruhHelp.style.display = "flex";
    }

    // POVOLENA NÁPOVĚDA - OBLAST
    if (hodnotyNapovedy[3])
    {
        oblastPolygonuLayer.addLayer(oblast); // zobrazí polygon/kruh oblast
    }


    // VYCENTROVÁNÍ MAPY PODLE HÁDACÍHO POLYGONU/KRUHU
    if (mod === "vlastniMisto")
    {
        var oblastCenter = L.circle(souradniceMista, oblastOptions);
        oblastCenter.addTo(map);
        oblastBounds = oblastCenter.getBounds();
        oblastCenter.removeFrom(map);
    }
    else
    {
        oblastBounds = oblast.getBounds();
    }

    map.fitBounds(oblastBounds, {animate: false});

    stredPolygonu = map.getCenter();
    console.log(stredPolygonu);
}
