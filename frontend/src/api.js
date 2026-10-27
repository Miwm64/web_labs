const RESULTS_URL = "/api/results";

const NETWORK_ERROR = "Сервер недоступен.";
const SERVER_ERROR = "Ошибка сервера.";

class ApiError extends Error {
    constructor(status, errors) {
        super(Object.values(errors).join(" "));
        this.name = "ApiError";
        this.status = status;
        this.errors = errors;
    }
}

async function readErrors(response) {
    try {
        const { errors } = await response.json();
        if (errors !== null && typeof errors === "object") {
            return errors;
        }
    } catch {
        // ignore
    }
    return { _: SERVER_ERROR };
}

async function request(method, { query = "", body, signal } = {}) {
    let response;
    try {
        const myHeader = "js-aboba";
        response = await fetch(`${RESULTS_URL}${query}`, {
            method,
            body,
            signal,
            headers: { Authorization: `Bearer ${myHeader}` },
        });
    } catch (error) {
        if (error.name === "AbortError") {
            throw error;
        }
        throw new ApiError(0, { _: NETWORK_ERROR });
    }

    if (response.status === 204) {
        return null;
    }
    if (!response.ok) {
        throw new ApiError(response.status, await readErrors(response));
    }

    try {
        return await response.json();
    } catch {
        throw new ApiError(response.status, { _: SERVER_ERROR });
    }
}

async function fetchResults(signal) {
    return request("GET", { signal });
}

async function pollResults(since, signal) {
    return request("GET", { query: `?since=${since}`, signal });
}

async function addPoint({ x, y, r }) {
    return request("POST", { body: new URLSearchParams({ x, y, r }) });
}

async function deleteResults() {
    return request("DELETE");
}

const API = { ApiError, fetchResults, pollResults, addPoint, deleteResults };
Object.assign(window, API);
