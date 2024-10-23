import "./style.css";

const APP_NAME = "Game 2";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;

const title = document.createElement('h1');
title.textContent = 'Gamin';
app.appendChild(title);

const canvas = document.createElement('canvas');
app.appendChild(canvas);