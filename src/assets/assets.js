const del = require('del');
const File = require('vinyl');
const gulp = require('gulp');
const mergeStream = require('merge-stream');
const through2 = require('through2');
const path = require('path');
const plugins = require('gulp-load-plugins')();
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const {obj: from} = require('from2');
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

    gulp.task('assets', ['clean-assets'], Assets.tasks.assets);

    gulp.task('clean-assets-html', Assets.tasks.cleanAssetsHtml);

    gulp.task('assets-html', ['clean-assets-html'], Assets.tasks.assetsHtml);

    gulp.task('assets-config', Assets.tasks.assetsConfig);

    if (Assets.installOptions.useAssetsServer) {
      gulp.task('assets-server', Assets.tasks.assetsServer);
    }
  },

  installOptions: {
    assets: {},
    useAssetsServer: true,
    buildDirectory: 'public',
    getAdditionalAppAssets: () => [],
    htmlBuildDirectory: undefined,
    Layout: undefined
  },

  all({hotModule} = {}) {
    const {assets} = Assets.installOptions;
    const watch = isDevelopment();
    const streams = ['config', 'html', !hotModule && 'javascript', 'sass', 'images']
      .map((asset) => asset && (assets[asset] !== false) && Assets[asset]({watch}))
      .filter(Boolean)
      .concat(Assets.installOptions.getAdditionalAppAssets());

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
    const webpackConfig = require('../webpack/webpack.config')(process.env.NODE_ENV);
    const {assetPath, getEntry} = require('./asset_helper');
    const entry = getEntry(webpackConfig);
    const config = require('./config');
    let {assetHost, assetPort, scripts = ['application.js'], stylesheets = ['application.css'], title = 'The default title', useRevManifest} = config;
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
          const assetConfig = {assetHost, assetPort, useRevManifest};
          const stylesheetPaths = stylesheets.map(f => assetPath(f, assetConfig));
          const scriptPaths = [
            '/config.js',
            ...scripts.map(f => assetPath(f, assetConfig))
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
    return from(function() {
      const configContents = new File({
        path: 'config.js',
        contents: new Buffer(`window.${globalNamespace} = {config: ${configOptionsJSON}}`)
      });
      this.push(configContents);
      this.push(null);
    });
  },

  javascript(options = {}) {
    const webpackConfig = require('../webpack/webpack.config')(process.env.NODE_ENV, options);
    const {getEntry} = require('./asset_helper');
    const entry = getEntry(webpackConfig);

    const cssFilter = plugins.filter('*.css', {restore: true});
    return gulp.src([entry])
      .pipe(plugins.plumber())
      .pipe(webpack(webpackConfig, require('webpack')))
      .pipe(cssFilter)
      .pipe(plugins.autoprefixer())
      .pipe(cssFilter.restore);

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

    assetsServer: require('./assets_server'),

    assetsConfig() {
      Assets.config().pipe(gulp.dest(Assets.installOptions.buildDirectory));
    }
  }
};

module.exports = Assets;
