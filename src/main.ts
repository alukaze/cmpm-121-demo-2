import "./style.css";

const APP_NAME = "Game 2";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;

// Create title
const title = document.createElement('h1');
title.textContent = 'Gamin';
app.appendChild(title);

// Create canvas
const canvas = document.getElementById("display") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

// Create buttons
const clearButton = document.createElement('button');
clearButton.textContent = "Clear";
app.appendChild(clearButton);

const undoButton = document.createElement('button');
undoButton.textContent = "Undo";
app.appendChild(undoButton);

const redoButton = document.createElement('button');
redoButton.textContent = "Redo";
app.appendChild(redoButton);

// Store lines and redo stack
const lines: Array<Array<{ x: number, y: number }>> = [];
let currentLine: Array<{ x: number, y: number }> = [];
const redoStack: Array<Array<{ x: number, y: number }>> = [];

// Drawing state
const cursor = { active: false, x: 0, y: 0 };

// Custom event to trigger drawing changed
function triggerDrawingChanged() {
    const event = new CustomEvent("drawing-changed");
    canvas.dispatchEvent(event);
}

// Event listener to redraw all lines
canvas.addEventListener("drawing-changed", () => {
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    for (const line of lines) {
        ctx?.beginPath();
        ctx?.moveTo(line[0].x, line[0].y);
        for (const point of line) {
            ctx?.lineTo(point.x, point.y);
        }
        ctx?.stroke();
    }
});

// Start a new line
canvas.addEventListener("mousedown", (event) => {
    cursor.active = true;
    currentLine = [];
    lines.push(currentLine);
    const startX = event.offsetX;
    const startY = event.offsetY;
    currentLine.push({ x: startX, y: startY });
    cursor.x = startX;
    cursor.y = startY;
    triggerDrawingChanged();
});

// Track mouse movements
canvas.addEventListener("mousemove", (event) => {
    if (cursor.active) {
        const newX = event.offsetX;
        const newY = event.offsetY;
        currentLine.push({ x: newX, y: newY });
        triggerDrawingChanged();
    }
});

// Stop drawing on mouse release
canvas.addEventListener("mouseup", () => {
    cursor.active = false;
});

// Clear canvas button
clearButton.addEventListener("click", () => {
    lines.length = 0; 
    redoStack.length = 0;
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
});

// Undo functionality
undoButton.addEventListener("click", () => {
    if (lines.length > 0) {
        const lastLine = lines.pop(); 
        if (lastLine) {
            redoStack.push(lastLine);
        }
        triggerDrawingChanged(); 
    }
});

// Redo functionality
redoButton.addEventListener("click", () => {
    if (redoStack.length > 0) {
        const lastRedoLine = redoStack.pop(); 
        if (lastRedoLine) {
            lines.push(lastRedoLine); 
        }
        triggerDrawingChanged(); 
    }
});