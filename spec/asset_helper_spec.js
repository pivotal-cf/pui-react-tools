require('./spec_helper');

describe('AssetHelper', () => {
  let subject;

  beforeEach(() => {
    subject = require('../src/assets/asset_helper');
  });

  describe('#assetPath', () => {
    describe('when there is a config with an asset host and asset port', () => {
      const filename = 'file.png';
      const assetHost = 'localhost';
      const assetPort = '3001';
      it('returns the asset on the server', () => {
        expect(subject.assetPath(filename, {assetHost, assetPort})).toEqual(`a//${assetHost}:${assetPort}/${filename}`);
        expect(subject.assetPath(filename, {assetHost})).toEqual(`//${assetHost}/${filename}`);
      });
    });
  });
});
