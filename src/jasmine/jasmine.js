const gulp = require('gulp');
const mergeStream = require('merge-stream');
const {jasmine, jasmineBrowser, plumber, processEnv} = require('gulp-load-plugins')();
const webpack = require('webpack-stream');
const pipe = require('multipipe');

const Jasmine = {
  installOptions: {
    browserAppAssetsOptions: {},
    browserServerOptions: {},
    browserSpecRunnerOptions: {},
    getAdditionalAppAssets: () => [],
    headlessAppAssetsOptions: {},
    headlessServerOptions: {},
    headlessSpecRunnerOptions: {},
    serverOptions: {},
    appGlobs: ['spec/app/**/*_spec.js'],
    serverGlobs: ['spec/server/**/*.js', 'spec/lib/**/*.js', 'spec/helpers/**/*.js']
  },

  install(installOptions = {}) {
    Object.assign(Jasmine.installOptions, installOptions);
    gulp.task('jasmine', Jasmine.tasks.jasmine);
    gulp.task('spec-app', Jasmine.tasks.specApp);
    gulp.task('spec-server', Jasmine.tasks.specServer);
  },

  appAssets(options, gulpOptions = {}) {
    let javascript = gulp.src(Jasmine.installOptions.appGlobs, gulpOptions).pipe(plumber());

    if (options !== false) {
      const {plugins, ...rest} = options || {};
      const testConfig = require('../webpack/webpack.config')('test', rest);
      const webpackConfig = Object.assign({}, testConfig, options, {plugins: (testConfig.plugins || []).concat(plugins || [])});
      delete webpackConfig.browserAppAssetsOptions;
      javascript = javascript.pipe(webpack(webpackConfig, require('webpack')));
    }

    return mergeStream(
      javascript,
      gulp.src(require.resolve('./jasmine.css'), gulpOptions),
      ...(Jasmine.installOptions.getAdditionalAppAssets())
    );
  },

  serverAssets(gulpOptions = {}) {
    return gulp.src(Jasmine.installOptions.serverGlobs, gulpOptions)
      .pipe(plumber());
  },

  tasks: {
    jasmine() {
      const plugin = new (require('gulp-jasmine-browser/webpack/jasmine-plugin'))();
      const {browserAppAssetsOptions, browserServerOptions, browserSpecRunnerOptions} = Jasmine.installOptions;
      return Jasmine.appAssets({plugins: [plugin], browserAppAssetsOptions})
        .pipe(jasmineBrowser.specRunner(browserSpecRunnerOptions))
        .pipe(jasmineBrowser.server({whenReady: plugin.whenReady, ...browserServerOptions}));
    },
    specApp() {
      const {headlessAppAssetsOptions, headlessServerOptions, headlessSpecRunnerOptions} = Jasmine.installOptions;
      return Jasmine.appAssets({watch: false, ...headlessAppAssetsOptions})
        .pipe(jasmineBrowser.specRunner({console: true, ...headlessSpecRunnerOptions}))
        .pipe(jasmineBrowser.headless({driver: 'phantomjs', ...headlessServerOptions}));
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

module.exports = Jasmine;
