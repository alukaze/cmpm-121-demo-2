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

// Create sticker buttons
const stickerWineButton = document.createElement('button');
stickerWineButton.textContent = "🍷";
app.appendChild(stickerWineButton);

const stickerCocktailButton = document.createElement('button');
stickerCocktailButton.textContent = "🍸";
app.appendChild(stickerCocktailButton);

const stickerTropicalButton = document.createElement('button');
stickerTropicalButton.textContent = "🍹";
app.appendChild(stickerTropicalButton);

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

// Sticker class
class Sticker {
    private emoji: string;
    public x: number;
    public y: number;

    constructor(emoji: string, x: number, y: number) {
        this.emoji = emoji;
        this.x = x;
        this.y = y;
    }

    public drag(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public display(ctx: CanvasRenderingContext2D) {
        const offsetX = 20;
        const offsetY = 15;
        ctx.font = "30px Arial";
        ctx.fillText(this.emoji, this.x - offsetX, this.y + offsetY);
    }

    public isClicked(x: number, y: number): boolean {
        const offsetX = 20;
        const offsetY = 15;
        const left = this.x - offsetX;
        const right = this.x + offsetX;
        const top = this.y - offsetY;
        const bottom = this.y + offsetY;
        return x >= left && x <= right && y >= top && y <= bottom;
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

// Store items and redo stack
const items: Array<MarkerLine | Sticker> = [];
const redoStack: Array<MarkerLine | Sticker> = [];

// Drawing state
const cursor = { active: false, x: 0, y: 0 };
let currentThickness = 2;
let toolPreview: ToolPreview | null = null;
let currentSticker: Sticker | null = null;
let activeTool: 'draw' | 'sticker' = 'draw';
let isDraggingSticker = false;

// Custom event to trigger drawing changed
function triggerDrawingChanged() {
    const event = new CustomEvent("drawing-changed");
    canvas.dispatchEvent(event);
}

function triggerToolMoved() {
    const event = new CustomEvent("tool-moved");
    canvas.dispatchEvent(event);
}

// Event listener to redraw all items
canvas.addEventListener("drawing-changed", () => {
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    for (const item of items) {
        item.display(ctx!);
    }
    if (toolPreview && !cursor.active && activeTool === 'draw') {
        toolPreview.draw(ctx!, cursor.x, cursor.y);
    }
    if (currentSticker && !cursor.active && activeTool === 'sticker') {
        currentSticker.display(ctx!);
    }
});

// Handle sticker preview on tool-moved
canvas.addEventListener("tool-moved", () => {
    if (currentSticker) {
        currentSticker.drag(cursor.x, cursor.y);
    }
    triggerDrawingChanged();
});

// Start a new line or place/drag a sticker
canvas.addEventListener("mousedown", (event) => {
    cursor.active = true;
    const startX = event.offsetX;
    const startY = event.offsetY;

    // Check if clicked on an existing sticker
    for (let i = items.length - 1; i >= 0; i--) {
        if (items[i] instanceof Sticker && (items[i] as Sticker).isClicked(startX, startY)) {
            currentSticker = items[i] as Sticker;
            isDraggingSticker = true;
            return;
        }
    }

    if (activeTool === 'draw') {
        const newLine = new MarkerLine(startX, startY, currentThickness);
        items.push(newLine);
    } else if (activeTool === 'sticker' && currentSticker) {
        currentSticker.drag(startX, startY);
        items.push(currentSticker);
        currentSticker = null;
        activeTool = 'draw'; 
    }

    redoStack.length = 0;
    triggerDrawingChanged();
});

// Track mouse movements for drawing or dragging
canvas.addEventListener("mousemove", (event) => {
    cursor.x = event.offsetX;
    cursor.y = event.offsetY;

    if (isDraggingSticker && currentSticker) {
        currentSticker.drag(cursor.x, cursor.y);
    } else if (cursor.active && activeTool === 'draw') {
        const newX = event.offsetX;
        const newY = event.offsetY;
        const currentLine = items[items.length - 1] as MarkerLine;
        currentLine.drag(newX, newY);
    } else if (activeTool === 'draw') {
        toolPreview = new ToolPreview(currentThickness);
    }

    triggerToolMoved();
    triggerDrawingChanged();
});

// Stop drawing or dragging on mouse release
canvas.addEventListener("mouseup", () => {
    cursor.active = false;
    isDraggingSticker = false;
    currentSticker = null;
});

// Clear canvas button
clearButton.addEventListener("click", () => {
    items.length = 0;
    redoStack.length = 0;
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
});

// Undo functionality
undoButton.addEventListener("click", () => {
    if (items.length > 0) {
        const lastItem = items.pop();
        if (lastItem) {
            redoStack.push(lastItem);
        }
        triggerDrawingChanged();
    }
});

// Redo functionality
redoButton.addEventListener("click", () => {
    if (redoStack.length > 0) {
        const lastRedoItem = redoStack.pop();
        if (lastRedoItem) {
            items.push(lastRedoItem);
        }
        triggerDrawingChanged();
    }
});

// Set marker thickness 
thinButton.addEventListener("click", () => {
    currentThickness = 1;
});

thickButton.addEventListener("click", () => {
    currentThickness = 5;
});

// Sticker buttons 
stickerWineButton.addEventListener("click", () => {
    activeTool = 'sticker';
    currentSticker = new Sticker('🍷', cursor.x, cursor.y);
    triggerToolMoved();
});

stickerCocktailButton.addEventListener("click", () => {
    activeTool = 'sticker';
    currentSticker = new Sticker('🍸', cursor.x, cursor.y);
    triggerToolMoved();
});

stickerTropicalButton.addEventListener("click", () => {
    activeTool = 'sticker';
    currentSticker = new Sticker('🍹', cursor.x, cursor.y);
    triggerToolMoved();
});
