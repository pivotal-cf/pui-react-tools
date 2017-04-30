const {extractCss, extractSass, noEmitOnErrors} = require('./webpack.plugins.js');

module.exports = {
  bail: false,
  entry: {
    application: './app/components/application.js'
  },
  module: {
    rules: [
      {test: [/\.eot(\?|$)/, /\.ttf(\?|$)/, /\.woff2?(\?|$)/, /\.png(\?|$)/, /\.gif(\?|$)/, /\.jpe?g(\?|$)/], include: /node_modules/, loader: 'file-loader?name=[name]-[hash].[ext]'},
      {test: [/\.eot(\?|$)/, /\.ttf(\?|$)/, /\.woff2?(\?|$)/, /\.png(\?|$)/, /\.gif(\?|$)/, /\.jpe?g(\?|$)/], exclude: /node_modules/, loader: 'file-loader?name=[name].[ext]'},
      {test: /\.css$/, use: extractCss.extract('css-loader')},
      {test: /\.scss$/, use: extractSass.extract(['css-loader', 'sass-loader'])},
      {test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel-loader'}
    ]
  },
  output: {
    filename: '[name].js',
    chunkFilename: '[id].js'
  },
  plugins: [
    noEmitOnErrors,
    extractCss,
    extractSass
  ]
};
