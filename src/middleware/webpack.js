const devMiddleware = require('webpack-dev-middleware');
const hotMiddleware = require('webpack-hot-middleware');

let compiler;

function getWebpackCompiler(env = 'development') {
  if (compiler) return compiler;
  const Assets = require('../assets/assets');
  const webpack = require('webpack');
  const webpackConfig = require('../webpack/webpack.config')(Assets.installOptions.webpackConfig, env);
  compiler = webpack(webpackConfig);
  return compiler;
}

const middleware = {
  dev(options = {}) {
    return devMiddleware(getWebpackCompiler(process.env.NODE_ENV), {
      overlay: true, noInfo: true, reload: true, stats: {colors: true},
      ...options
    });
  },

  hot() {
    return hotMiddleware(getWebpackCompiler(process.env.NODE_ENV));
  }
};


function webpackMiddleware(options = {}) {
  return [middleware.dev(options.dev), middleware.hot(options.hot)];
}

module.exports = Object.assign(webpackMiddleware, middleware);