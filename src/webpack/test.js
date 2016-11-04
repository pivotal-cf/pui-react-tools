const {extractCss, extractSass, noErrors} = require('./webpack.plugins');

module.exports = {
  cache: true,
  devtool: 'source-map',
  entry: null,
  module: {
    loaders: [
      {test: [/\.png(\?|$)/, /\.gif(\?|$)/, /\.eot(\?|$)/, /\.ttf(\?|$)/, /\.woff2?(\?|$)/, /\.jpe?g(\?|$)/], loader: 'url'},
      {test: /\.css$/, loader: extractCss.extract('css')},
      {test: /\.scss$/, loader: extractSass.extract(['css?sourceMap', 'sass?sourceMap'])},
      {test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel'}
    ]
  },
  output: {filename: 'spec.js'},
  plugins: [noErrors, extractCss, extractSass],
  quiet: true,
  watch: true
};
