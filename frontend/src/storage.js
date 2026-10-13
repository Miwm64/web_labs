// noinspection JSUnusedGlobalSymbols

const STORAGE_KEY = "web-lab1:results";
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

function useStorage(type, key = STORAGE_KEY) {
    const backend = STORAGE_BACKENDS[type];
    if (backend === undefined) {
        throw new Error(
            `Unknown storage type "${type}", expected one of: ${Object.keys(STORAGE_BACKENDS).join(", ")}`
        );
    }
    storage.backend = backend;
    storage.key = key;
}

function readStorage() {
    try {
        const raw = storage.backend.read(storage.key);
        return raw === null ? null : JSON.parse(raw);
    } catch {
        return null;
    }
}

function writeStorage(value) {
    try {
        storage.backend.write(storage.key, JSON.stringify(value));
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

const STORAGE_API = { useStorage, readStorage, writeStorage, removeStorage };
Object.assign(window, STORAGE_API);
