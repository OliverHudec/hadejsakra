const MAPY_CZ_LOCATIONS = [
  { id: "praha-stare-mesto", name: "Praha – Staré Město", lat: 50.087, lon: 14.421 },
  { id: "praha-karluv-most", name: "Praha – Karlův most", lat: 50.0865, lon: 14.4099 },
  { id: "praha-hradcany", name: "Praha – Hradčany", lat: 50.0909, lon: 14.3989 },
  { id: "praha-letna", name: "Praha – Letná", lat: 50.086, lon: 14.416 },
  { id: "karlstejn", name: "Karlštejn", lat: 49.9395, lon: 13.1835 },
  { id: "kutna-hora", name: "Kutná Hora", lat: 49.9485, lon: 15.2682 },
  { id: "cesky-krumlov", name: "Český Krumlov", lat: 48.8105, lon: 14.3153 },
  { id: "hluboka", name: "Hluboká nad Vltavou", lat: 49.0532, lon: 14.4351 },
  { id: "brno-spilberk", name: "Brno – Špilberk", lat: 49.1947, lon: 16.6073 },
  { id: "brno-centrum", name: "Brno – Centrum", lat: 49.1951, lon: 16.6068 },
  { id: "olomouc", name: "Olomouc", lat: 49.5945, lon: 17.2512 },
  { id: "plzen", name: "Plzeň", lat: 49.7475, lon: 13.3776 },
  { id: "ceska-lipa", name: "Česká Lípa", lat: 50.6879, lon: 14.5377 },
  { id: "decin", name: "Děčín", lat: 50.7829, lon: 14.2145 },
  { id: "liberec", name: "Liberec", lat: 50.7709, lon: 15.0561 },
  { id: "jihlava", name: "Jihlava", lat: 49.396, lon: 15.5912 },
  { id: "tabor", name: "Tábor", lat: 49.4146, lon: 14.6577 },
  { id: "pardubice", name: "Pardubice", lat: 50.0407, lon: 15.7787 },
  { id: "hradec-kralove", name: "Hradec Králové", lat: 50.2092, lon: 15.8328 },
  { id: "ostrava", name: "Ostrava", lat: 49.8209, lon: 18.2625 },
  { id: "moravska-trebova", name: "Moravská Třebová", lat: 49.7563, lon: 16.6665 },
  { id: "znojmo", name: "Znojmo", lat: 48.8556, lon: 16.0488 },
  { id: "trebon", name: "Třeboň", lat: 49.0034, lon: 14.7711 },
  { id: "krivoklat", name: "Křivoklát", lat: 50.0365, lon: 13.8759 },
  { id: "snezka", name: "Sněžka", lat: 50.7362, lon: 15.7408 },
  { id: "strbske-pleso", name: "Vysoké Tatry – Štrbské pleso", lat: 49.1187, lon: 20.0581 },
  { id: "praded", name: "Jeseníky – Praděd", lat: 50.0833, lon: 17.2283 },
  { id: "kremze", name: "Křemže", lat: 48.9157, lon: 14.3083 },
  { id: "lednice", name: "Lednice", lat: 48.7993, lon: 16.7992 },
  { id: "most", name: "Most", lat: 50.503, lon: 13.636 },
  { id: "kromeriz", name: "Kroměříž", lat: 49.2988, lon: 17.3922 },
  { id: "teplice", name: "Teplice", lat: 50.6392, lon: 13.8269 },
  { id: "marianske-lazne", name: "Mariánské Lázně", lat: 49.964, lon: 12.701 },
  { id: "lnare", name: "Lnáře", lat: 49.386, lon: 13.787 },
  { id: "primda", name: "Přimda", lat: 49.675, lon: 12.673 },
  { id: "benesov", name: "Benešov", lat: 49.7821, lon: 14.692 },
  { id: "ceska-trebova", name: "Česká Třebová", lat: 49.9013, lon: 16.444 },
  { id: "pisek", name: "Písek", lat: 49.3087, lon: 14.1467 },
  { id: "frydek-mistek", name: "Frýdek-Místek", lat: 49.6801, lon: 18.3508 },
  { id: "uherske-hradiste", name: "Uherské Hradiště", lat: 49.0697, lon: 17.4502 },
  { id: "valasske-mezirici", name: "Valašské Meziříčí", lat: 49.4726, lon: 17.971 },
  { id: "jachymov", name: "Jáchymov", lat: 50.364, lon: 12.9185 },
  { id: "melnik", name: "Mělník", lat: 50.3507, lon: 14.4744 },
  { id: "prachatice", name: "Prachatice", lat: 49.0136, lon: 14.9774 },
  { id: "bohumin", name: "Bohumín", lat: 49.9046, lon: 18.356 },
  { id: "roznov-pod-radhostem", name: "Rožnov pod Radhoštěm", lat: 49.4559, lon: 18.1411 },
  { id: "sazava", name: "Sázava", lat: 49.8832, lon: 14.9052 }
];

