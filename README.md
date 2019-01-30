#  Offline handwritten digit recognition

This small web app aims to demonstrate how machine learning models can be used
completely offline.

While the web resources (HTML, CSS and JS) are cached using a service worker,
the model and its weights are saved into IndexedDB using TensorFlow.js.
They are loaded from there wherever possible, while falling back to the
network if not found (for example when the user clears the site data).

This way, after the first successful load on a modern browser, all resources
are available even without a network connection.


## Running the code

```bash
npm install
npm start
```


## Creating a minified build

```bash
npm run build
```