// VYGENEROVÁNÍ NÁHODNÉ SOUŘADNICE Z POLE VYBRANÝCH MÍST
function vygenerujSouradnici()
{
    // NAČTENÍ PŘÍSLUŠNÉHO SCRIPTU PODLE VYBRANÝCH SPECIFICKÝCH MÍST
    var vsechnaSpeficickaMista = [];
    for (let index = 0; index < specifickaMista.length; index++)
    {
        if (specifickaMista[index] === true)
        {
            vsechnaSpeficickaMista = vsechnaSpeficickaMista.concat(window[vsechnaMista[index]]);
        }
    }

    // náhodný prvek v poli
    var nahodnyIndex = Math.floor(Math.random() * vsechnaSpeficickaMista.length);
    var lng = vsechnaSpeficickaMista[nahodnyIndex].lng;
    var lat = vsechnaSpeficickaMista[nahodnyIndex].lat;

    console.log(vsechnaSpeficickaMista[nahodnyIndex]);

    var vygenerovanaSouradnice = L.latLng(lat, lng);

    // souřadnice je uvnitř polygonu
    console.log("VYGENEROVANÁ SOUŘADNICE: " + vygenerovanaSouradnice);
    return vygenerovanaSouradnice;
}


// ZKONTROLUJE, ZDALI JE SOUŘADNICE PANORAMA UVNITŘ POLYGONU
function kontrolaSouradnice(souradnice)
{
    if (L.polygon(hranice).contains(souradnice)) // pokud je souřadnice panorama uvnitř polygonu
    {
        return true;
    }
    else
    {
        return false;
    }
}
