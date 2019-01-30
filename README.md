#  Offline handwritten digit recognition

This small web app aims to demonstrate how machine learning models can be used
completely offline.

While the web resources (HTML, CSS and JS) are cached using a service worker,
the model and its weights are saved into IndexedDB using TensorFlow.js.
They are loaded from there wherever possible, while falling back to the
network if not found (for example, when the user clears the site data).

This way, after the first successful load on a modern browser, all resources
are available even without a network connection.

The model has been trained using the [mnist-node](https://github.com/tensorflow/tfjs-examples/tree/master/mnist-node) example code in [tfjs-examples](https://github.com/tensorflow/tfjs-examples) repository.


## Running the code

You need to have Node.js installed. In the project root directory, run these
commands:

```bash
npm install
npm start
```


## Creating a minified build

Assuming you have run `npm install` previously:

```bash
npm run build
```