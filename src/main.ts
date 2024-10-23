import "./style.css";

const APP_NAME = "Game 2";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;

const title = document.createElement('h1');
title.textContent = 'Gamin';
app.appendChild(title);

// Canvas
const canvas = document.getElementById("display") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

// Buttons
const clear = document.createElement('button');
clear.textContent = "clear";
app.appendChild(clear);

// Store Lines
const lines: Array<Array<{x: number, y: number}>> = [];
let currentLine: Array<{x: number, y: number}> = [];

// Drawing state
const cursor = {active: false, x: 0, y: 0};

// Custom event drawing changed
function triggerDrawingChanged() {
    const event = new CustomEvent("drawing-changed");
    canvas.dispatchEvent(event);
}

// Event Listener to clear and redraw all lines
canvas.addEventListener("drawing-changed", () => {
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    for (const line of lines) {
        ctx?.beginPath();
        for (let i = 0; i < line.length - 1; i++) {
            ctx?.moveTo(line[i].x, line[i].y);
            ctx?.lineTo(line[i + 1].x, line[i + 1].y);
        }
        ctx?.stroke();
    }
});

// Start a new line and save the initial point
canvas.addEventListener("mousedown", (event) => {
    cursor.active = true;
    currentLine = [];
    lines.push(currentLine);
    const startX = event.offsetX;
    const startY = event.offsetY;
    currentLine.push({x: startX, y: startY});
    cursor.x = startX;
    cursor.y = startY;
    triggerDrawingChanged();
});

// Save mouse movement positions and push them to the current line
canvas.addEventListener("mousemove", (event) => {
    if (cursor.active) {
        const newX = event.offsetX;
        const newY = event.offsetY;
        currentLine.push({x: newX, y: newY});
        cursor.x = newX;
        cursor.y = newY;
        triggerDrawingChanged();
    }
});

// Stop drawing on mouse release
canvas.addEventListener("mouseup", () => {
    cursor.active = false;
});

// Clear canvas button
clear.addEventListener("click", () => {
    lines.length = 0;
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
});
