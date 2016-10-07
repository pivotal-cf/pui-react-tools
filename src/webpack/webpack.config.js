const path = require('path');

function getUserWebpackConfig() {
  try {
    return require(path.join(process.cwd(), 'pui-react-tools')).webpack;
  } catch (e) {}

  try {
    return require(path.join(process.cwd(), '.react-tools')).webpack;
  } catch (e) {}

  return {};
}

module.exports = function(env, options = {}) {
  let envConfig = {};
  try {
    envConfig = require(`./${env}`);
  } catch (e) {

  }

  const userEnvConfig = getUserWebpackConfig()[env];

  const baseConfig = require('./base');

  const userBaseConfig = getUserWebpackConfig().base;

  return {
    ...baseConfig,
    ...(userBaseConfig || {}),
    ...envConfig,
    ...(userEnvConfig || {}),
    ...options
  };
};
