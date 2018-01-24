const {eslint, if: gulpIf} = require('gulp-load-plugins')();
const gulp = require('gulp');
const {log, colors} = require('gulp-util');

const Lint = {
  install(installOptions = {}) {
    Object.assign(Lint.installOptions, installOptions);
    gulp.task('lint', Lint.tasks.lint());
  },

  installOptions: {
    globs: ['gulpfile.js', 'app/**/*.js', 'helpers/**/*.js', 'server/**/*.js', 'spec/**/*.js', 'tasks/**/*.js', 'lib/**/*.js']
  },

  tasks: {
    lint() {
      const fix = process.env.FIX !== 'false';
      return function () {
        const globs = Lint.installOptions.globs;
        return gulp.src(globs, {base: '.'})
          .pipe(eslint({fix}))
          .pipe(eslint.format('stylish'))
          .pipe(gulpIf(file => {
              const fixed = file.eslint && typeof file.eslint.output === 'string';
              if (!fixed) return false;
              log(colors.yellow(`fixed an error in ${file.eslint.filePath}`));
              return true;
            },
            gulp.dest('.'))
          )
          .pipe(eslint.failAfterError());
      };
    }
  }
};

module.exports = Lint;