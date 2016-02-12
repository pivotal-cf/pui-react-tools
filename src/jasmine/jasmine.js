const gulp = require('gulp');
const mergeStream = require('merge-stream');
const {jasmineBrowser, plumber} = require('gulp-load-plugins')();
const webpack = require('webpack-stream');
const path = require('path');

const Jasmine = {
  installConfig: {},

  install(config = {}) {
    Jasmine.installConfig = config;
    gulp.task('spec-app', Jasmine.tasks.specApp);

    gulp.task('jasmine', Jasmine.tasks.jasmine);
  },

  appAssets(options = {}) {
    const testConfig = require(path.resolve(process.cwd(), 'config', 'webpack.config'))('test');
    const config = Object.assign({}, testConfig, options, {plugins: (testConfig.plugins || []).concat(options.plugins || [])});
    const javascript = gulp.src(['spec/app/**/*_spec.js'])
      .pipe(plumber())
      .pipe(webpack(config));
    return mergeStream(
      javascript,
      gulp.src(require.resolve('./jasmine.css')),
      ...(Jasmine.installConfig.additionalAppAssets || [])
    );
  },

  tasks: {
    jasmine() {
      const plugin = new (require('gulp-jasmine-browser/webpack/jasmine-plugin'))();
      return Jasmine.appAssets({plugins: [plugin]})
        .pipe(jasmineBrowser.specRunner())
        .pipe(jasmineBrowser.server({whenReady: plugin.whenReady}));
    },
    specApp() {
      return Jasmine.appAssets({watch: false})
        .pipe(jasmineBrowser.specRunner({console: true}))
        .pipe(jasmineBrowser.headless({driver: 'phantomjs'}));
    }
  }
};

module.exports = Jasmine;
