// STAŽENÍ SOUBORU
function downloadFile(content, filename)
{
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// KLIKNUTÍ NA EXPORT
const exportStatistik = document.getElementById("export");
exportStatistik.addEventListener("click", () => {
    // Převedení dat na JSON řetězec
    const jsonData = JSON.stringify(historieHer);

    // Nastavení jména souboru
    const now = new Date();
    const rok = now.getFullYear();
    const mesic = (now.getMonth() + 1).toString().padStart(2, "0");
    const den = now.getDate().toString().padStart(2, "0");
    const hodiny = now.getHours().toString().padStart(2, "0");
    const minuty = now.getMinutes().toString().padStart(2, "0");
    const vteriny = now.getSeconds().toString().padStart(2, "0");
    const formatovaneDatumACas = `${rok}-${mesic}-${den}_${hodiny}-${minuty}-${vteriny}`;

    const filename = "save_" + formatovaneDatumACas + ".hadejkdesave";

    // Stažení souboru do PC
    downloadFile(jsonData, filename);
});


// NAČTENÍ VYBRANÉHO SOUBORU
const fileInput = document.getElementById("fileInput");
fileInput.addEventListener("change", (event) => {
    const selectedFile = event.target.files[0];

    const fileReader = new FileReader();
    fileReader.onload = function (event) {
        const obsahSouboru = event.target.result;

        try {
            // Pokusíme se analyzovat obsah souboru jako JSON
            const parsedData = JSON.parse(obsahSouboru);
        
            // Zkontrolujeme, jestli 'parsedData' je pole (array)
            if (!Array.isArray(parsedData))
            {
                throw new Error("Neplatný formát souboru. Data by měla být pole (array).");
            }
        
            // Provedeme další ověření pro každý objekt v poli, pokud je to potřeba
            for (const item of parsedData)
            {
                if (typeof item !== "object" || item === null)
                {
                    throw new Error("Neplatný formát souboru. Každý prvek v poli by měl být objektem.");
                }
        
                // Zkontrolujeme, jestli objekt obsahuje požadované vlastnosti
                const requiredProperties = ["datum", "herniMod", "pocetKol", "casovyLimit", "obtiznosti", "pouzitoNapoved", "druhMapy", "skore", "perfektnichKol"];
                for (const prop of requiredProperties)
                {
                    if (!item.hasOwnProperty(prop))
                    {
                        throw new Error(`Neplatný formát souboru. Chybí vlastnost: ${prop}.`);
                    }
                }
            }
        
            // Pokud se dostaneme až sem, znamená to, že formát je platný
        
            // Uložíme obsah souboru do localStorage
            localStorage.setItem("historieHer", obsahSouboru);
        
            // Po úspěšném uložení do localStorage se stránka načte znovu
            location.reload();
        }
        catch (error)
        {
            console.error("Chyba při zpracování souboru:", error.message);
            // Zpracujeme chybu (např. zobrazíme uživateli chybovou zprávu)
        }
    };
    fileReader.readAsText(selectedFile);
});

// KLIKNUTÍ NA IMPORT
const importStatistik = document.getElementById("import");
importStatistik.addEventListener("click", () => {
    fileInput.click();
});
