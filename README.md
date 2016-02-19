#Tools for gulp tasks for React

There are four modules included in pui-react-tools:

* [Lint](#lint)
* [Jasmine](#jasmine)
* [Foreman](#foreman)
* [Assets](#assets)

## Lint

### Configuration

To use the lint module, include 
```
const Lint = require('pui-react-tools').Lint;
Lint.install()
```

The `lint` module's install method accepts an object containing additional options. Specify these options as an object
under the `installOptions` key. The value for the `installOptions` key must be an object with a key of `globs`.The 
`globs` key expects an array of files and file patterns that will be linted.

If no options are specified, `installOptions` looks like the following:

```
const installOptions = {
    globs: ['gulpfile.js', 'app/**/*.js', 'helpers/**/*.js', 'server/**/*.js', 'spec/**/*.js', 'tasks/**/*.js', 'lib/**/*.js']
}
```
        
Define your lint rules in your local `.eslintrc` file.

### Usage

Run `gulp lint`.
    
## Jasmine

### Configuration

To use the jasmine module, include

```
const Jasmine = require('pui-react-tools').Jasmine;
Jasmine.install();
```

The `jasmine` module's install method accepts an object containing additional options. Specify these options as an object
under the `getAdditionalAppAssets` key. The value for the `getAdditionalAppAssets` key is a function that returns an 
array of options to execute at runtime.

The `jasmine` task looks for your test files in 'spec/app/**/*_spec.js'.

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

```
const Foreman = require('pui-react-tools').Foreman;
Foreman.install();
```

Specify configuration tasks for foreman to run in your `Procfile.dev` file. For example:

```
start: npm start
```

### Usage

Run `gulp foreman` to run foreman with your `Procfile.dev`.

## Assets Module

### Configuration

To use the assets module, include

```
const Assets = require('pui-react-tools').Assets;
Assets.install();
```

The `assets` module's install method accepts an object containing additional options. Specify these options as an object
under the `getAdditionalAppAssets` key. The assets tasks expects:

* webpack.config
* application.json
* env.json - whitelist of environment variables to include in your config

Example files can be found in the [react-starter](https://github.com/pivotal-cf/react-starter) project in the `config` 
directory. Webpack might need a babel plugin. Use a `.babelrc` file to specify babel configurations.

The assets are gathered as follows:

#### html
    
The `gulp assets` task compiles the `index.html` file for you.

* Scripts, stylesheets, and entry are loaded from your configuration, using the following defaults:
    * Scripts are loaded from `application.js`. hotModule loading is enabled in development mode.
    * Stylesheets are loaded from `application.css`.

#### javascript

The entrypoint to your application is specified in your configuration and defaults to `app/components/application.js`.
This is the root of all of the javascript that runs in your code.
`gulp assets` uses `app/components/application.js` by default.

Any presets or plugins in your `.babelrc` need to be in your `package.json`. For example, see the [react-starter](https://github.com/pivotal-cf/react-starter)
`.babelrc` and `package.json` files.

#### sass

`gulp assets` uses `app/stylesheets/application.scss` as the source for sass files.

* In development mode, the task generates a sourcemap.
* In production mode, the task minifies and adds vendor prefixes using [autoprefixer](https://www.npmjs.com/package/gulp-autoprefixer).

#### images

`gulp assets` sources images from `app/images/**/*`.


### Usage

#### `gulp clean-assets`

This task deletes all files in public directory, but keeps the directory.

#### `gulp assets`

This task merges all of your application's assets into a stream, then copies the stream into a directory called `public`.
The assets used by this task are config, html, javascript, sass, images, and any additional assets specified in `getAdditionAppAssets`.

This task watches all of your assets when you have specified development mode.

If you have specified production mode, `gulp assets` gzips and adds the cache-busting guid to the ends of all of your
filenames, producing the following versions of your files:

* original
* cachebusted
* cachebusted and gzipped

If you have not specified production mode, `gulp assets` only produces the original versions of your files.

#### `gulp assets-html`

This task pipes the html assets into `public` directory. If you have specified development mode, this task watches all
of your html assets.

#### `gulp assets-server`

This task starts the assets server, using the values in your configuration to find which host and port to run the server on.

By default, the assets server will run on `localhost:3001` with hotModule loading enabled.

Currently, files are loaded from `/tmp/public`. You should add this directory to your `.gitignore`.
   
#### `gulp assets-config`

This task overrides the `config.js` file and puts it in the `public` directory.
