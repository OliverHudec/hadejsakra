// NASTAVENÍ AKTUÁLNÍHO ROKU VE FOOTERU
const aktualniDatum = new Date();
const aktualniRok = aktualniDatum.getFullYear();

if (aktualniRok > 2023)
{
    document.getElementById("aktualni-rok").textContent = "- " + aktualniRok + " ";
}
