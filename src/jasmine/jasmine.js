const gulp = require('gulp');
const mergeStream = require('merge-stream');
const {jasmine, jasmineBrowser, plumber, processEnv} = require('gulp-load-plugins')();
const webpack = require('webpack-stream');
const path = require('path');

const Jasmine = {
  installConfig: {
    getAdditionalAppAssets: () => []
  },

  install(installOptions = {}) {
    Object.assign(Jasmine.installConfig, installOptions);
    gulp.task('jasmine', Jasmine.tasks.jasmine);
    gulp.task('spec-app', Jasmine.tasks.specApp);
    gulp.task('spec-server', Jasmine.tasks.specServer);
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
      ...(Jasmine.installConfig.getAdditionalAppAssets())
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
      return Jasmine.appAssets({watch: false})
        .pipe(jasmineBrowser.specRunner({console: true}))
        .pipe(jasmineBrowser.headless({driver: 'phantomjs'}));
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
