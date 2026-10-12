(function() {
    const dialog = document.getElementById("multiplayerDialog");
    const status = document.getElementById("multiplayerStatus");
    const code = document.getElementById("multiplayerCode");
    const createButton = document.getElementById("multiplayerCreate");
    const joinButton = document.getElementById("multiplayerJoin");
    const copyButton = document.getElementById("multiplayerCopy");
    const openButton = document.getElementById("multiplayerOpen");
    const roomInvite = document.getElementById("multiplayerRoomInvite");
    const roomCodeOutput = document.getElementById("multiplayerRoomCode");
    const disconnectButton = document.getElementById("multiplayerDisconnect");

    let peer;
    let channel;
    let role;
    let messageHandler = () => {};
    let hasRemoteLocation = false;
    let connectionTimeout;
    const opponentScore = document.getElementById("multiplayerOpponentScore");
    const roomAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

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
    }

    function configureChannel(dataConnection) {
        if (channel?.open) {
            dataConnection.close();
            return;
        }

        channel = dataConnection;
        channel.on("open", () => {
            clearTimeout(connectionTimeout);
            setStatus("Hráči jsou propojeni. Čeká se na společné kolo.");
            opponentScore.hidden = false;
            opponentScore.textContent = "SOUPEŘ: PŘIPOJEN";
            multiplayer.send("hello", { role, settings: gameSettings() });
            if (role === "host" && Number.isFinite(souradnicePanorama?.lat)) {
                multiplayer.publishLocation(souradnicePanorama, aktualniKolo);
            }
        });
        channel.on("close", () => {
            clearTimeout(connectionTimeout);
            if (channel !== dataConnection) {
                return;
            }
            channel = null;
            setStatus("Spojení bylo ukončeno.");
            opponentScore.hidden = true;
        });
        channel.on("error", error => setStatus(peerErrorMessage(error)));
        channel.on("data", receiveMessage);
    }

    async function createRoom() {
        closeConnection();
        role = "host";
        createButton.disabled = true;
        roomInvite.hidden = true;
        setStatus("Vytvářím místnost…");

        try {
            for (let attempt = 0; attempt < 8; attempt++) {
                const roomCode = generateRoomCode();
                try {
                    await createPeer(roomCode);
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
        const roomCode = code.value.trim().toUpperCase();
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
        opponentScore.hidden = true;
        roomInvite.hidden = true;
        disconnectButton.hidden = true;

        if (currentChannel) {
            currentChannel.close();
        }
        if (currentPeer && !currentPeer.destroyed) {
            currentPeer.destroy();
        }
    }

    const multiplayer = {
        get role() {
            return role;
        },
        get connected() {
            return channel?.open === true;
        },
        get hasRemoteLocation() {
            return hasRemoteLocation;
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
    createButton.addEventListener("click", createRoom);
    joinButton.addEventListener("click", joinRoom);
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
    });
    document.getElementById("multiplayerClose").addEventListener("click", () => dialog.close());
})();