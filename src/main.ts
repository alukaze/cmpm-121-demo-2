import "./style.css";

const APP_NAME = "Game 2";
document.title = APP_NAME;

// DOM Elements
const app = document.querySelector<HTMLDivElement>("#app")!;
const canvas = document.getElementById("display") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

// Button Creation
const clearButton = document.createElement("button");
clearButton.textContent = "Clear";
document.body.appendChild(clearButton);

const undoButton = document.createElement("button");
undoButton.textContent = "Undo";
document.body.appendChild(undoButton);

const redoButton = document.createElement("button");
redoButton.textContent = "Redo";
document.body.appendChild(redoButton);

const thinButton = document.createElement("button");
thinButton.textContent = "Thin";
app.appendChild(thinButton);

const thickButton = document.createElement("button");
thickButton.textContent = "Thick";
app.appendChild(thickButton);

const exportButton = document.createElement("button");
exportButton.textContent = "Export";
document.body.appendChild(exportButton);

// Color Buttons
const redButton = document.createElement("button");
redButton.textContent = "Red";
app.appendChild(redButton);

const blueButton = document.createElement("button");
blueButton.textContent = "Blue";
app.appendChild(blueButton);

const greenButton = document.createElement("button");
greenButton.textContent = "Green";
app.appendChild(greenButton);

// Color Indicator Button
const colorIndicatorButton = document.createElement("button");
colorIndicatorButton.textContent = "Color: Black";
document.body.appendChild(colorIndicatorButton);

// Sticker Data and Creation
const stickerData = ["🍷", "🍸", "🍹"];
const customStickers: string[] = [];

// Default settings for drawing
let currentThickness = 2;
let currentColor = "black";
const colors = ["red", "blue", "green", "black"]; 

function updateColorIndicator() {
    colorIndicatorButton.textContent = `Color: ${currentColor}`;
}

function randomizeColor() {
    currentColor = colors[Math.floor(Math.random() * colors.length)];
    updateColorIndicator();
}

function createStickerButtons() {
    document.querySelectorAll(".sticker-button").forEach((button) => button.remove());
    [...stickerData, ...customStickers].forEach((emoji) => {
        const button = document.createElement("button");
        button.textContent = emoji;
        button.classList.add("sticker-button");
        button.addEventListener("click", () => selectSticker(emoji));
        app.appendChild(button);
    });
}

const customStickerButton = document.createElement("button");
customStickerButton.textContent = "Create Custom Sticker";
customStickerButton.addEventListener("click", () => {
    const customEmoji = prompt("Enter custom sticker emoji:", "🌟");
    if (customEmoji) {
        customStickers.push(customEmoji);
        createStickerButtons();
    }
});
document.body.appendChild(customStickerButton);

// Initial Stickers
createStickerButtons();

// Classes for Drawing and Stickers
class MarkerLine {
    private points: Array<{ x: number; y: number }> = [];
    private thickness: number;
    private color: string;

    constructor(x: number, y: number, thickness: number, color: string) {
        this.points.push({ x, y });
        this.thickness = thickness;
        this.color = color;
    }

    public drag(x: number, y: number) {
        this.points.push({ x, y });
    }

    public display(ctx: CanvasRenderingContext2D) {
        ctx.lineWidth = this.thickness;
        ctx.strokeStyle = this.color; // Set color
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        this.points.forEach(point => ctx.lineTo(point.x, point.y));
        ctx.stroke();
    }
}

class Sticker {
    constructor(private emoji: string, public x: number, public y: number) {}

    public drag(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public display(ctx: CanvasRenderingContext2D) {
        ctx.font = "30px Arial";
        ctx.fillText(this.emoji, this.x - 20, this.y + 15);
    }

    public isClicked(x: number, y: number): boolean {
        return (
            x >= this.x - 20 && x <= this.x + 20 &&
            y >= this.y - 15 && y <= this.y + 15
        );
    }
}

class ToolPreview {
    constructor(private thickness: number) {}

    public draw(ctx: CanvasRenderingContext2D, x: number, y: number) {
        ctx.beginPath();
        ctx.arc(x, y, this.thickness / 2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fill();
    }
}

// State Management and Drawing Functions
const items: Array<MarkerLine | Sticker> = [];
const redoStack: Array<MarkerLine | Sticker> = [];
const cursor = { active: false, x: 0, y: 0 };
let toolPreview: ToolPreview | null = null;
let currentSticker: Sticker | null = null;
let activeTool: "draw" | "sticker" = "draw";
let isDraggingSticker = false;

function selectSticker(emoji: string) {
    activeTool = "sticker";
    currentSticker = new Sticker(emoji, cursor.x, cursor.y);
    triggerToolMoved();
}

function triggerDrawingChanged() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    items.forEach(item => item.display(ctx));
    if (toolPreview && !cursor.active && activeTool === "draw") {
        toolPreview.draw(ctx, cursor.x, cursor.y);
    }
    if (currentSticker && !cursor.active && activeTool === "sticker") {
        currentSticker.display(ctx);
    }
}

function triggerToolMoved() {
    if (currentSticker) {
        currentSticker.drag(cursor.x, cursor.y);
    }
    triggerDrawingChanged();
}

// Event Listeners
canvas.addEventListener("mousedown", (event) => {
    cursor.active = true;
    const [startX, startY] = [event.offsetX, event.offsetY];

    for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        if (item instanceof Sticker && item.isClicked(startX, startY)) {
            currentSticker = item;
            isDraggingSticker = true;
            return;
        }
    }

    if (activeTool === 'draw') {
        const newLine = new MarkerLine(startX, startY, currentThickness, currentColor); // Use current color
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

canvas.addEventListener("mousemove", (event) => {
    [cursor.x, cursor.y] = [event.offsetX, event.offsetY];

    if (isDraggingSticker && currentSticker) {
        currentSticker.drag(cursor.x, cursor.y);
    } else if (cursor.active && activeTool === 'draw') {
        (items[items.length - 1] as MarkerLine).drag(cursor.x, cursor.y);
    } else if (activeTool === 'draw') {
        toolPreview = new ToolPreview(currentThickness);
    }

    triggerToolMoved();
});

canvas.addEventListener("mouseup", () => {
    cursor.active = false;
    isDraggingSticker = false;
    currentSticker = null;
});

// Button Actions
clearButton.addEventListener("click", () => {
    items.length = 0;
    redoStack.length = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

undoButton.addEventListener("click", () => {
    if (items.length > 0) redoStack.push(items.pop()!);
    triggerDrawingChanged();
});

redoButton.addEventListener("click", () => {
    if (redoStack.length > 0) items.push(redoStack.pop()!);
    triggerDrawingChanged();
});

thinButton.addEventListener("click", () => {
    currentThickness = 1;
    randomizeColor();
});

thickButton.addEventListener("click", () => {
    currentThickness = 5;
    randomizeColor();
});

// Set color change on button clicks
redButton.addEventListener("click", () => {
    currentColor = "red";
    updateColorIndicator();
});

blueButton.addEventListener("click", () => {
    currentColor = "blue";
    updateColorIndicator();
});

greenButton.addEventListener("click", () => {
    currentColor = "green";
    updateColorIndicator();
});

// Export Canvas to Image
exportButton.addEventListener("click", () => {
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = 1024;
    tempCanvas.height = 1024;
    const tempCtx = tempCanvas.getContext("2d")!;
    tempCtx.scale(4, 4);
    items.forEach(item => item.display(tempCtx));

    tempCanvas.toBlob((blob) => {
        if (blob) {
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "canvas_export.png";
            link.click();
            URL.revokeObjectURL(link.href);
        }
    }, "image/png");
});
