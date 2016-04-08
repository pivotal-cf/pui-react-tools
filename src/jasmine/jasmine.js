const gulp = require('gulp');
const mergeStream = require('merge-stream');
const {jasmine, jasmineBrowser, plumber, processEnv} = require('gulp-load-plugins')();
const webpack = require('webpack-stream');

const Jasmine = {
  installOptions: {
    browserAppAssetsOptions: {},
    browserServerOptions: {},
    browserSpecRunnerOptions: {},
    getAdditionalAppAssets: () => [],
    headlessAppAssetsOptions: {},
    headlessServerOptions: {},
    headlessSpecRunnerOptions: {},
    appGlobs: ['spec/app/**/*_spec.js'],
    serverGlobs: ['spec/server/**/*.js', 'spec/lib/**/*.js', 'spec/helpers/**/*.js']
  },

  install(installOptions = {}) {
    Object.assign(Jasmine.installOptions, installOptions);
    gulp.task('jasmine', Jasmine.tasks.jasmine);
    gulp.task('spec-app', Jasmine.tasks.specApp);
    gulp.task('spec-server', Jasmine.tasks.specServer);
  },

  appAssets(options = {}) {
    const {plugins, ...rest} = options;
    const testConfig = require('../webpack/webpack.config')('test', rest);
    const webpackConfig = Object.assign({}, testConfig, options, {plugins: (testConfig.plugins || []).concat(plugins || [])});
    const javascript = gulp.src(Jasmine.installOptions.appGlobs)
      .pipe(plumber())
      .pipe(webpack(webpackConfig));
    return mergeStream(
      javascript,
      gulp.src(require.resolve('./jasmine.css')),
      ...(Jasmine.installOptions.getAdditionalAppAssets())
    );
  },

  serverAssets() {
    return gulp.src(Jasmine.installOption.serverGlobs)
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
    specServer(){
      const env = processEnv({NODE_ENV: 'test'});
      return Jasmine.serverAssets()
        .pipe(env)
        .pipe(jasmine({includeStackTrace: true}))
        .pipe(env.restore());
    }
  }
};

module.exports = Jasmine;
