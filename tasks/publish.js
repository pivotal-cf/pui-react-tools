const gulp = require('gulp');
const npm = require('npm');

gulp.task('publish', ['build'], () => {
  npm.load({}, (error) => {
    /* eslint-disable no-console */
    if (error) return console.error(error);
    npm.commands.publish(['dist'], (error) => {
      if (error) return console.error(error);
    });
    /* eslint-enable no-console */
  });
});
