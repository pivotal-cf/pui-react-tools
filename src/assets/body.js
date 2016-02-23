const React = require('react');
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

module.exports = Body;
