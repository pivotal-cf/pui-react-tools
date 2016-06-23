const {plumber, eslint, if: gulpIf} = require('gulp-load-plugins')();
const lazypipe = require('lazypipe');
const gulp = require('gulp');
const {log, colors} = require('gulp-util');

function lint() {
  const {FIX: fix = true} = process.env;
  return lazypipe()
    .pipe(() => plumber())
    .pipe(() => eslint({fix}))
    .pipe(() => eslint.format('stylish'))
    .pipe(() => gulpIf(file => {
          const fixed = file.eslint && typeof file.eslint.output === 'string';

          if(fixed) {
            log(colors.yellow(`fixed an error in ${file.eslint.filePath}`));
            return true;
          }
          return false;
        },
        gulp.dest('.'))
      )
    .pipe(() => eslint.failAfterError());
}

const Lint = {
  install(installOptions = {}) {
    Object.assign(Lint.installOptions, installOptions);
    gulp.task('lint', Lint.tasks.lint());
  },

  installOptions: {
    globs: ['gulpfile.js', 'app/**/*.js', 'helpers/**/*.js', 'server/**/*.js', 'spec/**/*.js', 'tasks/**/*.js', 'lib/**/*.js']
  },

  lint: lint(),

  tasks: {
    lint() {
      return function() {
        const globs = Lint.installOptions.globs;
        return gulp.src(globs, {base: '.'})
          .pipe(Lint.lint());
      };
    }
  }
};

module.exports = Lint;