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

const DURATION_UNITS = [
    [1e9, "с"],
    [1e6, "мс"],
    [1e3, "мкс"],
    [1, "нс"],
];

const storedResults = [];
let serverInfo = null;

function setResults(results) {
    storedResults.splice(0, storedResults.length, ...results);
    renderResults();
}

function getResults() {
    return [...storedResults];
}

function createTime(timestamp) {
    const date = new Date(timestamp);
    const time = document.createElement("time");
    time.dateTime = date.toISOString();
    time.textContent = date.toLocaleString(DATE_LOCALE, DATE_OPTIONS);
    return time;
}

function formatDuration(ns) {
    const [size, unit] =
        DURATION_UNITS.find(([unitSize]) => ns >= unitSize) ?? DURATION_UNITS.at(-1);
    const value = (ns / size).toLocaleString(DATE_LOCALE, { maximumFractionDigits: 1 });
    return `${value} ${unit}`;
}

function renderServerInfo() {
    if (serverInfo === null) {
        return;
    }
    const element = document.getElementById("server-info");
    element.replaceChildren(
        "Текущее время: ",
        createTime(serverInfo.now),
        ` · Время выполнения: ${formatDuration(serverInfo.elapsedNs)}`
    );
    element.hidden = false;
}

function setServerInfo({ now, elapsedNs }) {
    serverInfo = { now, elapsedNs };
    renderServerInfo();
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

    const when = document.createElement("td");
    when.append(createTime(timestamp));
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

const RESULTS_API = { getResults, setResults, setServerInfo };
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
            renderServerInfo();
        }
    }, TIMEZONE_POLL_MS);
}

renderResults();
watchTimeZone();
