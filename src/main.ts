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

// Drawing
const cursor = {active: false, x:0, y:0};

canvas.addEventListener("mousedown", (event) => {
    cursor.active = true;
    cursor.x = event.offsetX;
    cursor.y = event.offsetY;
  });


canvas.addEventListener("mousemove", (event) => {
    if (cursor.active) {
      ctx?.beginPath();
      ctx?.moveTo(cursor.x, cursor.y);
      ctx?.lineTo(event.offsetX, event.offsetY);
      ctx?.stroke();
      cursor.x = event.offsetX;
      cursor.y = event.offsetY;
    }
  });

  canvas.addEventListener("mouseup", (event) => {
    cursor.active = false;
  });

  clear.addEventListener("click", () => {
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
  });