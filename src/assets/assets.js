const del = require('del');
const File = require('vinyl');
const gulp = require('gulp');
const mergeStream = require('merge-stream');
const through2 = require('through2');
const path = require('path');
const plugins = require('gulp-load-plugins')();
/* eslint-disable no-unused-vars */
const React = require('react');
const ReactDOMServer = require('react-dom/server');
/* eslint-enable no-unused-vars */
const webpack = require('webpack-stream');

function isDevelopment() {
  return process.env.NODE_ENV === 'development';
}

function isProduction() {
  return process.env.NODE_ENV === 'production';
}

const Assets = {
  install() {
    gulp.task('clean-assets', Assets.tasks.cleanAssets);

    gulp.task('clean-assets-server', Assets.tasks.cleanAssetsServer);

    gulp.task('assets', ['clean-assets'], Assets.tasks.assets);

    gulp.task('build-assets-server', ['clean-assets-server'], function() {
      Assets.all({hotModule: true})
        .pipe(gulp.dest(path.join('tmp', 'public')))
        .pipe(plugins.livereload({start: true}));
    });

    gulp.task('assets-html', Assets.tasks.buildHtml);

    gulp.task('assets-server', ['build-assets-server'], Assets.tasks.buildAssetsServer);
  },

  all({hotModule} = {}) {
    const watch = isDevelopment();
    const streams = [
      Assets.html({watch}),
      !hotModule && Assets.javascript({watch}),
      Assets.sass({watch})
    ].filter(Boolean);
    return mergeStream(...streams);
  },

  sass({watch = false} = {}) {
    let stream = gulp.src(path.join('app', 'stylesheets', 'application.scss')).pipe(plugins.plumber());
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

  html({watch = false} = {}) {
    let {entry = ['app/components/application.js'], hotModule, assetHost, assetPort, scripts = ['application.js'], stylesheets = ['application.css'], title = 'The default title'} = require('./config');
    const {assetPath} = require('./asset_helper');
    let stream = gulp.src(entry).pipe(plugins.plumber());

    if(watch) {
      stream = stream.pipe(plugins.watch('app/**/*.js'));
    }

    const entryPath = path.join(process.cwd(), entry[0]);

    return stream
      .pipe(through2.obj(function(file, enc, callback) {
        [entryPath, file.path, './layout'].map(require.resolve).forEach(f => delete require.cache[f]);

        const Layout = require('./layout');
        const assetConfig = {assetHost, assetPort};
        const stylesheetPaths = stylesheets.map(f => assetPath(f, assetConfig));
        const scriptPaths = [hotModule && 'client.js', ...scripts].filter(Boolean).map(f => assetPath(f, assetConfig));
        const entryComponent = require(entryPath);
        const props = {entry: entryComponent, scripts: scriptPaths, stylesheets: stylesheetPaths, title};
        const html = ReactDOMServer.renderToStaticMarkup(<Layout {...props}/>);
        const indexFile = new File({
          path: 'index.html',
          contents: new Buffer(html)
        });
        callback(null, indexFile);
      }));
  },

  javascript(options = {}) {
    const webpackConfig = Object.assign({}, require(path.join(process.cwd(), 'config', 'webpack.config'))(process.env.NODE_ENV), options);
    return gulp.src(['app/components/application.js'])
      .pipe(plugins.plumber())
      .pipe(webpack(webpackConfig));
  },

  tasks: {
    cleanAssets(done){del(['public/*', '!public/.gitkeep']).then(() => done(), done)},

    cleanAssetsServer(done){del(['tmp/public/**/*']).then(() => done(), done)},

    assets() {
      const stream = Assets.all();
      if (!isProduction()) return stream.pipe(gulp.dest('public'));
      const cloneSink = plugins.clone.sink();
      return stream
        .pipe(gulp.dest('public'))
        .pipe(plugins.rev())
        .pipe(plugins.revCssUrl())
        .pipe(cloneSink)
        .pipe(gulp.dest('public'))
        .pipe(plugins.rev.manifest())
        .pipe(gulp.dest('public'))
        .pipe(cloneSink.tap())
        .pipe(plugins.gzip())
        .pipe(gulp.dest('public'));
    },

    buildHtml() {
      const watch = isDevelopment();
      Assets.html({watch}).pipe(gulp.dest('public'));
    },

    buildAssetsServer() {
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
    }
  }
};

module.exports = Assets;