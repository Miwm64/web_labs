/* global fetchResults, pollResults, setResults */

const RETRY_MIN_MS = 1000;
const RETRY_MAX_MS = 30000;

let syncController = null;

function wait(ms, signal) {
    return new Promise((resolve) => {
        const timer = setTimeout(resolve, ms);
        signal.addEventListener(
            "abort",
            () => {
                clearTimeout(timer);
                resolve();
            },
            { once: true }
        );
    });
}

async function runSync(signal) {
    let version = null;
    let retryMs = RETRY_MIN_MS;

    while (!signal.aborted) {
        try {
            const data =
                version === null ? await fetchResults(signal) : await pollResults(version, signal);
            if (data !== null) {
                version = data.version;
                setResults(data.results);
            }
            retryMs = RETRY_MIN_MS;
        } catch (error) {
            if (error.name === "AbortError") {
                return;
            }
            await wait(retryMs, signal);
            retryMs = Math.min(retryMs * 2, RETRY_MAX_MS);
        }
    }
}

function stopSync() {
    if (syncController !== null) {
        syncController.abort();
        syncController = null;
    }
}

function startSync() {
    stopSync();
    syncController = new AbortController();
    runSync(syncController.signal);
}

document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
        startSync();
    } else {
        stopSync();
    }
});

const SYNC_API = { startSync, stopSync };
Object.assign(window, SYNC_API);

startSync();
