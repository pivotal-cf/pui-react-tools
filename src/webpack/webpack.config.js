const path = require('path');

let userWebpackConfig = {};
try {
  userWebpackConfig = require(path.join(process.cwd(), 'pui-react-tools')).webpack;
} catch(e) {
  
}

module.exports = function(env, options = {}) {
  let envConfig = {};
  try {
    envConfig = require(`./${env}`);
  } catch(e) {
    
  }
  
  const userEnvConfig = userWebpackConfig[env];
  
  const baseConfig = require('./base');
  
  const userBaseConfig = userWebpackConfig.base;

  return {
    ...baseConfig, 
    ...(userBaseConfig || {}), 
    ...envConfig, 
    ...(userEnvConfig || {}), 
    ...options
  };
};
