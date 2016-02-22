const del = require('del');
const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();
const runSequence = require('run-sequence');

gulp.task('copy-css', () => {
  return gulp.src(['src/**/*.css'], {base: 'src'})
    .pipe(gulp.dest('dist'));
});

gulp.task('copy-files', () => {
  return gulp.src(['package.json', 'README.md'], {base: '.'})
    .pipe(gulp.dest('dist'));
});

gulp.task('build-js', () => {
  return gulp.src(['src/**/*.js'], {base: 'src'})
    .pipe(plugins.babel())
    .pipe(gulp.dest('dist'));
});

gulp.task('clean', (done) => {
  del(['dist/'])
    .then(() => done(), done);
});

gulp.task('build', ['clean'], (done) => {
  runSequence(['copy-css', 'build-js', 'copy-files'], done);
});
