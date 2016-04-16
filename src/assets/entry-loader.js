const loaderUtils = require('loader-utils');
const ReactDOMServer = require('react-dom/server');
const React = require('react');

function compile(Entry, Layout) {
  const {assetPath} = require('./asset_helper');
  const config = require('./config');
  let {assetHost, assetPort, scripts = ['application.js'], stylesheets = ['application.css'], title = 'The default title'} = config;

  const assetConfig = {assetHost, assetPort};
  const stylesheetPaths = stylesheets.map(f => assetPath(f, assetConfig));
  const scriptPaths = [
    '/config.js',
    ...scripts.map(f => assetPath(f, assetConfig))
  ];
  const props = {entry: Entry, scripts: scriptPaths, stylesheets: stylesheetPaths, title, config};
  const html = `<!doctype html>${ReactDOMServer.renderToStaticMarkup(<Layout {...props}/>)}`;
  return html;
}

function htmlLoader(content) {
  if (this.cacheable) this.cacheable();
  if (!this.emitFile) throw new Error('emitFile is required from module system');
  const query = loaderUtils.parseQuery(this.query);

  const Entry = this.exec(content, this.resourcePath);

  const layoutPath = query.layout || './layout';
  const Layout = require(layoutPath);
  const html = compile(Entry, Layout);

  this.addDependency(this.resourcePath);
  this.addDependency(layoutPath);

  const url = loaderUtils.interpolateName(this, query.name || '[name].html', {
    context: query.context || this.options.context,
    content: html,
    regExp: query.regExp
  });
  this.emitFile(url, html);
  return content;
}

module.exports = htmlLoader;