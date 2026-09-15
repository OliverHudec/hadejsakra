const formular = document.querySelector(".formular");

// Zvyšování textového pole v kontaktním formuláři podle napsaných řádků v obsahu pole
const textArea = formular.querySelector("textarea");

textArea.addEventListener("input", () => {
    textArea.style.minHeight = "auto";
    textArea.style.minHeight = `${textArea.scrollHeight + 2}px`;

    if (textArea.scrollHeight < 179)
    {
        textArea.style.minHeight = "180px";
    }
});


formular.addEventListener("submit", function (e) {
    e.preventDefault();

    formular.querySelector("#access_key").value = "23c8972c-0a35-485d-a6b8-2fb595db4fb7";

    const hostname = window.location.hostname;
    formular.querySelector("#from_name").value = hostname;

    const formData = new FormData(formular);
    const object = Object.fromEntries(formData);
    const formDataJson = JSON.stringify(object);

    const vysledek = formular.querySelector(".formular-vysledek");
    vysledek.style.display = "flex";
    vysledek.textContent = "Čekej prosím ...";

    fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: formDataJson
    })
    .then(async (response) => {
        let json = await response.json();

        if (response.status == 200)
        {
            vysledek.textContent = "Díky! Tvoje zpráva byla úspěšně přijata.";
            vysledek.classList.add("uspech");
        }
        else
        {
            vysledek.innerHTML = "Při posílaní zprávy nastal nějaký problém.<br>" + json.message;
            vysledek.classList.add("neuspech");
        }
    })
    .catch((error) => {
        vysledek.textContent = "Chyba: " + error;
        vysledek.classList.add("neuspech");
    })
    .then(function () {
        formular.reset();
        textArea.style.minHeight = "180px";
        
        setTimeout(() => {
            vysledek.style.display = "none";
            vysledek.classList.remove("uspech", "neuspech");
        }, 5000);
    });
});
