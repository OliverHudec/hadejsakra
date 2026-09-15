// VYGENEROVÁNÍ NÁHODNÉ SOUŘADNICE UVNITŘ KRUHU
function vygenerujSouradnici()
{
    do
    {
        var kruh = L.circle(souradniceMista, {radius: radius});
        kruh.addTo(map);
        var bounds = kruh.getBounds();
        kruh.removeFrom(map);
        
        var lat = Math.random() * (bounds.getNorth() - bounds.getSouth()) + bounds.getSouth();
        var lng = Math.random() * (bounds.getEast() - bounds.getWest()) + bounds.getWest();
        
        var vygenerovanaSouradnice = L.latLng(lat, lng);
    }
    while(radius < souradniceMista.distanceTo(vygenerovanaSouradnice)); // generuje souřadnici, dokud nebude uvnitř polygonu

    // souřadnice je uvnitř polygonu
    console.log("VYGENEROVANÁ SOUŘADNICE: " + vygenerovanaSouradnice);
    return vygenerovanaSouradnice;
}


// ZKONTROLUJE, ZDALI JE SOUŘADNICE PANORAMA UVNITŘ POLYGONU
function kontrolaSouradnice(souradnice)
{
    if (radius >= souradniceMista.distanceTo(souradnice)) // pokud je souřadnice panorama uvnitř polygonu
    {
        return true;
    }
    else
    {
        return false;
    }
}
