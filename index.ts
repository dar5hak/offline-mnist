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

context.canvas.addEventListener('mousedown', event => {
    isPainting = true;
    allStrokes.push({
        x: event.pageX - context.canvas.offsetLeft,
        y: event.pageY - context.canvas.offsetTop,
        clickDrag: true
    });
    redraw(context, allStrokes);
});

context.canvas.addEventListener('mousemove', event => {
    if (isPainting) {
        allStrokes.push({
            x: event.pageX - context.canvas.offsetLeft,
            y: event.pageY - context.canvas.offsetTop,
            clickDrag: true
        });
        redraw(context, allStrokes);
    }
});

context.canvas.addEventListener('mouseup', () => {
    isPainting = false;
});

context.canvas.addEventListener('mouseleave', () => {
    isPainting = false;
});

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