const state = {
  totalScore: 0,
  round: 1,
  currentLocation: null,
  guess: null,
  guessMarker: null,
  answerMarker: null,
  line: null,
  answered: false,
  map: null,
  panorama: null,
  mode: "all",
  radiusKm: 30,
  centerLocationId: "praha-stare-mesto",
  searchInProgress: false
};

const scoreEl = document.getElementById("score");
const roundEl = document.getElementById("round");
const resultEl = document.getElementById("result");
const locationNameEl = document.getElementById("location-name");
const confirmButton = document.getElementById("confirm-guess");
const nextRoundButton = document.getElementById("next-round");
const centerLocationSelect = document.getElementById("center-location");
const radiusSlider = document.getElementById("radius-slider");
const radiusLabel = document.getElementById("radius-label");
const nearSettings = document.getElementById("near-settings");

function getApiKey() {
  return window.MAPY_CZ_API_KEY || "TVUJ_API_KLIC";
}

function getSelectedCenterLocation() {
  return MAPY_CZ_LOCATIONS.find((location) => location.id === state.centerLocationId) || MAPY_CZ_LOCATIONS[0];
}

function getAvailableLocations() {
  if (state.mode === "all") {
    return [...MAPY_CZ_LOCATIONS];
  }

  const center = getSelectedCenterLocation();
  const filtered = MAPY_CZ_LOCATIONS.filter((location) => {
    const distanceKm = calculateDistanceKm(center.lat, center.lon, location.lat, location.lon);
    return distanceKm <= state.radiusKm;
  });

  return filtered.length ? filtered : [center];
}

function randomLocationFromPool(pool) {
  if (!pool || pool.length === 0) {
    return MAPY_CZ_LOCATIONS[0];
  }

  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}

function updateRadiusDisplay() {
  radiusLabel.textContent = `${state.radiusKm} km`;
}

function toggleModeUI() {
  const modeButtons = document.querySelectorAll(".mode-button");
  modeButtons.forEach((button) => {
    const active = button.dataset.mode === state.mode;
    button.classList.toggle("is-active", active);
  });

  nearSettings.classList.toggle("hidden", state.mode !== "near");
}

function populateCenterLocationSelect() {
  centerLocationSelect.innerHTML = "";

  MAPY_CZ_LOCATIONS.forEach((location) => {
    const option = document.createElement("option");
    option.value = location.id;
    option.textContent = location.name;
    if (location.id === state.centerLocationId) {
      option.selected = true;
    }
    centerLocationSelect.appendChild(option);
  });
}

function showLoadingState(message) {
  locationNameEl.textContent = "Načítání...";
  resultEl.textContent = message;
  confirmButton.disabled = true;
}

function clearMapObjects() {
  if (state.guessMarker && state.map) {
    state.map.removeLayer(state.guessMarker);
    state.guessMarker = null;
  }

  if (state.answerMarker && state.map) {
    state.map.removeLayer(state.answerMarker);
    state.answerMarker = null;
  }

  if (state.line && state.map) {
    state.map.removeLayer(state.line);
    state.line = null;
  }
}

