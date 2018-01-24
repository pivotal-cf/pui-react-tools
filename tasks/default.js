const gulp = require('gulp');
import './lint';
import './jasmine';

gulp.task('default', gulp.series('lint', 'spec', done => done()));
