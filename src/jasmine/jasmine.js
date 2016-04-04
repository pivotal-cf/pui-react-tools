const gulp = require('gulp');
const mergeStream = require('merge-stream');
const {jasmine, jasmineBrowser, plumber, processEnv} = require('gulp-load-plugins')();
const webpack = require('webpack-stream');

const Jasmine = {
  installOptions: {
    getAdditionalAppAssets: () => [],
    headlessConfig: {}
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
    const javascript = gulp.src(['spec/app/**/*_spec.js'])
      .pipe(plumber())
      .pipe(webpack(webpackConfig));
    return mergeStream(
      javascript,
      gulp.src(require.resolve('./jasmine.css')),
      ...(Jasmine.installOptions.getAdditionalAppAssets())
    );
  },

  serverAssets() {
    return gulp.src(['spec/server/**/*.js', 'spec/lib/**/*.js', 'spec/helpers/**/*.js'])
      .pipe(plumber());
  },

  tasks: {
    jasmine() {
      const plugin = new (require('gulp-jasmine-browser/webpack/jasmine-plugin'))();
      return Jasmine.appAssets({plugins: [plugin]})
        .pipe(jasmineBrowser.specRunner())
        .pipe(jasmineBrowser.server({whenReady: plugin.whenReady}));
    },
    specApp() {
      const {headlessConfig} = Jasmine.installOptions;
      return Jasmine.appAssets({watch: false})
        .pipe(jasmineBrowser.specRunner({console: true}))
        .pipe(jasmineBrowser.headless({driver: 'phantomjs', ...headlessConfig}));
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
