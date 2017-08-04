const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');
const NoEmitOnErrorsPlugin = require('webpack/lib/NoEmitOnErrorsPlugin');

const extractCss = new ExtractTextWebpackPlugin({filename: 'components.css'});
const extractSass = new ExtractTextWebpackPlugin({filename: '[name].css'});
const noEmitOnErrors = new NoEmitOnErrorsPlugin();

module.exports = {extractCss, extractSass, noEmitOnErrors};