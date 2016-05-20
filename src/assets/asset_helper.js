const join = require('url-join');
const path = require('path');

function assetPath(asset, options = {}) {
  const defaultManifestPath = path.join(process.cwd(), 'public', 'rev-manifest.json');
  const {assetHost, assetPort, useRevManifest = true, manifestPath = defaultManifestPath} = options;
  if (assetHost) return `//${join(...[[assetHost, assetPort].filter(Boolean).join(':'), asset])}`;

  if(!useRevManifest) return `/${asset}`;
  let revManifest;
  try {
    revManifest = require(manifestPath);

  } catch(e) {
    revManifest = {};
  }
  return `/${revManifest[asset] || asset}`;
}

function getEntry(webpackConfig) {
  const entry = webpackConfig.entry;
  const defaultEntryPath = './app/components/application.js';

  if (!entry) return defaultEntryPath;
  if (entry.constructor === String) return entry;
  if (Array.isArray(entry)) return entry[0];
  if (Array.isArray(entry.application)) return entry.application[0];
  if (entry.application) return entry.application;
  return Object.values(entry)[0];
}

module.exports = {assetPath, getEntry};
