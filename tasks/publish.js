const gulp = require('gulp');
const npm = require('npm');

gulp.task('publish', gulp.series('build', done => {
  npm.load({}, error => {
    /* eslint-disable no-console */
    if (error) {
      console.error(error);
      return done();
    }
    npm.commands.publish(['dist'], error => {
      if (error) console.error(error);
      done();
    });
    /* eslint-enable no-console */
  });
}));
