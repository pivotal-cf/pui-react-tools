const gulp = require('gulp');
const {jasmine} = require('gulp-load-plugins')();

gulp.task('spec', () => {
  return gulp.src('spec/**/*_spec.js')
    .pipe(jasmine({includeStackTrace: true}));
});
