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

function foreman(callback) {
  npm.load(function(err) {
    if (err) return callback(err);
    const child = crossPlatformSpawn(path.join(npm.bin, 'nf'), ['start', '-j', 'Procfile.dev'], {stdio: 'inherit', env: process.env}).once('close', callback);   
    ['SIGINT', 'SIGTERM'].forEach(e => process.once(e, () => child && child.kill()));
  });
}

module.exports = {
  install() {
    gulp.task('foreman', foreman);
  }
};
