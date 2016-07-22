const gulp = require('gulp');
const npm = require('npm');
const path = require('path');
const {spawn} = require('child_process');

function crossPlatformSpawn(cmd, args, options) {
    if(process.platform === 'win32') {
        return spawn('cmd.exe', ['/c', cmd, ...args], options);
    }
    return spawn(cmd, args, options);
}

const Foreman = {
  install() {
    gulp.task('foreman', Foreman.tasks.foreman);
  },

  tasks: {
    foreman(callback) {
      npm.load(function(err) {
        if (err) {
          callback(err);
          return;
        }
        const child = crossPlatformSpawn(path.join(npm.bin, 'nf'), ['start', '-j', 'Procfile.dev'], {stdio: 'inherit', env: process.env}).once('close', callback);
        ['SIGINT', 'SIGTERM'].forEach(e => process.once(e, () => child && child.kill()));
      });
    }
  }
};

module.exports = Foreman;