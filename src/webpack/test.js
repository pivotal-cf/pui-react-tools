const {extractCss, extractSass, noErrors} = require('./webpack.plugins');

module.exports = {
  devtool: 'cheap-module-source-map',
  entry: null,
  module: {
    loaders: [
      {test: [/\.png(\?|$)/, /\.gif(\?|$)/, /\.eot(\?|$)/, /\.ttf(\?|$)/, /\.woff2?(\?|$)/, /\.jpe?g(\?|$)/], loader: 'url'},
      {test: [/\.svg(\?|$)/], include: /node_modules/, loader: 'url'},
      {test: /\.css$/, loader: extractCss.extract('css')},
      {test: /\.scss$/, loader: extractSass.extract(['css?sourceMap', 'sass?sourceMap'])},
      {test: /\.js$/, exclude: /node_modules/, loader: 'babel?sourceMaps=true'}
    ]
  },
  output: {filename: 'spec.js'},
  plugins: [noErrors, extractCss, extractSass],
  quiet: true,
  watch: true
};
