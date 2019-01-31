import { Model } from '@tensorflow/tfjs';
import { fetchModel, predict, reduceInput } from './predict';

// Types
interface DrawPoint {
    x: number;
    y: number;
    clickDrag: boolean;
}

// Elements
const context = (document.getElementById('draw-area') as HTMLCanvasElement).getContext('2d');
const clearButton = document.getElementById('clear-button');
const predictButton = document.getElementById('predict-button');
const predictionOutputLabel = document.getElementById('prediction-label');
const predictionOutputArea = document.getElementById('prediction-output');

// State variables
const allStrokes: Array<DrawPoint> = [];
let isPainting = false;
let model: Model;

function redraw(ctx: CanvasRenderingContext2D, strokes: Array<DrawPoint>) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.strokeStyle = 'sienna';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 15;

    for (let i = 0; i < strokes.length; i++) {
        ctx.beginPath();

        if (i && strokes[i].clickDrag) {
            ctx.moveTo(strokes[i - 1].x, strokes[i - 1].y);
        } else {
            ctx.moveTo(strokes[i].x - 1, strokes[i].y);
        }

        ctx.lineTo(strokes[i].x, strokes[i].y);
        ctx.closePath();
        ctx.stroke();
    }
}

function handleStart(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    isPainting = true;
    const x = (event instanceof MouseEvent ?
        event.pageX :
        event.changedTouches[0].pageX) - context.canvas.offsetLeft;
    const y = (event instanceof MouseEvent ?
        event.pageY :
        event.changedTouches[0].pageY) - context.canvas.offsetTop;
    allStrokes.push({ x, y, clickDrag: true });
    redraw(context, allStrokes);
}

function handleMove(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    if (isPainting) {
        const x = (event instanceof MouseEvent ?
            event.pageX :
            event.changedTouches[0].pageX) - context.canvas.offsetLeft;
        const y = (event instanceof MouseEvent ?
            event.pageY :
            event.changedTouches[0].pageY) - context.canvas.offsetTop;
        allStrokes.push({ x, y, clickDrag: true });
        redraw(context, allStrokes);
    }
}

function handleEnd(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    isPainting = false;
}

context.canvas.addEventListener('mousedown', handleStart);
context.canvas.addEventListener('mousemove', handleMove);
context.canvas.addEventListener('mouseup', handleEnd);
context.canvas.addEventListener('mouseleave', handleEnd);

context.canvas.addEventListener('touchstart', handleStart);
context.canvas.addEventListener('touchmove', handleMove);
context.canvas.addEventListener('touchend', handleEnd);
context.canvas.addEventListener('touchcancel', handleEnd);

clearButton.addEventListener('click', () => {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    allStrokes.length = 0;
});

predictButton.addEventListener('click', () => {
    const imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height).data;
    const input = reduceInput(imageData);
    (async () => {
        await load();
        const data = await predict(input, model);
        predictionOutputLabel.hidden = false;
        predictionOutputArea.innerText = `${data}`;
    })();
});

async function load() {
    try {
        model = await fetchModel();
        predictButton.removeAttribute('disabled');
        predictButton.textContent = 'Predict';
    } catch (error) {
        console.log(error);
    }
}

load();