async function ensureMapySdk() {
  if (window.MapyCZ && window.MapyCZ.Panorama) {
    return true;
  }

  if (!document.querySelector("script[src='https://api.mapy.cz/loader.js']")) {
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://api.mapy.cz/loader.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Mapy.cz loader se nepodařilo načíst."));
      document.head.appendChild(script);
    });
  }

  const loaderApi = window.Loader || window.MapyCZ;
  if (loaderApi && typeof loaderApi.load === "function") {
    await new Promise((resolve) => {
      loaderApi.load(() => resolve());
    });
  }

  return !!(window.MapyCZ && window.MapyCZ.Panorama);
}

function buildPanoramaFallback(location) {
  const panoramaNode = document.getElementById("panorama");
  panoramaNode.innerHTML = "";

  const fallback = document.createElement("div");
  fallback.className = "panorama-fallback";
  fallback.innerHTML = `
    <div class="fallback-card">
      <strong>Panorama není k dispozici</strong>
      <span>${location ? location.name : "Lokace"}</span>
      <small>${location ? location.lat.toFixed(4) : "0.0000"}, ${location ? location.lon.toFixed(4) : "0.0000"}</small>
    </div>
  `;
  panoramaNode.appendChild(fallback);
}

function renderPanoramaForLocation(location) {
  const panoramaNode = document.getElementById("panorama");
  panoramaNode.innerHTML = "";

  const container = document.createElement("div");
  container.style.width = "100%";
  container.style.height = "100%";
  panoramaNode.appendChild(container);

  const panoramaFactories = [
    () => {
      if (!window.MapyCZ || !window.MapyCZ.Panorama) return null;
      return new window.MapyCZ.Panorama(container, {
        center: { lat: location.lat, lon: location.lon },
        zoom: 0,
        marker: false
      });
    },
    () => {
      if (!window.MapyCZ || !window.MapyCZ.Panorama) return null;
      return new window.MapyCZ.Panorama({
        container,
        center: { lat: location.lat, lon: location.lon },
        zoom: 0,
        marker: false
      });
    },
    () => {
      if (!window.MapyCZ || !window.MapyCZ.Panorama) return null;
      return new window.MapyCZ.Panorama(container, {
        coords: { lat: location.lat, lon: location.lon },
        zoom: 0,
        marker: false
      });
    }
  ];

  for (const factory of panoramaFactories) {
    try {
      const panorama = factory();
      if (panorama) {
        state.panorama = panorama;
        return;
      }
    } catch (error) {
      console.warn("Nativní panorama selhalo:", error);
    }
  }

  buildPanoramaFallback(location);
}

function initMap() {
  const mapElement = document.getElementById("map");

  state.map = L.map(mapElement, {
    zoomControl: false,
    attributionControl: true,
    dragging: true,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    boxZoom: false,
    keyboard: false,
    tap: false,
    touchZoom: true
  }).setView([49.8, 15.3], 7);

  L.control.zoom({ position: "bottomright" }).addTo(state.map);

  const tileLayer = L.tileLayer(
    `https://api.mapy.cz/v1/maptiles/basic/256/{z}/{x}/{y}?apikey=${getApiKey()}`,
    {
      maxZoom: 19,
      attribution: '&copy; <a href="https://mapy.cz/" target="_blank" rel="noreferrer">Mapy.cz</a>'
    }
  );

  tileLayer.addTo(state.map);

  state.map.on("click", (event) => {
    if (state.answered) {
      return;
    }

    state.guess = {
      lat: event.latlng.lat,
      lng: event.latlng.lng
    };

    placeGuessMarker();
    locationNameEl.textContent = "Tip umístěn, potvrď výběr";
  });
}

function placeGuessMarker() {
  if (!state.guess) {
    return;
  }

  if (state.guessMarker) {
    state.map.removeLayer(state.guessMarker);
  }

  const customIcon = L.divIcon({
    className: "guess-pin",
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });

  state.guessMarker = L.marker([state.guess.lat, state.guess.lng], { icon: customIcon }).addTo(state.map);
  state.map.setView([state.guess.lat, state.guess.lng], 8, { animate: true });
}

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

