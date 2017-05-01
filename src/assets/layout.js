const React = require('react');
const types = require('prop-types');
const Body = require('./body');

class Layout extends React.Component {
  static propTypes = {
    entry: types.func.isRequired,
    scripts: types.array.isRequired,
    stylesheets: types.array.isRequired,
    title: types.string
  };

  render() {
    let {stylesheets, title} = this.props;
    stylesheets = stylesheets.map((href, key) => (<link {...{rel: 'stylesheet', type: 'text/css', href, key}}/>));
    return (
      <html>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
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
