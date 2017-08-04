const {extractCss, extractSass, noEmitOnErrors} = require('./webpack.plugins');

module.exports = {
  cache: true,
  devtool: 'source-map',
  entry: null,
  module: {
    rules: [
      {test: [/\.png(\?|$)/, /\.gif(\?|$)/, /\.eot(\?|$)/, /\.ttf(\?|$)/, /\.woff2?(\?|$)/, /\.jpe?g(\?|$)/], loader: 'url-loader'},
      {test: /\.css$/, use: extractCss.extract('css-loader')},
      {test: /\.scss$/, use: extractSass.extract(['css-loader?sourceMap', 'sass-loader?sourceMap'])},
      {test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel-loader'}
    ]
  },
  output: {filename: 'spec.js'},
  plugins: [noEmitOnErrors, extractCss, extractSass],
  watch: true
};
