/* global fetchResults, pollResults, setResults, setServerInfo */

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

function applyData(data) {
    setResults(data.results);
    setServerInfo(data);
}

function notify(type, detail) {
    document.dispatchEvent(new CustomEvent(type, { detail }));
}

async function runSync(signal, startVersion) {
    let version = startVersion;
    let retryMs = RETRY_MIN_MS;
    let failed = false;

    while (!signal.aborted) {
        try {
            const data =
                version === null ? await fetchResults(signal) : await pollResults(version, signal);
            if (data !== null) {
                version = data.version;
                applyData(data);
            }
            retryMs = RETRY_MIN_MS;
            if (failed) {
                failed = false;
                notify("sync-ok");
            }
        } catch (error) {
            if (error.name === "AbortError") {
                return;
            }
            failed = true;
            notify("sync-error", error.message);
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

async function refreshSync() {
    stopSync();
    const controller = new AbortController();
    syncController = controller;

    let version = null;
    try {
        const data = await fetchResults(controller.signal);
        version = data.version;
        applyData(data);
    } finally {
        if (!controller.signal.aborted) {
            runSync(controller.signal, version);
        }
    }
}

function startSync() {
    refreshSync().catch(() => {
        // ignore
    });
}

document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
        startSync();
    } else {
        stopSync();
    }
});

const SYNC_API = { startSync, stopSync, refreshSync };
Object.assign(window, SYNC_API);

startSync();
