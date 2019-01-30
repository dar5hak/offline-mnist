import { avgPool, loadModel, Model, Rank, Tensor, tensor3d, Tensor3D } from '@tensorflow/tfjs';

const MODEL_INDEXEDDB_URL = 'indexeddb://mnist-model';
const MODEL_HTTP_URL = 'models/model.json';

export async function fetchModel(): Promise<Model> {
    try {
        // Try loading locally saved model
        const model = await loadModel(MODEL_INDEXEDDB_URL);
        console.log('Model loaded from IndexedDB');

        return model;
    } catch (error) {
        // If local load fails, get it from the server
        try {
            const model = await loadModel(window.location.href + MODEL_HTTP_URL);
            console.log('Model loaded from HTTP.');

            // Store the downloaded model locally for future use
            await model.save(MODEL_INDEXEDDB_URL);
            console.log('Model saved to IndexedDB.');

            return model;
        } catch (error) {
            console.error(error);
        }
    }
}

export function reduceInput(rawImageData: Uint8ClampedArray): Tensor3D {
    // Extract the alpha channel values from indices 3, 7, 11, ...
    const alphaValues = rawImageData.filter((_, index: number) => index % 4 === 3);

    // Using Uint8Array because tfjs doesn't yet support Uint8ClampedArray
    // Correponding issue: https://github.com/tensorflow/tfjs/issues/757
    const alphaTensor = tensor3d(Uint8Array.from(alphaValues), [280, 280, 1], 'float32');

    // Pool every 10*10 filter into a single pixel,
    // thus reducing the dimensions from 280*280 to 28*28
    return avgPool(alphaTensor, 10, 10, 'same');
}

export async function predict(input: Tensor3D, model: Model) {
    const prediction = model.predict(input.reshape([1, 28, 28, 1])) as Tensor<Rank>;
    const result = await prediction.argMax(1).data();
    return result[0];
}
