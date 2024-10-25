import "./style.css";

const APP_NAME = "Game 2";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;

// Create title
const title = document.createElement('h1');
title.textContent = 'PaintTool Sigh';
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

// Create thickness buttons
const thinButton = document.createElement('button');
thinButton.textContent = "Thin";
app.appendChild(thinButton);

const thickButton = document.createElement('button');
thickButton.textContent = "Thick";
app.appendChild(thickButton);

// Marker line
class MarkerLine {
    private points: Array<{ x: number, y: number }> = [];
    private thickness: number;

    constructor(x: number, y: number, thickness: number) {
        this.points.push({ x, y });
        this.thickness = thickness;
    }

    public drag(x: number, y: number) {
        this.points.push({ x, y });
    }

    public display(ctx: CanvasRenderingContext2D) {
        ctx.lineWidth = this.thickness;
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (const point of this.points) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
    }
}

// Tool preview
class ToolPreview {
    private thickness: number;

    constructor(thickness: number) {
        this.thickness = thickness;
    }

    public draw(ctx: CanvasRenderingContext2D, x: number, y: number) {
        ctx.beginPath();
        ctx.arc(x, y, this.thickness / 2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)"; 
        ctx.fill();
        ctx.closePath();
    }
}

// Store lines and redo stack
const lines: MarkerLine[] = [];
const redoStack: MarkerLine[] = [];

// Drawing state
const cursor = { active: false, x: 0, y: 0 };
let currentThickness = 2; 
let toolPreview: ToolPreview | null = null; 

// Custom event to trigger drawing changed
function triggerDrawingChanged() {
    const event = new CustomEvent("drawing-changed");
    canvas.dispatchEvent(event);
}

// Event listener to redraw all lines
canvas.addEventListener("drawing-changed", () => {
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    for (const line of lines) {
        line.display(ctx!);
    }
    // Draw the tool preview if it's not active
    if (toolPreview && !cursor.active) {
        toolPreview.draw(ctx!, cursor.x, cursor.y);
    }
});

// Start a new line
canvas.addEventListener("mousedown", (event) => {
    cursor.active = true;
    const startX = event.offsetX;
    const startY = event.offsetY;
    const newLine = new MarkerLine(startX, startY, currentThickness);
    lines.push(newLine);
    triggerDrawingChanged();
});

// Track mouse movements
canvas.addEventListener("mousemove", (event) => {
    cursor.x = event.offsetX;
    cursor.y = event.offsetY;

    if (cursor.active) {
        const newX = event.offsetX;
        const newY = event.offsetY;
        const currentLine = lines[lines.length - 1];
        currentLine.drag(newX, newY);
    } else {
        // Update tool preview on mouse move
        toolPreview = new ToolPreview(currentThickness);
    }

    triggerDrawingChanged();
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

// Set marker thickness on button click
thinButton.addEventListener("click", () => {
    currentThickness = 1; 
});

thickButton.addEventListener("click", () => {
    currentThickness = 5; 
});