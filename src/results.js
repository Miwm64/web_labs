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

/* Shapes below mirror what canvas.js draws: square in quadrant II,
   quarter disc (radius R/2) in quadrant I, triangle in quadrant IV. */
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

function readStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const parsed = raw === null ? [] : JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.filter(isValidResult) : [];
    } catch {
        return [];
    }
}

function writeStorage(items) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
        // Storage is full or blocked: results stay in memory until the page is closed.
    }
}

function removeStorage() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch {
        // Storage is blocked: nothing to remove.
    }
}

const storedResults = readStorage();

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

const RESULTS_API = { isHit, getResults, addResult, clearResults };
Object.assign(window, RESULTS_API);

renderResults();
window.addEventListener("focus", renderResults);
