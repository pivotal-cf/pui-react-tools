const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const invariant = require('invariant');

let compiler, devMiddleware;

function getWebpackCompiler(env = 'development') {
  if (compiler) return compiler;
  const webpack = require('webpack');
  const webpackConfig = require('../webpack/webpack.config')(env);
  compiler = webpack(webpackConfig || {});
  return compiler;
}

const middleware = {
  dev(options = {}) {
    devMiddleware = webpackDevMiddleware(getWebpackCompiler(process.env.NODE_ENV), {
      overlay: true, noInfo: true, reload: true, stats: {colors: true},
      ...options
    });
    return devMiddleware;
  },

  hot() {
    return webpackHotMiddleware(getWebpackCompiler(process.env.NODE_ENV));
  },

  url(name) {
    return (req, res, next) => {
      invariant(devMiddleware, 'must add a webpack dev middleware first!');
      const filename = devMiddleware.getFilenameFromUrl(name);
      devMiddleware.fileSystem.readFile(filename, (err, content) => {
        if (err) {
          next(err);
          return;
        }
        res.status(200).type('html').send(content);
      });
    };
  }
};


function webpackMiddleware(options = {}) {
  return [middleware.dev(options.dev), middleware.hot(options.hot)];
}

module.exports = Object.assign(webpackMiddleware, middleware);