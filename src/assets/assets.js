const del = require('del');
const File = require('vinyl');
const gulp = require('gulp');
const mergeStream = require('merge-stream');
const through2 = require('through2');
const path = require('path');
const plugins = require('gulp-load-plugins')();
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const {readable} = require('event-stream');
const spy = require('through2-spy');
const webpack = require('webpack-stream');

function isDevelopment() {
  return process.env.NODE_ENV === 'development';
}

function isProduction() {
  return process.env.NODE_ENV === 'production';
}

const Assets = {
  Layout: require('./layout'),

  Body: require('./body'),

  install(options = {}) {
    Object.assign(Assets.installOptions, options);
    gulp.task('clean-assets', Assets.tasks.cleanAssets);

    gulp.task('clean-assets-server', Assets.tasks.cleanAssetsServer);

    gulp.task('assets', ['clean-assets'], Assets.tasks.assets);

    gulp.task('build-assets-server', ['clean-assets-server'], function() {
      Assets.all({hotModule: true})
        .pipe(gulp.dest(path.join('tmp', 'public')))
        .pipe(plugins.livereload({start: true}));
    });

    gulp.task('clean-assets-html', Assets.tasks.cleanAssetsHtml);

    gulp.task('assets-html', ['clean-assets-html'], Assets.tasks.assetsHtml);

    gulp.task('assets-config', Assets.tasks.assetsConfig);

    gulp.task('assets-server', ['build-assets-server'], Assets.tasks.assetsServer);
  },

  installOptions: {
    getAdditionalAppAssets: () => [],
    buildDirectory: 'public',
    htmlBuildDirectory: undefined,
    Layout: undefined
  },

  all({hotModule} = {}) {
    const watch = isDevelopment();
    const streams = [
      Assets.config(),
      Assets.html({watch}),
      !hotModule && Assets.javascript({watch}),
      Assets.sass({watch}),
      Assets.images({watch}),
      ...Assets.installOptions.getAdditionalAppAssets()
    ].filter(Boolean);
    return mergeStream(...streams);
  },

  sass({watch = false} = {}) {
    let stream = gulp.src(['app/stylesheets/application.scss']).pipe(plugins.plumber());
    if (watch) {
      gulp.src('app/stylesheets/**/*.scss').pipe(plugins.progeny());
      stream = stream.pipe(plugins.watch('app/stylesheets/**/*.scss'))
      .pipe(plugins.progeny());
    }
    return stream
      .pipe(plugins.cond(!isProduction(), () => plugins.sourcemaps.init()))
      .pipe(plugins.sass({errLogToConsole: true}))
      .pipe(plugins.autoprefixer())
      .pipe(plugins.cond(!isProduction(), () => plugins.sourcemaps.write()))
      .pipe(plugins.cond(isProduction(), () => plugins.cssnano()));
  },

  images({watch = false} = {}) {
    let stream = gulp.src('app/images/**/*', {base: '.'});
    if (watch) stream = stream.pipe(plugins.watch('app/images/*'));
    return stream.pipe(plugins.rename({dirname: 'images'}));
  },

  html({watch = false} = {}) {
    const webpackConfig = require(path.join(process.cwd(), 'config', 'webpack.config'))(process.env.NODE_ENV);
    const {assetPath, getEntry} = require('./asset_helper');
    const entry = getEntry(webpackConfig);
    const config = require('./config');
    let {hotModule, assetHost, assetPort, scripts = ['application.js'], stylesheets = ['application.css'], title = 'The default title'} = config;
    let stream = gulp.src(entry).pipe(plugins.plumber());

    if(watch) {
      stream = stream.pipe(plugins.watch('app/**/*.js'));
    }

    const entryPath = path.join(process.cwd(), entry);

    return stream
      .pipe(through2.obj(function(file, enc, callback) {
        [entryPath, file.path, './layout'].map(require.resolve).forEach(f => delete require.cache[f]);
        try {
          const Layout = Assets.installOptions.Layout || Assets.Layout;
          const assetConfig = {assetHost, assetPort};
          const stylesheetPaths = stylesheets.map(f => assetPath(f, assetConfig));
          const scriptPaths = [
            '/config.js',
            ...[hotModule && 'client.js', ...scripts].filter(Boolean).map(f => assetPath(f, assetConfig))
          ];
          const entryComponent = require(entryPath);
          const props = {entry: entryComponent, scripts: scriptPaths, stylesheets: stylesheetPaths, title, config};
          const html = `<!doctype html>${ReactDOMServer.renderToStaticMarkup(<Layout {...props}/>)}`;
          const indexFile = new File({
            path: 'index.html',
            contents: new Buffer(html)
          });
          callback(null, indexFile);
        } catch(e) {
          callback(e);
        }
      }));
  },

  config() {
    let configOptions = require('./config');
    const globalNamespace = configOptions.globalNamespace || 'Application';
    let configOptionsJSON = JSON.stringify(configOptions);
    return readable(function(_, cb) {
      const configContents = new File({
        path: 'config.js',
        contents: new Buffer(`window.${globalNamespace} = {config: ${configOptionsJSON}}`)
      });
      this.emit('data', configContents);
      this.emit('end');
      cb();
    });
  },

  javascript(options = {}) {
    const webpackConfig = Object.assign({}, require(path.join(process.cwd(), 'config', 'webpack.config'))(process.env.NODE_ENV), options);
    const {getEntry} = require('./asset_helper');
    const entry = getEntry(webpackConfig);

    return gulp.src([entry])
      .pipe(plugins.plumber())
      .pipe(webpack(webpackConfig));
  },

  tasks: {
    cleanAssets(done){
      const {buildDirectory} = Assets.installOptions;
      del([
        `${buildDirectory}/*`,
        `!${buildDirectory}/.gitkeep`
      ]).then(() => done(), done);
    },

    cleanAssetsHtml(done){
      const {buildDirectory} = Assets.installOptions;
      const htmlBuildDirectory = Assets.installOptions.htmlBuildDirectory || buildDirectory;
      del([`${htmlBuildDirectory}/index.html`]).then(() => done(), done);
    },

    cleanAssetsServer(done){del(['tmp/public/**/*']).then(() => done(), done);},

    assets() {
      const stream = Assets.all();
      const {buildDirectory} = Assets.installOptions;
      if (!isProduction()) return stream.pipe(gulp.dest(buildDirectory));
      const cloneSink = plugins.clone.sink();
      return stream
        .pipe(gulp.dest(buildDirectory))
        .pipe(plugins.rev())
        .pipe(plugins.revCssUrl())
        .pipe(cloneSink)
        .pipe(gulp.dest(buildDirectory))
        .pipe(plugins.rev.manifest())
        .pipe(gulp.dest(buildDirectory))
        .pipe(cloneSink.tap())
        .pipe(plugins.gzip())
        .pipe(gulp.dest(buildDirectory));
    },

    assetsHtml(done) {
      const watch = isDevelopment();
      const {buildDirectory, htmlBuildDirectory = buildDirectory} = Assets.installOptions;
      let once = false;
      Assets.html({watch})
        .pipe(gulp.dest(htmlBuildDirectory))
        .pipe(spy.obj(function(chunk) {
          if (once) return;
          if (chunk.path.match(/index\.html/)) {
            once = true;
            done();
          }
        }));
    },

    assetsServer() {
      const {assetHost = 'localhost', assetPort = 3001} = require('./config');
      const webpack = require('webpack');
      const WebpackDevServer = require('webpack-dev-server');
      const client = `webpack-dev-server/client?http://${assetHost}:${assetPort}`;
      const publicPath = `//${assetHost}:${assetPort}/`;
      let {entry, output, ...webpackConfig} = require(path.join(process.cwd(), 'config', 'webpack.config'))(process.env.NODE_ENV);
      webpackConfig = {...webpackConfig, entry: {...entry, client}, output: {...output, publicPath}};
      const server = new WebpackDevServer(webpack(webpackConfig), {
        contentBase: path.join('.', 'tmp', 'public'),
        headers: {'Access-Control-Allow-Origin': '*'},
        hot: true,
        publicPath,
        quiet: true
      });
      server.listen(assetPort, assetHost);
    },

    assetsConfig() {
      Assets.config().pipe(gulp.dest(Assets.installOptions.buildDirectory));
    }
  }
};

module.exports = Assets;
