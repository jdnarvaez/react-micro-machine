# react-micro-machine
React Components that facilitate the dynamic loading of other React Components from another server

See: [micro-frontends](http://micro-frontends.org)

# Usage

## BundledRemoteComponent

Use this component when you are loading a bundled file that is available in the global `window` context. Using the following options in a [Webpack](http://webpack.js.org) configuration will create a library that is accessible via `window.MyComponent`:

```
output: {
  filename: `my-component.js`,
  library: 'MyComponent',
  libraryExport: 'default',
  libraryTarget: 'window'
},
```

The following `props` make the assumption that the stylesheet and source routes are available and serve the appropriate assets generated from bundling the component above:

```
const props = {
  server : 'http://localhost:9000',
  stylesheet : '/api/v1/client/stylesheet', // returns a CSS stylesheet
  source : '/api/v1/client/source', // returns a bundled webpack JS file
  componentName : 'MyComponent' // Name of our component
};

ReactDOM.render(React.createElement(BundledRemoteComponent, props), document.getElementById('root'));
```

## ESMRemoteComponent

Use this component when you are loading a bundled file that is an ES6 Module that can be loaded via [dynamic import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import). In this case we do not need to know what the library name is, as the library is accessible from the dynamic import statement, instead of within the global window context.

```
output: {
  filename: `my-component.js`,
  library: 'MyComponent',
  libraryExport: 'default',
  libraryTarget: 'window'
},
```

The following `props` make the assumption that the stylesheet and source routes are available and serve the appropriate assets generated from bundling the component above:

```
const props = {
  server : 'http://localhost:9000',
  stylesheet : '/api/v1/client/stylesheet', // returns a CSS stylesheet
  source : '/api/v1/client/source', // returns a valid ES6 Module file
};

ReactDOM.render(React.createElement(ESMRemoteComponent, props), document.getElementById('root'));
```
