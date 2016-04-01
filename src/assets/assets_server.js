const express = require('express');
const webpackMiddleware = require('./../middleware/webpack');

module.exports = function() {
  const {assetHost = 'localhost', assetPort = 3001} = require('./config');
  const cors = require('cors');
  const server = express();
  server.use(cors());
  server.use(...webpackMiddleware());
  server.listen(assetPort, assetHost);
};
