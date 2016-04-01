const {extractCss, extractSass, noErrors} = require('./webpack.plugins.js');

module.exports = function(userWebpackConfig = {}, env, options = {}) {
  let envConfig = {};
  try {
    envConfig = require(`./${env}`);
  } catch(e) {
    
  }
  
  const userEnvConfig = userWebpackConfig[env];
  
  const baseConfig = {
    bail: false,
    entry: {
      application: './app/components/application.js'
    },
    module: {
      loaders: [
        {test: [/\.svg(\?|$)/, /\.eot(\?|$)/, /\.ttf(\?|$)/, /\.woff2?(\?|$)/, /\.png(\?|$)/, /\.jpe?g(\?|$)/], include: /node_modules/, loader: 'file?name=[name]-[hash].[ext]'},
        {test: /\.css$/, loader: extractCss.extract('css')},
        {test: /\.scss$/, loader: extractSass.extract(['css', 'sass'])},
        {test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel'}
      ]
    },
    output: {
      filename: '[name].js',
      chunkFilename: '[id].js'
    },
    plugins: [
      noErrors,
      extractCss,
      extractSass
    ]
  };
  
  const userBaseConfig = userWebpackConfig.base;
  
  return {
    ...baseConfig, 
    ...(userBaseConfig || {}), 
    ...envConfig, 
    ...(userEnvConfig || {}), 
    ...options
  };
};
