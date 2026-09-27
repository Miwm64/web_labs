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
