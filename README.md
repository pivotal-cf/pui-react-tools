#Tools for gulp tasks for React

There are four modules included in pui-react-tools:

* [Lint](#lint)
* [Jasmine](#jasmine)
* [Foreman](#foreman)
* [Assets](#assets)

## Lint

### Configuration

To use the lint module, include 
```js
const Lint = require('pui-react-tools').Lint;
Lint.install(options)
```

Define your lint rules in your local `.eslintrc` file.

#### Options

##### options.globs
`Type: String or Array`
`default: ['gulpfile.js', 'app/**/*.js', 'helpers/**/*.js', 'server/**/*.js', 'spec/**/*.js', 'tasks/**/*.js', 'lib/**/*.js']`

Glob or array of globs of files to lint.

### Usage

Run `gulp lint`.
    
## Jasmine

### Configuration

To use the jasmine module, include

```js
const Jasmine = require('pui-react-tools').Jasmine;
Jasmine.install(options);
```

#### Options

##### options.webpack
`Type: Object`
`default: none`

The `webpack` option must have a field `test`. `test` must be a function that returns webpack configuration when called. Example usage:

```js
Jasmine.install({
  webpack: {
    test: () => { return {
      entry: {spec: './spec/app/index.js'},
      module: {
        rules: [
          {test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel-loader'},
          {test: /css$/, loader: 'null-loader'}
        ]
      },
      output: {filename: '[name].js'}
    }}
  }
})
```

##### options.appGlobs
`Type: Array`
`default: ['spec/app/**/*_spec.js']`

The globs representing the Jasmine spec files for your application

##### options.serverGlobs
`Type: Array`
`default: ['spec/server/**/*.js', 'spec/lib/**/*.js', 'spec/helpers/**/*.js']`

The globs representing the Jasmine spec files for your server

##### options.getAdditionalAppAssets
`Type: Function`
`default: noop`

The `jasmine` and `spec-app` tasks load your spec files that match `'spec/app/**/*_spec.js'`.
The `getAdditionalAppAssets` option is a function that returns an 
array of streams of assets to include in addition to your spec files. 

Example
```js
options = {
 getAdditionalAppAssets: () => [gulp.src(require.resolve('phantomjs-polyfill'))]
}
```

##### options.serverOptions
`Type: Object`
`default: {}`

Options to pass to the spec server in node specs.
Example
```js
options = {
  serverOptions: {verbose: true}
};
```

##### options.browserSpecRunnerOptions
`Type: Object`
`default: {}`

Options to pass to the spec runner used in the browser.
Example
```js
options = {
  browserSpecRunnerOptions: {sourcemappedStacktrace: true}
};
```

##### options.headlessServerOptions
`Type: Object`
`default: {}`

Options to pass to the headless jasmine server.
Example
```js
options = {
  headlessServerOptions: {driver: 'slimerjs', random : true}
};
```

For additional options (e.g. `isVerbose`), see [gulp-jasmine-browser](https://github.com/jasmine/gulp-jasmine-browser) and [jasmine-terminal-reporter](https://github.com/jbblanchet/jasmine-terminal-reporter).

### Usage

* `gulp jasmine` starts the jasmine server. The server starts at port 8888 by default.
* `gulp spec-app` runs tests headlessly.
* `gulp spec-server` runs server specs. This task runs server specs from the following globs: 

    * 'spec/server/**/*.js'
    * 'spec/lib/**/*.js' 
    * 'spec/helpers/**/*.js'
    
## Foreman

### Configuration

To use the foreman module, include

```js
const Foreman = require('pui-react-tools').Foreman;
Foreman.install();
```

Specify configuration tasks for foreman to run in your `Procfile.dev` file. For example:

```
start: npm start
```

### Usage

Run `gulp foreman` to run foreman with your `Procfile.dev`.

To specify the port your server runs in, include a `.env` file in your root directory with configuration like

```sh
NODE_ENV=development
PORT=3000
```

## Assets

### Configuration

To use the assets module, include

```js
const Assets = require('pui-react-tools').Assets;
Assets.install(options);
```

The assets tasks expects:

* `config/application.json`
* `config/env.json` - whitelist of environment variables to include in your config
* `.babelrc`

Example files can be found in the [react-starter](https://github.com/pivotal-cf/react-starter) project in the `config` 
directory.

#### Options

Most configuration of the assets task is acheived by options given to `Assets.install`:
```js
const Assets = require('pui-react-tools').Assets;
Assets.install(options);
```
The available options are:

##### options.appGlobs
`Type: Array`
`default: ['./app/index.js]`

This is the glob of files passed into webpack when compiling your javascript. 

##### options.buildDirectory
`Type: String`
`default: 'public'`

Assets are built to the 'public' directory by default. If you would like to change the directory in which assets are
written, use the `buildDirectory` option.

##### options.webpack
`Type: Object`
`default: none`

The `webpack` option should have a key for each node environment you expect to need assets for (e.g. `production` and `developement`). These keys must be a functions that returns webpack configuration when called. Example usage:

```js
import UglifyJsPlugin from 'webpack/lib/optimize/UglifyJsPlugin';

Assets.install({
  webpack: {
    development: () => {
      return {
        entry: {application: './app/index.js'},
        module: {
          rules: [
            {test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel-loader'},
            {test: /css$/, loaders: ['style-loader', 'css-loader', 'sass-loader']}
          ]
        },
        output: {filename: '[name].js'}
      }
    },
    production: () => {
      return {
        entry: {application: './app/index.js'},
        module: {
          rules: [
            {test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel-loader'},
            {test: /css$/, loaders: ['style-loader', 'css-loader', 'sass-loader']}
          ]
        },
        output: {filename: '[name].js'},
        plugins: [new UglifyJsPlugin()]
      }
    }
  }
});
```

Note that for the example, you will need to install `sass-loader`, `css-loader` and `style-loader`. You will also need to install `babel-loader` and any related Babel plugins and presets you need, like `babel-preset-react`. See [react-starter](https://github.com/pivotal-cf/react-starter) for examples of more fully-featured webpack configurations.

#### User Application Configuration

To configure your application for different environment execution contexts, you can use `gulp assets-config`. This will generate a `config.js` file in the build directory.
 
Specify configuration you need for running your application in `config/application.json`. 
For environment-specific overrides, add files with the format `config/NODE_ENV.json` (e.g. `config/development.json`). Additionally, local environment variables whitelisted in `config/env.json` will be added to your configuration.

The generated `config.js` will be assign your configuration to a global variable in your browser. This variable will default to `Application`. If your configuration has a `globalNamespace` property, the global variable will have that name. Configuration will be accessible at `window.Application.config`, or `window[globalNamespace].config`.

If you would like to access the configuration inside of node, you can use `require('pui-react-tools/assets/config')()`

### Usage

* `gulp assets` This task builds your assets with Webpack and publishes them into `public`.
* `gulp assets-config` This task creates a `config.js` in the `public` directory.
* `gulp clean-assets` This task deletes all files in public directory, but keeps the directory.
