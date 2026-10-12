(function() {
    const dialog = document.getElementById("multiplayerDialog");
    const status = document.getElementById("multiplayerStatus");
    const code = document.getElementById("multiplayerCode");
    const createButton = document.getElementById("multiplayerCreate");
    const joinButton = document.getElementById("multiplayerJoin");
    const answerButton = document.getElementById("multiplayerAnswer");
    const copyButton = document.getElementById("multiplayerCopy");
    const openButton = document.getElementById("multiplayerOpen");

    let connection;
    let channel;
    let role;
    let messageHandler = () => {};
    let hasRemoteLocation = false;
    const opponentScore = document.getElementById("multiplayerOpponentScore");

    function gameSettings() {
        return {
            mode: mod,
            rounds: pocetKol,
            time: cas,
            map: druhMapy,
            difficulty: hodnotyObtiznosti,
            hints: hodnotyNapovedy,
            radius,
            region: kraj,
            place: souradniceMista ? [souradniceMista.lat, souradniceMista.lng] : null,
            selectedPlaces: specifickaMista
        };
    }

    function setStatus(message) {
        status.textContent = message;
    }

    function waitForIceGathering() {
        if (connection.iceGatheringState === "complete") {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                connection.removeEventListener("icegatheringstatechange", onStateChange);
                reject(new Error("Přímé spojení se nepodařilo připravit. Zkus to znovu."));
            }, 20000);

            function onStateChange() {
                if (connection.iceGatheringState === "complete") {
                    clearTimeout(timeout);
                    connection.removeEventListener("icegatheringstatechange", onStateChange);
                    resolve();
                }
            }

            connection.addEventListener("icegatheringstatechange", onStateChange);
        });
    }

    function createConnection() {
        if (!window.RTCPeerConnection) {
            throw new Error("Tento prohlížeč nepodporuje přímé spojení WebRTC.");
        }

        closeConnection();
        connection = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
        });

        connection.addEventListener("connectionstatechange", () => {
            if (connection.connectionState === "failed") {
                setStatus("Přímé spojení selhalo. Zkuste to prosím znovu.");
            } else if (connection.connectionState === "disconnected") {
                setStatus("Spojení bylo přerušeno.");
            }
        });

        connection.addEventListener("datachannel", event => {
            channel = event.channel;
            configureChannel();
        });
    }

    function configureChannel() {
        channel.addEventListener("open", () => {
            setStatus("Hráči jsou propojeni. Čeká se na společné kolo.");
            opponentScore.hidden = false;
            opponentScore.textContent = "SOUPEŘ: PŘIPOJEN";
            multiplayer.send("hello", { role, settings: gameSettings() });
            if (role === "host" && Number.isFinite(souradnicePanorama?.lat)) {
                multiplayer.publishLocation(souradnicePanorama, aktualniKolo);
            }
        });

        channel.addEventListener("close", () => {
            setStatus("Spojení bylo ukončeno.");
            opponentScore.hidden = true;
        });
        channel.addEventListener("message", event => {
            try {
                const message = JSON.parse(event.data);
                if (message.type === "hello") {
                    if (JSON.stringify(message.payload.settings) !== JSON.stringify(gameSettings())) {
                        setStatus("Nastavení hráčů se liší. Pro správné skóre spusťte stejný mód a nastavení.");
                    }
                } else if (message.type === "location" && role === "guest") {
                    hasRemoteLocation = true;
                    window.dispatchEvent(new CustomEvent("multiplayerlocation", { detail: message.payload }));
                } else if (message.type === "guess") {
                    opponentScore.textContent = `SOUPEŘ: ${message.payload.total}`;
                    opponentScore.title = `Kolo ${message.payload.round}: ${message.payload.score} bodů`;
                }
                messageHandler(message);
            } catch (error) {
                console.error("Neplatná zpráva multiplayeru", error);
            }
        });
    }

    function parseCode() {
        try {
            const description = JSON.parse(code.value);
            if (!description || !["offer", "answer"].includes(description.type) || typeof description.sdp !== "string") {
                throw new Error();
            }
            return description;
        } catch {
            throw new Error("Vložený kód místnosti není platný.");
        }
    }

    async function createOffer() {
        try {
            role = "host";
            createConnection();
            channel = connection.createDataChannel("hadejsakra");
            configureChannel();
            const offer = await connection.createOffer();
            await connection.setLocalDescription(offer);
            setStatus("Připravuji pozvánku…");
            await waitForIceGathering();
            code.value = JSON.stringify(connection.localDescription);
            setStatus("Pošli pozvánku soupeři. Jeho odpověď vlož sem a potvrď.");
        } catch (error) {
            setStatus(error.message);
        }
    }

    async function createAnswer() {
        try {
            role = "guest";
            const offer = parseCode();
            if (offer.type !== "offer") {
                throw new Error("Vlož pozvánku vytvořenou hostitelem.");
            }
            createConnection();
            await connection.setRemoteDescription(offer);
            const answer = await connection.createAnswer();
            await connection.setLocalDescription(answer);
            setStatus("Připravuji odpověď…");
            await waitForIceGathering();
            code.value = JSON.stringify(connection.localDescription);
            setStatus("Pošli tuto odpověď hostiteli a nech stránku otevřenou.");
        } catch (error) {
            setStatus(error.message);
        }
    }

    async function acceptAnswer() {
        try {
            if (!connection || role !== "host") {
                throw new Error("Nejprve vytvoř pozvánku jako hostitel.");
            }
            const answer = parseCode();
            if (answer.type !== "answer") {
                throw new Error("Vlož odpověď vytvořenou soupeřem.");
            }
            await connection.setRemoteDescription(answer);
            setStatus("Připojuji soupeře…");
        } catch (error) {
            setStatus(error.message);
        }
    }

    function closeConnection() {
        if (channel) {
            channel.close();
        }
        if (connection) {
            connection.close();
        }
        channel = null;
        connection = null;
        hasRemoteLocation = false;
    }

    const multiplayer = {
        get role() {
            return role;
        },
        get connected() {
            return channel?.readyState === "open";
        },
        get hasRemoteLocation() {
            return hasRemoteLocation;
        },
        onMessage(handler) {
            messageHandler = handler;
        },
        send(type, payload) {
            if (channel?.readyState === "open") {
                channel.send(JSON.stringify({ type, payload }));
            }
        },
        publishLocation(location, round) {
            if (role === "host") {
                multiplayer.send("location", { lat: location.lat, lng: location.lng, round });
            }
        },
        publishGuess(score, total, round) {
            multiplayer.send("guess", { score, total, round });
        },
        close: closeConnection
    };

    window.multiplayer = multiplayer;
    openButton.addEventListener("click", () => dialog.showModal());
    createButton.addEventListener("click", createOffer);
    joinButton.addEventListener("click", createAnswer);
    answerButton.addEventListener("click", acceptAnswer);
    copyButton.addEventListener("click", async () => {
        try {
            await navigator.clipboard.writeText(code.value);
            setStatus("Kód byl zkopírován.");
        } catch {
            code.focus();
            code.select();
            setStatus("Kód označen. Zkopíruj ho klávesami Ctrl+C.");
        }
    });
    document.getElementById("multiplayerClose").addEventListener("click", () => dialog.close());
})();