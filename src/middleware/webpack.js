const devMiddleware = require('webpack-dev-middleware');
const hotMiddleware = require('webpack-hot-middleware');
const path = require('path');

let compiler;

function getWebpackCompiler(env = 'development') {
  if (compiler) return compiler;
  const webpack = require('webpack');
  const config = require(path.join(process.cwd(), 'config', 'webpack.config'))(env);
  compiler = webpack(config);
  return compiler;
}

//TODO: find a better way to deeply merge webpack configuration correctly
/*
function mergeWebpackConfig(defaults, overrides) {
  const {module, plugins, entry, output, ...rest} = overrides;
  let config = {...defaults, ...rest};

  if(config.module && module) {
    config.module.loaders = [...(config.module.loaders || []), ...(module.loaders || [])];
  }
  console.log('config', config)

  return config;
}
*/

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