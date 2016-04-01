const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');
const NoErrorsPlugin = require('webpack/lib/NoErrorsPlugin');

const extractCss = new ExtractTextWebpackPlugin('css', 'components.css');
const extractSass = new ExtractTextWebpackPlugin('application-sass', '[name].css');
const noErrors = new NoErrorsPlugin();

module.exports = {extractCss, extractSass, noErrors};