async function startRound() {
  if (state.searchInProgress) {
    return;
  }

  state.searchInProgress = true;
  state.guess = null;
  state.answered = false;
  clearMapObjects();

  scoreEl.textContent = state.totalScore;
  roundEl.textContent = state.round;

  const pool = getAvailableLocations();
  state.currentLocation = randomLocationFromPool(pool);

  showLoadingState(
    state.mode === "near"
      ? `Hledám místo v okruhu ${state.radiusKm} km od ${getSelectedCenterLocation().name}.`
      : "Hledám náhodné místo v ČR..."
  );

  confirmButton.disabled = false;
  locationNameEl.textContent = state.mode === "near" ? `Vyber místo v okruhu ${state.radiusKm} km` : "Vyber místo na mapě";
  resultEl.textContent = "Zatím není žádný tip.";

  if (state.map) {
    state.map.setView([49.8, 15.3], 7, { animate: true });
  }

  await ensureMapySdk();
  renderPanoramaForLocation(state.currentLocation);
  state.searchInProgress = false;
}

function confirmGuess() {
  if (!state.guess || !state.currentLocation) {
    resultEl.textContent = "Nejdřív klikni na mapu a vyber svůj tip.";
    return;
  }

  if (state.answered) {
    return;
  }

  state.answered = true;

  const distanceKm = calculateDistanceKm(
    state.guess.lat,
    state.guess.lng,
    state.currentLocation.lat,
    state.currentLocation.lng
  );

  const points = Math.max(0, Math.round(5000 - distanceKm * 8));
  state.totalScore += points;

  scoreEl.textContent = state.totalScore;

  const answerIcon = L.divIcon({
    className: "answer-pin",
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });

  state.answerMarker = L.marker([state.currentLocation.lat, state.currentLocation.lng], {
    icon: answerIcon
  }).addTo(state.map);

  state.line = L.polyline(
    [
      [state.guess.lat, state.guess.lng],
      [state.currentLocation.lat, state.currentLocation.lng]
    ],
    {
      color: "#76d7ff",
      weight: 4,
      opacity: 0.9,
      dashArray: "8 10"
    }
  ).addTo(state.map);

  const bounds = L.latLngBounds(
    [state.guess.lat, state.guess.lng],
    [state.currentLocation.lat, state.currentLocation.lng]
  );
  state.map.fitBounds(bounds.pad(0.45));

  resultEl.innerHTML = `
    <strong>${state.currentLocation.name}</strong><br>
    Vzdálenost: <strong>${distanceKm.toFixed(1)} km</strong><br>
    Získané body: <strong>${points}</strong>
  `;
}

function bindEvents() {
  confirmButton.addEventListener("click", confirmGuess);
  nextRoundButton.addEventListener("click", async () => {
    state.round += 1;
    await startRound();
  });

  document.querySelectorAll(".mode-button").forEach((button) => {
    button.addEventListener("click", () => {
      state.mode = button.dataset.mode;
      toggleModeUI();
      startRound();
    });
  });

  centerLocationSelect.addEventListener("change", (event) => {
    state.centerLocationId = event.target.value;
    if (state.mode === "near") {
      startRound();
    }
  });

  radiusSlider.addEventListener("input", (event) => {
    state.radiusKm = Number(event.target.value);
    updateRadiusDisplay();
    if (state.mode === "near") {
      startRound();
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  populateCenterLocationSelect();
  updateRadiusDisplay();
  toggleModeUI();
  bindEvents();
  initMap();

  if (!getApiKey() || getApiKey() === "TVUJ_API_KLIC") {
    resultEl.innerHTML = "<strong>Upozornění:</strong> nastavte svůj API klíč v config.js pro plnou funkčnost.";
  }

  await ensureMapySdk();
  await startRound();
});
