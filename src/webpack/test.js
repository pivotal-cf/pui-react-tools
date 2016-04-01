const {extractCss, extractSass, noErrors} = require('./webpack.plugins');

module.exports = {
  devtool: 'eval',
  entry: null,
  module: {
    loaders: [
      {test: [/\.svg(\?|$)/, /\.png(\?|$)/, /\.eot(\?|$)/, /\.ttf(\?|$)/, /\.woff2?(\?|$)/, /\.jpe?g(\?|$)/], include: /node_modules/, loader: 'url?name=[name]-[hash].[ext]'},
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