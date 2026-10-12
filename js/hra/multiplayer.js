(function() {
    const dialog = document.getElementById("multiplayerDialog");
    const status = document.getElementById("multiplayerStatus");
    const code = document.getElementById("multiplayerCode");
    const createButton = document.getElementById("multiplayerCreate");
    const joinButton = document.getElementById("multiplayerJoin");
    const soloButton = document.getElementById("multiplayerSolo");
    const startButton = document.getElementById("multiplayerStart");
    const copyButton = document.getElementById("multiplayerCopy");
    const openButton = document.getElementById("multiplayerOpen");
    const roomInvite = document.getElementById("multiplayerRoomInvite");
    const roomCodeOutput = document.getElementById("multiplayerRoomCode");
    const disconnectButton = document.getElementById("multiplayerDisconnect");
    const opponentScore = document.getElementById("multiplayerOpponentScore");
    const roomAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let peer;
    let channel;
    let role = ["host", "guest"].includes(sessionStorage.getItem("multiplayerRole"))
        ? sessionStorage.getItem("multiplayerRole")
        : null;
    let messageHandler = () => {};
    let hasRemoteLocation = false;
    let connectionTimeout;
    let startResolver;
    let started = false;
    let settingsMatch = false;
    let remoteReadyRound = 0;
    const localGuesses = new Map();
    const remoteGuesses = new Map();

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
            selectedPlaces: specifickaMista || null,
            transitStops: zastavkyMHD || null
        };
    }

    function isValidGameSettings(settings) {
        const validShape = settings &&
            ["celaCR", "krajeCR", "vlastniMisto", "specifickaMista"].includes(settings.mode) &&
            Number.isInteger(settings.rounds) && settings.rounds >= 1 && settings.rounds <= 20 &&
            Number.isFinite(settings.time) && settings.time >= 0 &&
            ["zakladni", "turisticka", "letecka"].includes(settings.map) &&
            Array.isArray(settings.difficulty) && settings.difficulty.length === 3 &&
            settings.difficulty.every(value => typeof value === "boolean") &&
            Array.isArray(settings.hints) && settings.hints.length === 4 &&
            settings.hints.every(value => typeof value === "boolean");
        if (!validShape) {
            return false;
        }
        if (settings.mode === "krajeCR") {
            return typeof settings.region === "string" && settings.region.length > 0;
        }
        if (settings.mode === "vlastniMisto") {
            return Array.isArray(settings.place) && settings.place.length === 2 &&
                settings.place.every(Number.isFinite) &&
                Number.isFinite(settings.radius) && settings.radius > 0;
        }
        if (settings.mode === "specifickaMista") {
            return Array.isArray(settings.selectedPlaces) && settings.selectedPlaces.length === 12 &&
                settings.selectedPlaces.every(value => typeof value === "boolean") &&
                Array.isArray(settings.transitStops) && settings.transitStops.length === 2 &&
                settings.transitStops.every(value => typeof value === "boolean");
        }
        return true;
    }

    function applyGameSettings(settings) {
        if (!isValidGameSettings(settings)) {
            setStatus("Hostitel poslal neplatné nastavení hry. Požádej ho o nový kód místnosti.");
            return false;
        }

        const sliderValues = settings.mode === "vlastniMisto"
            ? [String(settings.radius / 1000), String(settings.rounds), String(settings.time)]
            : [String(settings.rounds), String(settings.time)];
        sessionStorage.setItem("mod", settings.mode);
        sessionStorage.setItem("hodnotySlideru", JSON.stringify(sliderValues));
        sessionStorage.setItem("hodnotyObtiznosti", JSON.stringify(settings.difficulty));
        sessionStorage.setItem("hodnotyNapovedy", JSON.stringify(settings.hints));
        sessionStorage.setItem("selectedDruhMapy", settings.map);
        if (settings.mode === "krajeCR") {
            sessionStorage.setItem("kraj", settings.region);
        } else {
            sessionStorage.removeItem("kraj");
        }
        if (settings.mode === "vlastniMisto") {
            sessionStorage.setItem("souradniceMista", JSON.stringify({
                lat: settings.place[0],
                lng: settings.place[1]
            }));
        } else {
            sessionStorage.removeItem("souradniceMista");
        }
        if (settings.mode === "specifickaMista") {
            sessionStorage.setItem("specifickaMista", JSON.stringify(settings.selectedPlaces));
            sessionStorage.setItem("zastavkyMHD", JSON.stringify(settings.transitStops || [false, false]));
        } else {
            sessionStorage.removeItem("specifickaMista");
            sessionStorage.removeItem("zastavkyMHD");
        }
        sessionStorage.setItem("multiplayerRole", "guest");
        return true;
    }

    function setStatus(message) {
        status.textContent = message;
    }

    function generateRoomCode() {
        const bytes = new Uint8Array(6);
        crypto.getRandomValues(bytes);
        return Array.from(bytes, byte => roomAlphabet[byte % roomAlphabet.length]).join("");
    }

    function peerErrorMessage(error) {
        if (error?.type === "peer-unavailable") {
            return "Místnost s tímto kódem nebyla nalezena. Zkontroluj kód a zkus to znovu.";
        }
        if (["network", "server-error", "socket-error", "socket-closed"].includes(error?.type)) {
            return "Nelze se spojit se službou místností. Zkus to za chvíli znovu.";
        }
        return error?.message || "Spojení se nepodařilo navázat.";
    }

    function createPeer(id) {
        return new Promise((resolve, reject) => {
            if (typeof Peer !== "function") {
                reject(new Error("Nepodařilo se načíst službu místností. Obnov stránku a zkus to znovu."));
                return;
            }

            const candidate = new Peer(id, {
                host: "0.peerjs.com",
                port: 443,
                path: "/",
                secure: true
            });
            let opened = false;
            peer = candidate;
            const openTimeout = setTimeout(() => {
                if (!opened) {
                    const error = new Error("Služba místností neodpověděla. Zkus to za chvíli znovu.");
                    error.type = "network";
                    candidate.destroy();
                    if (peer === candidate) {
                        peer = null;
                    }
                    reject(error);
                }
            }, 12000);

            candidate.on("open", () => {
                opened = true;
                clearTimeout(openTimeout);
                resolve(candidate);
            });
            candidate.on("error", error => {
                if (!opened) {
                    clearTimeout(openTimeout);
                    reject(error);
                } else {
                    setStatus(peerErrorMessage(error));
                }
            });
            candidate.on("disconnected", () => {
                if (channel?.open) {
                    setStatus("Hra pokračuje, obnovuje se spojení se službou místností.");
                }
            });
        });
    }

    function receiveMessage(data) {
        try {
            const message = typeof data === "string" ? JSON.parse(data) : data;
            const payload = message.payload || {};

            if (message.type === "hello") {
                settingsMatch = JSON.stringify(payload.settings) === JSON.stringify(gameSettings());
                if (!settingsMatch && role === "guest") {
                    if (applyGameSettings(payload.settings)) {
                        setStatus("Přebírám nastavení hostitele…");
                        channel?.close();
                        window.location.reload();
                    }
                } else if (!settingsMatch) {
                    startButton.disabled = true;
                    setStatus("Soupeř přebírá nastavení hostitele…");
                } else if (role === "host") {
                    startButton.disabled = false;
                    setStatus("Oba hráči jsou připojeni a mají stejná nastavení. Můžeš spustit hru.");
                } else {
                    setStatus("Připojeno. Čeká se, až hostitel spustí hru.");
                }
            } else if (message.type === "start" && role === "guest") {
                if (!settingsMatch) {
                    setStatus("Hru nelze spustit, protože se nastavení hráčů liší.");
                    return;
                }
                startGame("guest");
            } else if (message.type === "location" && role === "guest") {
                hasRemoteLocation = true;
                window.dispatchEvent(new CustomEvent("multiplayerlocation", { detail: payload }));
            } else if (message.type === "guess") {
                remoteGuesses.set(payload.round, payload);
                opponentScore.textContent = `SOUPEŘ: ${payload.total}`;
                opponentScore.title = `Kolo ${payload.round}: ${payload.score} bodů`;
                window.dispatchEvent(new CustomEvent("multiplayerguess", { detail: payload }));
            } else if (message.type === "ready") {
                remoteReadyRound = payload.round;
                window.dispatchEvent(new CustomEvent("multiplayerready", { detail: payload }));
            }
            messageHandler(message);
        } catch (error) {
            console.error("Neplatná zpráva multiplayeru", error);
        }
    }

    function configureChannel(dataConnection) {
        if (channel?.open) {
            dataConnection.close();
            return;
        }

        channel = dataConnection;
        channel.on("open", () => {
            clearTimeout(connectionTimeout);
            opponentScore.hidden = false;
            opponentScore.textContent = "SOUPEŘ: PŘIPOJEN";
            multiplayer.send("hello", { role, settings: gameSettings() });
            window.dispatchEvent(new Event("multiplayerconnectionchange"));
            if (role === "guest") {
                setStatus("Připojeno. Čeká se na potvrzení nastavení a start hostitele.");
            }
        });
        channel.on("close", () => {
            clearTimeout(connectionTimeout);
            if (channel !== dataConnection) {
                return;
            }
            channel = null;
            settingsMatch = false;
            startButton.disabled = true;
            setStatus("Spojení bylo ukončeno.");
            opponentScore.hidden = true;
            window.dispatchEvent(new Event("multiplayerconnectionchange"));
        });
        channel.on("error", error => setStatus(peerErrorMessage(error)));
        channel.on("data", receiveMessage);
    }

    function startGame(mode) {
        if (started) {
            return;
        }
        if (mode === "solo") {
            closeConnection();
            role = null;
            sessionStorage.removeItem("multiplayerRole");
            sessionStorage.removeItem("multiplayerRoomCode");
        }
        started = true;
        dialog.close();
        soloButton.disabled = true;
        startButton.hidden = true;
        createButton.disabled = true;
        joinButton.disabled = true;
        if (mode === "host") {
            multiplayer.send("start", {});
        }
        if (startResolver) {
            startResolver(mode);
            startResolver = null;
        }
    }

    async function createRoom() {
        if (started) {
            setStatus("Místnost pro tuto hru musí být vytvořena před jejím spuštěním.");
            return;
        }
        closeConnection();
        role = "host";
        settingsMatch = false;
        createButton.disabled = true;
        startButton.hidden = false;
        startButton.disabled = true;
        roomInvite.hidden = true;
        setStatus("Vytvářím místnost…");

        try {
            for (let attempt = 0; attempt < 8; attempt++) {
                const previousRoomCode = sessionStorage.getItem("multiplayerRoomCode");
                const roomCode = attempt === 0 && previousRoomCode
                    ? previousRoomCode
                    : generateRoomCode();
                try {
                    await createPeer(roomCode);
                    sessionStorage.setItem("multiplayerRoomCode", roomCode);
                    roomCodeOutput.textContent = roomCode;
                    roomInvite.hidden = false;
                    disconnectButton.hidden = false;
                    peer.on("connection", configureChannel);
                    setStatus("Místnost je připravená. Pošli soupeři tento kód.");
                    return;
                } catch (error) {
                    closeConnection();
                    if (error.type !== "unavailable-id") {
                        throw error;
                    }
                }
            }
            throw new Error("Nepodařilo se najít volný kód místnosti. Zkus to znovu.");
        } catch (error) {
            setStatus(peerErrorMessage(error));
        } finally {
            createButton.disabled = false;
        }
    }

    async function joinRoom() {
        const requestedCode = sessionStorage.getItem("multiplayerRoomCode");
        if (started) {
            setStatus("Do místnosti se můžeš připojit pouze před spuštěním hry.");
            return;
        }
        const roomCode = (requestedCode || code.value).trim().toUpperCase();
        if (!/^[A-HJ-NP-Z2-9]{6}$/.test(roomCode)) {
            setStatus("Zadej šestimístný kód místnosti.");
            code.focus();
            return;
        }

        closeConnection();
        role = "guest";
        joinButton.disabled = true;
        setStatus("Připojuji se do místnosti…");

        try {
            await createPeer();
            channel = peer.connect(roomCode, { reliable: true, serialization: "json" });
            configureChannel(channel);
            sessionStorage.setItem("multiplayerRoomCode", roomCode);
            disconnectButton.hidden = false;
            connectionTimeout = setTimeout(() => {
                if (!channel?.open) {
                    setStatus("Místnost nebyla nalezena. Ověř kód a zkus to znovu.");
                }
            }, 12000);
        } catch (error) {
            setStatus(peerErrorMessage(error));
        } finally {
            joinButton.disabled = false;
        }
    }

    function closeConnection() {
        clearTimeout(connectionTimeout);
        connectionTimeout = null;
        const currentChannel = channel;
        const currentPeer = peer;
        channel = null;
        peer = null;
        hasRemoteLocation = false;
        settingsMatch = false;
        remoteReadyRound = 0;
        opponentScore.hidden = true;
        roomInvite.hidden = true;
        disconnectButton.hidden = true;

        if (currentChannel) {
            currentChannel.close();
        }
        if (currentPeer && !currentPeer.destroyed) {
            currentPeer.destroy();
        }
        window.dispatchEvent(new Event("multiplayerconnectionchange"));
    }

    const multiplayer = {
        get role() {
            return role;
        },
        get connected() {
            return channel?.open === true;
        },
        get active() {
            return started && channel?.open === true;
        },
        get hasRemoteLocation() {
            return hasRemoteLocation;
        },
        waitForStart() {
            if (started) {
                return Promise.resolve(role || "solo");
            }
            return new Promise(resolve => {
                startResolver = resolve;
            });
        },
        startHostGame() {
            if (role === "host" && channel?.open && settingsMatch) {
                startGame("host");
            }
        },
        onMessage(handler) {
            messageHandler = handler;
        },
        send(type, payload) {
            if (channel?.open) {
                channel.send({ type, payload });
            }
        },
        publishLocation(location, round) {
            if (role === "host" && started) {
                multiplayer.send("location", { lat: location.lat, lng: location.lng, round });
            }
        },
        publishGuess(score, total, round) {
            const guess = { score, total, round };
            localGuesses.set(round, guess);
            multiplayer.send("guess", guess);
            window.dispatchEvent(new CustomEvent("multiplayerguess", { detail: guess }));
        },
        getRoundScores(round) {
            return {
                local: localGuesses.get(round) || null,
                remote: remoteGuesses.get(round) || null
            };
        },
        hasRemoteReady(round) {
            return remoteReadyRound === round;
        },
        markReady(round) {
            multiplayer.send("ready", { round });
        },
        close: closeConnection
    };

    window.multiplayer = multiplayer;
    openButton.addEventListener("click", () => dialog.showModal());
    createButton.addEventListener("click", createRoom);
    joinButton.addEventListener("click", joinRoom);
    soloButton.addEventListener("click", () => startGame("solo"));
    startButton.addEventListener("click", () => multiplayer.startHostGame());
    code.addEventListener("input", () => {
        code.value = code.value.toUpperCase().replace(/[^A-HJ-NP-Z2-9]/g, "").slice(0, 6);
    });
    code.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            joinRoom();
        }
    });
    copyButton.addEventListener("click", async () => {
        try {
            await navigator.clipboard.writeText(roomCodeOutput.textContent);
            setStatus("Kód místnosti zkopírován.");
        } catch {
            code.value = roomCodeOutput.textContent;
            code.focus();
            code.select();
            setStatus("Kód je označený. Zkopíruj ho klávesami Ctrl+C.");
        }
    });
    disconnectButton.addEventListener("click", () => {
        closeConnection();
        setStatus("Místnost byla ukončena.");
        if (!started) {
            startGame("solo");
        }
    });
    document.getElementById("multiplayerClose").addEventListener("click", () => dialog.close());
    window.addEventListener("load", () => {
        setStatus("Nejdřív zvol sólo hru nebo vytvoř místnost a pozvi druhého hráče.");
        dialog.showModal();
        if (role === "host") {
            createRoom();
        } else if (role === "guest" && sessionStorage.getItem("multiplayerRoomCode")) {
            joinRoom();
        }
    }, { once: true });
})();
