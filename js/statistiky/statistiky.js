// NAČTENÍ POLE historieHer Z LOKÁLNÍHO ULOŽIŠTĚ
var historieHer = JSON.parse(localStorage.getItem("historieHer"));

if (historieHer === null)
{
    historieHer = [];
}

var historieHerKopie = historieHer.slice();

// POČET DOHRANÝCH HER
document.getElementById("dohranychHer").textContent = historieHerKopie.length;

// POČET ODEHRANÝCH KOL
var odehranychKol = 0;
historieHerKopie.forEach(hra => {
    odehranychKol += hra.pocetKol;
});
document.getElementById("odehranychKol").textContent = odehranychKol;

// CELKOVÉ ZÍSKANÉ SKÓRE
var celkemSkore = 0;
historieHerKopie.forEach(hra => {
    celkemSkore += hra.skore;
});

// PRŮMĚRNÉ SKÓRE KOLA
var prumerneSkoreKola = celkemSkore / odehranychKol;
if (Number.isNaN(prumerneSkoreKola))
{
    prumerneSkoreKola = 0;
}
document.getElementById("prumerneSkoreKola").textContent = prumerneSkoreKola.toFixed(1);

// MAXIMÁLNÍ MOŽNÉ SKÓRE
var maxSkore = odehranychKol * 100;

// ZÍSKANÉ SKÓRE/MAXIMÁLNÍ MOŽNÉ SKÓRE
document.getElementById("pomerSkore").textContent = celkemSkore + "/" + maxSkore;

// POČET PERFEKTNÍCH HER
var perfektnichHer = 0;
historieHerKopie.forEach(hra => {
    if (hra.skore === hra.pocetKol * 100)
    {
        perfektnichHer++;
    }
});
document.getElementById("perfektnichHer").textContent = perfektnichHer;

// POČET PERFEKTNÍCH KOL
var perfektnichKol = 0;
historieHerKopie.forEach(hra => {
    perfektnichKol += hra.perfektnichKol;
});
document.getElementById("perfektnichKol").textContent = perfektnichKol;

// POČET POUŽITÝCH NÁPOVĚD VE HŘE (NEPOČÍTÁ SE NÁPOVĚDA OBLAST)
var pouzitoNapoved = 0;
historieHerKopie.forEach(hra => {
    pouzitoNapoved += hra.pouzitoNapoved;
});
document.getElementById("pouzitoNapoved").textContent = pouzitoNapoved;

// NAPOSLEDY HRÁNO HERNÍ KOLO
var naposledyHrano = "NIKDY";
if (historieHerKopie.length !== 0)
{
    historieHerKopie.sort((a, b) => new Date(b.datum) - new Date(a.datum));

    var datum = new Date(historieHerKopie[0].datum);
    naposledyHrano = datum.toLocaleString("cs-CZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
}
document.getElementById("naposledyHrano").textContent = naposledyHrano;

// POČET DNEŠNÍCH HRÁČŮ
// dnešní datum
const today = new Date();
let year = today.getFullYear();
let month = (today.getMonth() + 1).toString().padStart(2, '0');
let day = today.getDate().toString().padStart(2, '0');
const formattedDateStart = `${year}-${month}-${day}`;

// zítřejší datum
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);
year = tomorrow.getFullYear();
month = (tomorrow.getMonth() + 1).toString().padStart(2, '0');
day = tomorrow.getDate().toString().padStart(2, '0');
const formattedDateEnd = `${year}-${month}-${day}`;

const dnesHralo = document.getElementById("dnesHralo");

var r = new XMLHttpRequest();
r.addEventListener('load', function() {
    if (this.status === 200)
    {
        const response = JSON.parse(this.responseText);
        dnesHralo.textContent = response.count || 0;
    }
    else
    {
        dnesHralo.textContent = 0;
    }
});
r.addEventListener('error', function() {
    dnesHralo.textContent = 0;
});
r.open('GET', `https://stats.hadejkde.cz/counter//hra.json?start=${formattedDateStart}&end=${formattedDateEnd}`);
r.send();
