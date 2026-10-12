(function() {
    const dialog = document.getElementById("homeMultiplayerDialog");
    const openButton = document.getElementById("homeMultiplayerJoinOpen");
    const closeButton = document.getElementById("homeMultiplayerClose");
    const codeInput = document.getElementById("homeMultiplayerCode");
    const joinButton = document.getElementById("homeMultiplayerJoin");
    const status = document.getElementById("homeMultiplayerStatus");

    openButton.addEventListener("click", () => dialog.showModal());
    closeButton.addEventListener("click", () => dialog.close());
    codeInput.addEventListener("input", () => {
        codeInput.value = codeInput.value.toUpperCase().replace(/[^A-HJ-NP-Z2-9]/g, "").slice(0, 6);
    });
    codeInput.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            event.preventDefault();
            joinButton.click();
        }
    });
    joinButton.addEventListener("click", () => {
        const roomCode = codeInput.value.trim().toUpperCase();
        if (!/^[A-HJ-NP-Z2-9]{6}$/.test(roomCode)) {
            status.textContent = "Zadej šestimístný kód místnosti.";
            codeInput.focus();
            return;
        }

        sessionStorage.setItem("multiplayerRole", "guest");
        sessionStorage.setItem("multiplayerRoomCode", roomCode);
        sessionStorage.removeItem("mod");
        window.location.href = "hra.html";
    });
})();
