import webpackCompiler from 'webpack';
import pipe from 'multipipe';
const gulp = require('gulp');
const mergeStream = require('merge-stream');
const {jasmine, jasmineBrowser, plumber, processEnv} = require('gulp-load-plugins')();
const webpack = require('webpack-stream');
const del = require('del');
const portastic = require('portastic');
const minimist = require('minimist');
const {obj: through} = require('through2');

let port;

const Jasmine = {
  installOptions: {
    browserServerOptions: {},
    browserSpecRunnerOptions: {},
    getAdditionalAppAssets: () => [],
    headlessServerOptions: {},
    headlessSpecRunnerOptions: {},
    serverOptions: {},
    appGlobs: ['spec/app/**/*_spec.js'],
    serverGlobs: ['spec/server/**/*.js', 'spec/lib/**/*.js', 'spec/helpers/**/*.js']
  },

  install(installOptions = {}) {
    Object.assign(Jasmine.installOptions, installOptions);
    gulp.task('jasmine-clear', Jasmine.tasks.jasmineClear);
    gulp.task('jasmine-detect', Jasmine.tasks.jasmineDetect);
    gulp.task('jasmine-run', ['jasmine-clear'], Jasmine.tasks.jasmineRun);
    gulp.task('jasmine', ['jasmine-run']);
    gulp.task('spec-app-run', ['jasmine-detect'], Jasmine.tasks.specAppRun);
    gulp.task('spec-app', ['spec-app-run']);
    gulp.task('spec-server', Jasmine.tasks.specServer);
  },

  appAssets(options, gulpOptions = {}) {
    let javascript = gulp.src(Jasmine.installOptions.appGlobs, gulpOptions);
    if (options !== false) {
      const {plugins, ...rest} = options || {};
      let webpackConfig;
      try {
        webpackConfig = Jasmine.installOptions.webpack.test();
      } catch (e) {
        throw new Error(`Attempting to load webpack config for pui-react-tools, got error:
        ${e}
        Jasmine.install must be given config like {webpack: {test: () => {return webpackConfiguration}}}
        See https://github.com/pivotal-cf/pui-react-tools#jasmine
        
        `);
      }
      const testConfig = {...webpackConfig, ...rest};
      const config = {...testConfig, ...rest, ...{plugins: (testConfig.plugins || []).concat(plugins || [])}};
      javascript = javascript.pipe(webpack({config, quiet: true, watch: config.watch}, webpackCompiler));
    }

    return mergeStream(
      javascript,
      ...(Jasmine.installOptions.getAdditionalAppAssets())
    );
  },

  serverAssets(gulpOptions = {}) {
    return gulp.src(Jasmine.installOptions.serverGlobs, gulpOptions)
  },

  tasks: {
    jasmineClear() {
      return del('tmp/jasmine/**');
    },
    async jasmineDetect() {
      port = null;
      if (!await portastic.test(8888)) port = 8888;
    },
    jasmineRun() {
      const plugin = new (require('gulp-jasmine-browser/webpack/jasmine-plugin'))();
      const {browserServerOptions, browserSpecRunnerOptions} = Jasmine.installOptions;
      return Jasmine.appAssets({plugins: [plugin]})
        .pipe(plumber())
        .pipe(jasmineBrowser.specRunner(browserSpecRunnerOptions))
        .pipe(jasmineBrowser.server({whenReady: plugin.whenReady, ...browserServerOptions}))
        .pipe(gulp.dest('tmp/jasmine'));
    },
    specAppRun() {
      const {headlessServerOptions, headlessSpecRunnerOptions} = Jasmine.installOptions;
      const {file} = minimist(process.argv.slice(2), {string: 'file'});
      return (port ? gulp.src('tmp/jasmine/**/*') : Jasmine.appAssets({watch: false}))
        .pipe(jasmineBrowser.specRunner({console: true, ...headlessSpecRunnerOptions}))
        .pipe(jasmineBrowser.headless({driver: 'chrome', file, port, ...headlessServerOptions}))
        .pipe(through((data, enc, next) => next(null, data), flush => {
          port = null;
          flush();
        }));
    },
    specServer() {
      const env = processEnv({NODE_ENV: 'test'});
      return pipe(
        Jasmine.serverAssets(),
        env,
        jasmine({includeStackTrace: true, ...Jasmine.installOptions.serverOptions}),
        env.restore()
      );
    }
  }
};

export default Jasmine;