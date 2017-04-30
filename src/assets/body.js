const React = require('react');
const ReactDOMServer = require('react-dom/server');
const types = require('prop-types');

const Body = ({entry, scripts, className, ...props}) => {
  scripts = scripts.map((src, key) => (<script {...{type: 'text/javascript', src, key}}/>));
  const entryFactory = React.createFactory(entry);
  const __html = ReactDOMServer.renderToString(entryFactory(props));
  return (
    <body className={className}>
      <div id="root" dangerouslySetInnerHTML={{__html}}/>
      {scripts}
    </body>
  );
};

Body.propTypes = {
  entry: types.func.isRequired,
  scripts: types.array.isRequired
};

module.exports = Body;
