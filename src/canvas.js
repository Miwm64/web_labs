const AXIS_COLOR = "rgb(0 0 0)";
const ARROW_LENGTH = 12;
const ARROW_WIDTH = 8;
const LABEL_FONT = "bold 16px sans-serif";

function draw_arrow(ctx, fromX, fromY, toX, toY) {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const baseX = toX - ARROW_LENGTH * cos;
    const baseY = toY - ARROW_LENGTH * sin;
    const half = ARROW_WIDTH / 2;

    ctx.strokeStyle = AXIS_COLOR;
    ctx.fillStyle = AXIS_COLOR;
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(baseX - half * sin, baseY + half * cos);
    ctx.lineTo(baseX + half * sin, baseY - half * cos);
    ctx.closePath();
    ctx.fill();
}

function draw_canvas() {
    const canvas = document.getElementById("coordinate-plane");
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "rgb(255 255 255)";
    ctx.fillRect(0, 0, width, height);

    const centerX = Math.floor(width / 2) + 0.5;
    const centerY = Math.floor(height / 2) + 0.5;

    draw_arrow(ctx, 0, centerY, width, centerY);
    draw_arrow(ctx, centerX, height, centerX, 0);

    ctx.fillStyle = AXIS_COLOR;
    ctx.font = LABEL_FONT;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("X", width - ARROW_LENGTH / 2 - width / 200, centerY - ARROW_LENGTH);
    ctx.fillText("Y", centerX + ARROW_LENGTH, ARROW_LENGTH / 2 + height / 200);
}

function resizeCanvas() {
    const canvas = document.getElementById("coordinate-plane");
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

resizeCanvas();
draw_canvas();

window.addEventListener("resize", () => {
    resizeCanvas();
    draw_canvas();
});

const CANVAS_ID = "coordinate-plane";

const PLANE_MIN = -5;
const PLANE_MAX = 5;
const PLANE_SPAN = PLANE_MAX - PLANE_MIN;

const FULL_TURN = Math.PI * 2;
const DOT_RADIUS = 3;
const DOT_COLOR = "rgb(255 140 0)";
const DOT_BORDER_COLOR = "rgb(255 255 255)";
const DOT_BORDER_WIDTH = 1;

function toPixelX(value, width) {
    return ((value - PLANE_MIN) / PLANE_SPAN) * width;
}

function toPixelY(value, height) {
    return ((PLANE_MAX - value) / PLANE_SPAN) * height;
}

function draw_dot(x, y) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
        throw new TypeError("Point coordinates must be finite numbers");
    }
    if (x < PLANE_MIN || x > PLANE_MAX || y < PLANE_MIN || y > PLANE_MAX) {
        throw new RangeError(
            `Point is outside the plane: allowed range is [${PLANE_MIN}, ${PLANE_MAX}]`
        );
    }

    const canvas = document.getElementById(CANVAS_ID);
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = DOT_COLOR;
    ctx.strokeStyle = DOT_BORDER_COLOR;
    ctx.lineWidth = DOT_BORDER_WIDTH;
    ctx.beginPath();
    ctx.arc(toPixelX(x, rect.width), toPixelY(y, rect.height), DOT_RADIUS, 0, FULL_TURN);
    ctx.fill();
    ctx.stroke();
}

const AREA_STROKE_WIDTH = 1;
const QUARTER_TURN = Math.PI / 2;
const DISC_RADIUS_DIVISOR = 2;

const SQUARE_FILL = "rgb(31 78 121 / 20%)";
const SQUARE_STROKE = "rgb(31 78 121)";
const DISC_FILL = "rgb(27 110 60 / 20%)";
const DISC_STROKE = "rgb(27 110 60)";
const TRIANGLE_FILL = "rgb(164 38 44 / 20%)";
const TRIANGLE_STROKE = "rgb(164 38 44)";

function pixelsPerUnit(length) {
    return length / PLANE_SPAN;
}

function fillAndStroke(ctx, fill, stroke) {
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = AREA_STROKE_WIDTH;
    ctx.fill();
    ctx.stroke();
}

function draw_square(r, ctx, originX, originY, width, height) {
    const left = Math.min(toPixelX(-r, width), originX);
    const right = Math.max(toPixelX(-r, width), originX);
    const top = Math.min(toPixelY(r, height), originY);
    const bottom = Math.max(toPixelY(r, height), originY);

    ctx.beginPath();
    ctx.rect(left, top, right - left, bottom - top);
    fillAndStroke(ctx, SQUARE_FILL, SQUARE_STROKE);
}

function draw_quarter_disc(r, ctx, originX, originY, width) {
    const radius = Math.abs(r / DISC_RADIUS_DIVISOR) * pixelsPerUnit(width);

    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.arc(originX, originY, radius, 0, -QUARTER_TURN, true);
    ctx.closePath();
    fillAndStroke(ctx, DISC_FILL, DISC_STROKE);
}

function draw_triangle(r, ctx, originX, originY, width, height) {
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(toPixelX(r, width), originY);
    ctx.lineTo(originX, toPixelY(-r, height));
    ctx.closePath();
    fillAndStroke(ctx, TRIANGLE_FILL, TRIANGLE_STROKE);
}

function draw_area(r) {
    if (!Number.isFinite(r)) {
        throw new TypeError("Radius must be a finite number");
    }
    if (r < PLANE_MIN || r > PLANE_MAX) {
        throw new RangeError(
            `Radius is outside the plane: allowed range is [${PLANE_MIN}, ${PLANE_MAX}]`
        );
    }

    const canvas = document.getElementById(CANVAS_ID);
    const rect = canvas.getBoundingClientRect();
    const { width, height } = rect;
    const ctx = canvas.getContext("2d");
    const originX = toPixelX(0, width);
    const originY = toPixelY(0, height);

    draw_square(r, ctx, originX, originY, width, height);
    draw_quarter_disc(r, ctx, originX, originY, width);
    draw_triangle(r, ctx, originX, originY, width, height);
}

const PUBLIC_API = { draw_dot, draw_area };
Object.assign(window, PUBLIC_API);
