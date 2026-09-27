function draw_canvas() {
    return;
}

function resizeCanvas() {
    const canvas = document.getElementById("coordinate-plane");
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

resizeCanvas();
draw_canvas();

//window.addEventListener("resize", resizeCanvas);
//window.addEventListener("DOMContentLoaded", resizeCanvas);
