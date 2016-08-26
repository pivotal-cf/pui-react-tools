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

* `pui-react-tools.js`
* `config/application.json`
* `config/env.json` - whitelist of environment variables to include in your config
* `.babelrc`
* `babel-loader` used in webpack config (and in `package.json`)

Example files can be found in the [react-starter](https://github.com/pivotal-cf/react-starter) project in the `config` 
directory.

#### Webpack Config

Pui React Tools uses Webpack to compile most assets. There is a lot of configuration required to do this correctly and a default configuration is provided.
If you would like to change the webpack configuration, you can store the option in a file `pui-react-tools.js`. This file should export an options object with the `webpack` key

```js
module.exports = {
  webpack: {
    base: {
      devtool: 'cheap-module-source-map'
    },
    test: {
      resolve: {
        alias: {
          'performance-now': `${__dirname}/spec/app/support/mock_performance_now.js`,
        }
      }
    }
  }
}
```

Within the `webpack` object, the `base` key represents Webpack options that are the defaults for every environment. 
There are also, `development`, `production`, and `test` objects that will override the Webpack defaults in those environments.
Note that there are internal environment specific overrides within Pui React Tools. 
This means that if you need to change Webpack config across all environments, you may have to specify it in `base`, but also, `production`, `development` or `test`.

#### Options

Most configuration of the assets task is acheived by options given to `Assets.install`:
```js
const Assets = require('pui-react-tools').Assets;
Assets.install(options);
```
The available options are:

##### options.assets

`Type: Object`
`default: {}`

Building assets by default includes `html`, `javascript`, `sass`, `images`, and `config`. If you would like to turn off any of these asset compilations, you can include the `assets` option.
Each asset will be compiled unless it is to `false`.

Example
```js
options = {
  assets: {
    config: false,
    sass: false
  }
}
```

##### options.getAdditionalAppAssets

`Type: Function`
`default: noop`

The assets tasks build a number of assets by default, listed below. 
If you would like to compile additional assets for your app (like external libraries),
use the `getAdditionalAppAssets` option. 
`getAdditionalAppAssets` is a function that returns an array of streams of assets.

Example
```js
options = {
 getAdditionalAppAssets: () => [gulp.src(require.resolve('moment'))]
}
```

##### options.buildDirectory

`Type: String`
`default: 'public'`

Assets are built to the 'public' directory by default. If you would like to change the directory in which assets are
written, use the `buildDirectory` option.

##### options.htmlBuildDirectory

`Type: String`
`default: buildDirectory ('public')`

It is also possible to specify where the `index.html` is written using the `htmlBuildDirectory` option. If no option is specified,
the `index.html` file will be written to the buildDirectory.

##### options.Layout

`Type: React Component`
`default: (component provided by this module)`

You can specify a path to a React component to use as the layout for your application. If you do not specify this option, 
a [layout file](https://github.com/pivotal-cf/pui-react-tools/blob/master/src/assets/layout.js) is provided for you.

To make building your Layout easier, the `Assets.Body` key allows you to access the Body component; a default
[body file](https://github.com/pivotal-cf/pui-react-tools/blob/master/src/assets/body.js) is provided. We have also
exposed `Assets.Layout` if you want to subclass the layout component.

#### User Application Configuration

Specify configuration you need for running your application in `config/application.json`. 
For environment-specific overrides, add files with the format `config/NODE_ENV.json` (e.g. `config/development.json`).

This configuration is largely intended to store keys related to your application domain, 
but the following keys are used when compiling assets.

| key | default | purpose |
| --- | --- | --- |
|`scripts`|`application.js`|scripts to load into `index.html`|
|`stylesheets`|`application.css`|stylesheets to load into `index.html`|
|`title`|'the default title'|HTML title of `index.html`|
|`assetHost`| '/' (production) 'localhost' (development) | The host to load assets from |
|`assetPort`| '' (production) '3001' (development) | The port on the host to load assets from |
|`hotModule`| false | Enable hot module loading |


#### Default Assets
Scripts and stylesheets are loaded from your application configuration.

Entry is loaded from your webpack config, specified in `pui-react-tools.js`. The acceptable formats are:

* `entry: './path/to/your/entryComponent.js'`
* `entry: ['./path/to/your/entryComponent.js', 'otherFile.js']`
* `entry: { application: './path/to/your/entryComponent.js'}`
* `entry: { application: ['./path/to/your/entryComponent.js', 'otherFile.js']}`

If you provide no entry path, the entry component defaults to `./app/components/application.js`.

##### html
    
An `index.html` file is created. This file renders your basic app and loads scripts and stylesheets.

We also provide a webpack loader to compile the html if you would prefer to combine all tasks into webpack.
The loader is accessed as 'pui-react-tools/assets/entry-loader'. Using it looks like

```js
require('babel!pui-react-tools/assets/entry-loader?name=application.html!./components/application');
```

This example will compile the html with the file './components/application.js' rendering the html inside the body. 

#### javascript

Compiles your JavaScript entry with Webpack (expecting the `babel-loader` plugin).

Any presets or plugins in your `.babelrc` need to be in your `package.json`. For example, see the [react-starter](https://github.com/pivotal-cf/react-starter)
`.babelrc` and `package.json` files.

If your JavaScript files require a `.css` or `.scss` file, the default Webpack configuration will handle those for you.
All `.css` files will be concatenated into a file called `components.css`. 
All `.scss` files will be compiled, changing the extension to `.css` but keeping the base name.
Assets required by css rules will also be included.

#### sass

Compiles `app/stylesheets/application.scss` with sass.

* In development mode, generates a sourcemap
* In production mode, minifies the css and adds vendor prefixes using [autoprefixer](https://github.com/postcss/autoprefixer)

If you require your `application.scss` file in your JavaScript, you do not need to compile sass separately.

#### images

sources images from `app/images/**/*`.

#### config

A `config.js` file is generated using the `globalNamespace` option in `config/application.json`. This file sets your
environment variables whitelisted in `config/env.json` so that they are accessible at `window.globalNamespace.config`.

If you do not provide a `globalNamespace`, `config.js` defaults to using the namespace of 'Application'.

### Usage

#### `gulp clean-assets`

This task deletes all files in public directory, but keeps the directory.

#### `gulp assets`

This task builds all of your assets and publishes them into `public`.
The assets used by this task are html, javascript, sass, images, config, and any additional assets specified in `getAdditionalAppAssets`.

This task watches all of your assets in development mode.

In production mode, `gulp assets` gzips and adds the cache-busting guid to the ends of all of your
filenames, producing the following versions of your files:

* original
* cachebusted
* cachebusted and gzipped

Outside of production mode, `gulp assets` only produces the original versions of your files.

#### `gulp assets-html`

This task builds `index.html` in the `public` directory. In development mode, this task will watch 
for changes and rebuild `index.html` when appropriate.

#### `gulp assets-server`

This task compiles all assets and starts an assets server to serve them. It watches for changes to assets.
The asset server will use `assetHost` and `assetPort` keys in your application configuration, defaulting to `localhost:3001`.  

Currently, files are loaded from `/tmp/public`. You should add this directory to your `.gitignore`.
   
#### `gulp assets-config`

This task creates a `config.js` in the `public` directory.
