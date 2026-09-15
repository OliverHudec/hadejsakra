// NAŠEPTÁVAČ VE VYHLEDÁVAČI MÍST ČR
const API_KEY = window.MAPY_SITE_API_KEY;
const inputElem = document.getElementById("vyhledavacMista");
const resultsContainer = document.getElementById("vyhledavacMistaVysledky");

var souradniceMista;
let timeoutNaseptavac;
async function handleInputWithDelay()
{
    clearTimeout(timeoutNaseptavac);

    timeoutNaseptavac = setTimeout(async () => {
        const query = inputElem.value.trim();

        if (query.length > 1)
        {
            try
            {
                const type = "regional.municipality_part,regional.municipality";
                const fetchData = await fetch(`https://api.mapy.com/v1/suggest?lang=cs&limit=3&type=${type}&locality=cz&apikey=${API_KEY}&query=${encodeURIComponent(query)}`);
                if (!fetchData.ok)
                {
                    throw new Error(`Mapy.com suggest API vrátilo HTTP ${fetchData.status}`);
                }
                const jsonData = await fetchData.json();

                resultsContainer.innerHTML = '';
                jsonData.items.forEach(item => {
                    const resultItem = document.createElement("li");

                    const name = document.createElement("span");
                    name.textContent = item.name;
                    name.style = "display: block; overflow: hidden; font-weight: bold; font-size: 14px; line-height: 18px; word-break: break-word;";

                    const label = document.createElement("span");
                    label.textContent = item.label + ", " + item.location;
                    label.style = "display: block; overflow: hidden; font-size: 12px; line-height: 16px;";

                    resultItem.append(name, label);

                    // Handle selection
                    resultItem.addEventListener("click", () => {
                        inputElem.value = item.name;
                        resultsContainer.style.display = "none";

                        souradniceMista = L.latLng(item.position.lat, item.position.lon);
                        zobrazKruh();
                        document.querySelector(".neni-VlastniMisto").textContent = "";
                    });

                    resultsContainer.appendChild(resultItem);
                });

                // Check if there are results before adding the logo
                if (jsonData.items.length > 0)
                {
                    const logoMapy = document.createElement("div");
                    logoMapy.style = "padding: 5px; display: flex; align-items: center; justify-content: flex-end; gap: 5px; font-size: 12px;";

                    const text = document.createElement("span");
                    text.textContent = "Hledají";

                    const odkaz = document.createElement("a");
                    odkaz.style = "display: flex;"
                    odkaz.href = "https://mapy.cz/";
                    odkaz.target = "_blank";

                    const img = new Image();
                    img.src = "https://api.mapy.com/img/api/logo.svg";
                    img.style = "width: 60px";

                    odkaz.appendChild(img);

                    logoMapy.append(text, odkaz);
                    resultsContainer.appendChild(logoMapy);
                }
            }
            catch (exc)
            {
                console.error(exc);
                resultsContainer.innerHTML = '<li>Návrhy míst nejsou momentálně dostupné.</li>';
            }
        }
        else
        {
            resultsContainer.innerHTML = '';
        }


        if (resultsContainer.innerHTML)
        {
            resultsContainer.style.display = "block";
        }
        else
        {
            resultsContainer.style.display = "none";
        }
    }, 500); // čeká 500 ms před provedením zpracování vstupu
}

// události pro zpracování vstupu
inputElem.addEventListener("input", handleInputWithDelay);

// událost, která se spustí při fokusu na inputu
inputElem.addEventListener("focus", function () {
    if (resultsContainer.innerHTML)
    {
        resultsContainer.style.display = "block";
    }
});

// událost, která se spustí při ztrátě fokusu na inputu
inputElem.addEventListener("blur", function () {
    setTimeout(function () {
        resultsContainer.style.display = "none";
    }, 200);
});
