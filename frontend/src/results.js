const STORAGE_KEY = "web-lab1:results";

const HIT_EPSILON = 1e-9;
const HIT_DISC_DIVISOR = 2;

const RESULT_COLUMNS = 5;
const DATE_LOCALE = "ru-RU";
const DATE_OPTIONS = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
};

const STORED_RANGES = {
    x: { min: -4, max: 4 },
    y: { min: -3, max: 3 },
    r: { min: 2, max: 5 },
};

function isInSquare(x, y, r) {
    return x >= -r - HIT_EPSILON && x <= HIT_EPSILON && y >= -HIT_EPSILON && y <= r + HIT_EPSILON;
}

function isInQuarterDisc(x, y, r) {
    const radius = r / HIT_DISC_DIVISOR;
    return x >= -HIT_EPSILON && y >= -HIT_EPSILON && x * x + y * y <= radius * radius + HIT_EPSILON;
}

function isInTriangle(x, y, r) {
    return x >= -HIT_EPSILON && y <= HIT_EPSILON && x - y <= r + HIT_EPSILON;
}

function isHit(x, y, r) {
    return isInSquare(x, y, r) || isInQuarterDisc(x, y, r) || isInTriangle(x, y, r);
}

function inRange(value, { min, max }) {
    return Number.isFinite(value) && value >= min && value <= max;
}

function isValidResult(item) {
    return (
        item !== null &&
        typeof item === "object" &&
        inRange(item.x, STORED_RANGES.x) &&
        inRange(item.y, STORED_RANGES.y) &&
        inRange(item.r, STORED_RANGES.r) &&
        typeof item.hit === "boolean" &&
        Number.isFinite(item.timestamp) &&
        !Number.isNaN(new Date(item.timestamp).getTime())
    );
}

const COOKIE_MAX_AGE_S = 60 * 60 * 24 * 365;

function setCookie(key, value, maxAge) {
    document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}`;
}

function webStorage(getStorage) {
    return {
        read: (key) => getStorage().getItem(key),
        write: (key, value) => getStorage().setItem(key, value),
        remove: (key) => getStorage().removeItem(key),
    };
}

const STORAGE_BACKENDS = {
    local: webStorage(() => localStorage),
    session: webStorage(() => sessionStorage),
    cookie: {
        read(key) {
            const prefix = `${encodeURIComponent(key)}=`;
            const entry = document.cookie.split("; ").find((part) => part.startsWith(prefix));
            return entry === undefined ? null : decodeURIComponent(entry.slice(prefix.length));
        },
        write: (key, value) => setCookie(key, value, COOKIE_MAX_AGE_S),
        remove: (key) => setCookie(key, "", 0),
    },
};

const storage = { backend: STORAGE_BACKENDS.local, key: STORAGE_KEY };

function readStorage() {
    try {
        const raw = storage.backend.read(storage.key);
        const parsed = raw === null ? [] : JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.filter(isValidResult) : [];
    } catch {
        return [];
    }
}

function writeStorage(items) {
    try {
        storage.backend.write(storage.key, JSON.stringify(items));
    } catch {
        // ignore
    }
}

function removeStorage() {
    try {
        storage.backend.remove(storage.key);
    } catch {
        // ignore
    }
}

const storedResults = [];

function useStorage(type, key = STORAGE_KEY) {
    const backend = STORAGE_BACKENDS[type];
    if (backend === undefined) {
        throw new Error(
            `Unknown storage type "${type}", expected one of: ${Object.keys(STORAGE_BACKENDS).join(", ")}`
        );
    }
    storage.backend = backend;
    storage.key = key;
    storedResults.splice(0, storedResults.length, ...readStorage());
    renderResults();
}

function getResults() {
    return [...storedResults];
}

function createRow({ x, y, r, hit, timestamp }) {
    const row = document.createElement("tr");

    for (const value of [x, y, r]) {
        const cell = document.createElement("td");
        cell.textContent = String(value);
        row.append(cell);
    }

    const status = document.createElement("td");
    status.textContent = hit ? "Попадание" : "Промах";
    status.dataset.hit = String(hit);
    row.append(status);

    const date = new Date(timestamp);
    const time = document.createElement("time");
    time.dateTime = date.toISOString();
    time.textContent = date.toLocaleString(DATE_LOCALE, DATE_OPTIONS);
    const when = document.createElement("td");
    when.append(time);
    row.append(when);

    return row;
}

function renderResults() {
    const body = document.getElementById("results-body");
    body.replaceChildren();
    document.getElementById("clear-button").disabled = storedResults.length === 0;

    if (storedResults.length === 0) {
        const cell = body.insertRow().insertCell();
        cell.colSpan = RESULT_COLUMNS;
        cell.className = "results-empty";
        cell.textContent = "Проверок пока не было.";
        return;
    }

    for (const result of [...storedResults].reverse()) {
        body.append(createRow(result));
    }
}

function addResult(result) {
    storedResults.push(result);
    writeStorage(storedResults);
    renderResults();
}

function clearResults() {
    storedResults.length = 0;
    removeStorage();
    renderResults();
}

const RESULTS_API = { isHit, getResults, addResult, clearResults, useStorage };
Object.assign(window, RESULTS_API);

const TIMEZONE_POLL_MS = 1000;

function currentTimeZoneKey() {
    const { timeZone } = Intl.DateTimeFormat().resolvedOptions();
    return `${timeZone}|${new Date().getTimezoneOffset()}`;
}

function watchTimeZone() {
    let lastKey = currentTimeZoneKey();
    setInterval(() => {
        const key = currentTimeZoneKey();
        if (key !== lastKey) {
            lastKey = key;
            renderResults();
        }
    }, TIMEZONE_POLL_MS);
}

useStorage("cookie", "my-other-lab");
watchTimeZone();
