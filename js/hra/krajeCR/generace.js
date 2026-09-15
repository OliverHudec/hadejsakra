// VYGENEROVÁNÍ NÁHODNÉ SOUŘADNICE V ROZMEZÍ OBDÉLNÍKU HRANIC KRAJE ČR
function vygenerujSouradnici()
{
    do
    {
        var bounds = L.polygon(hranice).getBounds();
        var lat = Math.random() * (bounds.getNorth() - bounds.getSouth()) + bounds.getSouth();
        var lng = Math.random() * (bounds.getEast() - bounds.getWest()) + bounds.getWest();
        
        var vygenerovanaSouradnice = L.latLng(lat, lng);
    }
    while(!L.polygon(hranice).contains(vygenerovanaSouradnice)); // generuje souřadnici, dokud nebude uvnitř polygonu

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
