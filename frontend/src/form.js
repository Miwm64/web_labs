/* global getResults, addPoint, deleteResults */

const TYPING_PAUSE_MS = 100;
const ALLOWED_CHARS = /[^0-9.,-]/g;

const LIMITS = {
    y: { label: "Y", min: -3, max: 3, signed: true },
    r: { label: "R", min: 2, max: 5, signed: false },
};

const X_REQUIRED = "Отметьте одно значение X.";

function normalizeNumber(raw) {
    return raw.trim().replace(",", ".");
}

function parseNumber(raw) {
    const text = normalizeNumber(raw);
    if (text === "") {
        return null;
    }
    const value = Number(text);
    return Number.isFinite(value) ? value : null;
}

function outOfRange({ label, min, max }) {
    return `${label} должно быть от ${min} до ${max}.`;
}

function checkMarkup(field, limits) {
    const { validity } = field;
    if (validity.valid) {
        return "";
    }
    if (validity.valueMissing) {
        return `Заполните поле ${limits.label}.`;
    }
    if (validity.badInput || validity.patternMismatch) {
        return `${limits.label} должно быть числом.`;
    }
    if (validity.rangeUnderflow || validity.rangeOverflow) {
        return outOfRange(limits);
    }
    return `${limits.label} — некорректное значение.`;
}

function checkValue(field, limits) {
    const value = parseNumber(field.value);
    if (value === null) {
        return `${limits.label} должно быть числом.`;
    }
    if (value < limits.min || value > limits.max) {
        return outOfRange(limits);
    }
    return "";
}

function fieldError(field, limits) {
    return checkMarkup(field, limits) || checkValue(field, limits);
}

function cleanNumber(raw, signed) {
    let text = raw.replace(ALLOWED_CHARS, "");
    const hasLeadingSign = signed && text.startsWith("-");
    text = text.replaceAll("-", "");
    if (hasLeadingSign) {
        text = `-${text}`;
    }
    const parts = text.split(/[.,]/);
    return parts.length > 2 ? `${parts[0]}.${parts.slice(1).join("")}` : text;
}

function setError(element, text) {
    element.textContent = text;
    if (text === "") {
        delete element.dataset.filled;
        return;
    }
    element.dataset.filled = "true";
}

function markInvalid(element, invalid) {
    if (invalid) {
        element.dataset.invalid = "true";
        return;
    }
    delete element.dataset.invalid;
}

function restrictInput(input, signed) {
    input.addEventListener("input", () => {
        const cleaned = cleanNumber(input.value, signed);
        if (cleaned !== input.value) {
            input.value = cleaned;
        }
    });
}

function watchField(input, limits, errorElement) {
    let timer = null;

    const check = () => {
        clearTimeout(timer);
        timer = null;
        const error = fieldError(input, limits);
        markInvalid(input, error !== "");
        if ("filled" in errorElement.dataset) {
            setError(errorElement, error);
        }
    };

    input.addEventListener("input", () => {
        clearTimeout(timer);
        timer = setTimeout(check, TYPING_PAUSE_MS);
    });
    input.addEventListener("change", check);
    input.addEventListener("blur", check);
}

// eslint-disable-next-line no-unused-vars
function drawStoredDots() {
    for (const { x, y } of getResults()) {
        drawDot(x, y);
    }
}

let lastPoint = null;

function drawLastDot() {
    if (lastPoint !== null) {
        drawDot(lastPoint.x, lastPoint.y);
    }
}

function redrawArea(raw) {
    clearCanvas();
    drawCanvas();

    const value = parseNumber(raw);
    if (value !== null && value >= LIMITS.r.min && value <= LIMITS.r.max) {
        drawPlane(value);
    }
    drawLastDot();
}

function initValidation() {
    const form = document.getElementById("check-form");
    const yInput = document.getElementById("y");
    const rInput = document.getElementById("r");
    const xBoxes = Array.from(form.querySelectorAll('input[name="x"]'));
    const xError = document.getElementById("x-error");
    const yError = document.getElementById("y-error");
    const rError = document.getElementById("r-error");
    const formError = document.getElementById("form-error");
    const submitButton = document.getElementById("submit-button");

    const showErrors = (messages) => {
        setError(xError, messages.x ?? "");
        setError(yError, messages.y ?? "");
        setError(rError, messages.r ?? "");
        setError(formError, messages._ ?? "");
        markInvalid(yInput, Boolean(messages.y));
        markInvalid(rInput, Boolean(messages.r));

        const first = [
            [messages.x, xBoxes[0]],
            [messages.y, yInput],
            [messages.r, rInput],
        ].find(([message]) => message);
        first?.[1].focus();

        return Object.values(messages).some(Boolean);
    };

    for (const box of xBoxes) {
        box.addEventListener("change", () => {
            if (!box.checked) {
                return;
            }
            for (const other of xBoxes) {
                other.checked = other === box;
            }
            setError(xError, "");
        });
    }

    restrictInput(yInput, true);
    restrictInput(rInput, false);
    watchField(yInput, LIMITS.y, yError);
    watchField(rInput, LIMITS.r, rError);
    rInput.addEventListener("input", () => redrawArea(rInput.value));

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const hasErrors = showErrors({
            x: xBoxes.some((box) => box.checked) ? "" : X_REQUIRED,
            y: fieldError(yInput, LIMITS.y),
            r: fieldError(rInput, LIMITS.r),
        });
        if (hasErrors) {
            return;
        }

        const x = xBoxes.find((box) => box.checked).value;
        const y = normalizeNumber(yInput.value);
        const r = normalizeNumber(rInput.value);

        submitButton.disabled = true;
        submitButton.setAttribute("aria-busy", "true");
        try {
            await addPoint({ x, y, r });
            lastPoint = { x: Number(x), y: Number(y) };
            redrawArea(rInput.value);
        } catch (error) {
            showErrors(error.errors);
        } finally {
            submitButton.disabled = false;
            submitButton.removeAttribute("aria-busy");
        }
    });
}

async function doClear(errorElement) {
    try {
        await deleteResults();
        clearDots();
        lastPoint = null;
        setError(errorElement, "");
    } catch (error) {
        setError(errorElement, error.message);
    }
}

function initClearButton() {
    const dialog = document.getElementById("clear-dialog");
    const resultsError = document.getElementById("results-error");

    document.getElementById("clear-button").addEventListener("click", () => {
        dialog.showModal();
    });

    dialog.addEventListener("close", async () => {
        if (dialog.returnValue === "confirm") {
            await doClear(resultsError);
        }
    });
}

function initTooltips() {
    const tips = Array.from(document.querySelectorAll(".info-button")).map((button) => ({
        button,
        hint: document.getElementById(button.getAttribute("aria-controls")),
    }));

    function closeAll() {
        for (const { button, hint } of tips) {
            delete hint.dataset.open;
            button.setAttribute("aria-expanded", "false");
        }
    }

    for (const { button, hint } of tips) {
        button.addEventListener("click", () => {
            const wasOpen = hint.dataset.open === "true";
            closeAll();
            if (wasOpen) {
                return;
            }
            hint.dataset.open = "true";
            button.setAttribute("aria-expanded", "true");
        });
    }

    document.addEventListener("click", (event) => {
        if (event.target.closest(".info-button") === null) {
            closeAll();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeAll();
        }
    });
}

function init() {
    initValidation();
    initTooltips();
    initClearButton();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}
