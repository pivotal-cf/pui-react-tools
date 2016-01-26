const React = require('react');

const ReactDOM = require('react-dom');
const ReactDOMServer = require('react-dom/server');

const types = React.PropTypes;

class Body extends React.Component {
  static propTypes = {
    entry: types.func.isRequired,
    scripts: types.array.isRequired
  };

  render() {
    let {entry, scripts, className} = this.props;
    scripts = scripts.map((src, key) => (<script {...{type: 'text/javascript', src, key}}/>));
    const entryFactory = React.createFactory(entry);
    const __html = ReactDOMServer.renderToString(entryFactory());
    return (
      <body className={className}>
      <div id="root" dangerouslySetInnerHTML={{__html}}/>
      {scripts}
      </body>
    );
  }
}

class Layout extends React.Component {
  static propTypes = {
    entry: types.func.isRequired,
    scripts: types.array.isRequired,
    stylesheets: types.array.isRequired,
    title: types.string
  };

  static init(Entry, props = {}) {
    if (typeof document === 'undefined') return;
    ReactDOM.render(<Entry {...props}/>, root);
  }

  render() {
    let {stylesheets, title} = this.props;
    stylesheets = stylesheets.map((href, key) => (<link {...{rel: 'stylesheet', type: 'text/css', href, key}}/>));
    return (
      <html lang="">
      <head>
        <meta charset="utf-8" />
        <meta http-equiv="x-ua-compatible" content="ie=edge" />
        <meta name="description" content="" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="apple-touch-icon" href="apple-touch-icon.png" />
        {title && <title>{title}</title>}
        {stylesheets}
      </head>
      <Body {...this.props}/>
      </html>
    );
  }
}

module.exports = Layout;
