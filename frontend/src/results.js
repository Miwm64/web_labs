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

const storedResults = [];

function setResults(results) {
    storedResults.splice(0, storedResults.length, ...results);
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
    renderResults();
}

function clearResults() {
    storedResults.length = 0;
    renderResults();
}

const RESULTS_API = { isHit, getResults, setResults, addResult, clearResults };
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

renderResults();
watchTimeZone();
