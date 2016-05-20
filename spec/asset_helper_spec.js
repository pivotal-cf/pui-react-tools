require('./spec_helper');

describe('AssetHelper', () => {
  let subject;

  beforeEach(() => {
    subject = require('../src/assets/asset_helper');
  });

  describe('#assetPath', () => {
    let manifestPath;

    beforeEach(() => {
      const path = require('path');
      manifestPath = path.join(__dirname, 'fixtures', 'rev-manifest.json');
    });

    describe('when there is a config with an asset host and asset port', () => {
      const filename = 'file.png';
      const assetHost = 'localhost';
      const assetPort = '3001';
      it('returns the asset on the server', () => {
        expect(subject.assetPath(filename, {assetHost, assetPort})).toEqual(`//${assetHost}:${assetPort}/${filename}`);
        expect(subject.assetPath(filename, {assetHost})).toEqual(`//${assetHost}/${filename}`);
      });
    });

    describe('when useRevManifest is not false', () => {
      const filename = 'file.png';
      it('returns the filename from the manifest', () => {
        expect(subject.assetPath(filename, {manifestPath})).toContain(`/${filename}-`);
      });
    });

    describe('when useRevManifest is false', () => {
      const useRevManifest = false;
      const filename = 'file.png';
      it('returns the filename', () => {
        expect(subject.assetPath(filename, {manifestPath, useRevManifest})).toEqual(`/${filename}`);
      });
    });
  });

  describe('#getEntry', () => {
    let webpackConfig;
    describe('when webpack.config specifies entry as a string', () => {
      beforeEach(() => {
        webpackConfig = {
          entry: './app/components/myEntry.js'
        };
      });

      it('returns the asset on the server', () => {
        expect(subject.getEntry(webpackConfig)).toEqual('./app/components/myEntry.js');
      });
    });

    describe('when webpack.config specifies entry as an array', () => {
      beforeEach(() => {
        webpackConfig = {
          entry: ['./app/components/myEntry.js', './app/components/otherThing.js']
        };
      });
      it('returns the first entry', () => {
        expect(subject.getEntry(webpackConfig)).toEqual('./app/components/myEntry.js');
      });
    });

    describe('when webpack.config specifies entry as a hash with an "application" entry', () => {
      beforeEach(() => {
        webpackConfig = {
          entry: {
            application: './app/components/myEntry.js'
          }
        };
      });
      it('returns the first entry', () => {
        expect(subject.getEntry(webpackConfig)).toEqual('./app/components/myEntry.js');
      });
    });

    describe('when webpack.config specifies entry as a hash without an "application" entry', () => {
      beforeEach(() => {
        webpackConfig = {
          entry: {
            page1: './app/components/page_1.js',
            page2: './app/components/page_2.js'
          }
        };
      });

      it('returns the first entry', () => {
        expect(subject.getEntry(webpackConfig)).toEqual('./app/components/page_1.js');
      });
    });

    describe('when webpack.config specifies entry as an array', () => {
      beforeEach(() => {
        webpackConfig = {
          entry: {
            application: ['./app/components/myEntry.js', './app/components/otherThing.js']
          }
        };
      });
      it('returns the first entry', () => {
        expect(subject.getEntry(webpackConfig)).toEqual('./app/components/myEntry.js');
      });
    });

    describe('when no webpack.config entry is provided', () => {
      beforeEach(() => {
        webpackConfig = {
          bogusKey: 'nothing useful'
        };
      });
      it('uses the default entry', () => {
        expect(subject.getEntry(webpackConfig)).toEqual('./app/components/application.js');
      });
    });
  });
});
