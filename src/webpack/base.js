const {extractCss, extractSass, noErrors} = require('./webpack.plugins.js');

module.exports = {
  bail: false,
  entry: {
    application: './app/components/application.js'
  },
  module: {
    loaders: [
      {test: [/\.eot(\?|$)/, /\.ttf(\?|$)/, /\.woff2?(\?|$)/, /\.png(\?|$)/, /\.gif(\?|$)/, /\.jpe?g(\?|$)/], include: /node_modules/, loader: 'file?name=[name]-[hash].[ext]'},
      {test: [/\.eot(\?|$)/, /\.ttf(\?|$)/, /\.woff2?(\?|$)/, /\.png(\?|$)/, /\.gif(\?|$)/, /\.jpe?g(\?|$)/], exclude: /node_modules/, loader: 'file?name=[name].[ext]'},
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
