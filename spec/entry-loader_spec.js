require('./spec_helper');

describe('EntryLoader', () => {
  let subject, webpackContext;

  beforeEach(() => {
    const React = require('react');

    subject = require('../src/assets/entry-loader');
    webpackContext = jasmine.createSpyObj('webpackContext', ['emitFile', 'exec', 'addDependency']);
    Object.assign(webpackContext, {
      query: '?name=foo',
      options: {}
    });
    /* eslint-disable no-unused-vars */
    class Entry extends React.Component {
      render() {
        return (<div className="the-entry"/>);
      }
    }
    /* eslint-enable no-unused-vars */
    /* eslint-disable no-eval */
    webpackContext.exec.and.callFake(content => eval(content));
    /* eslint-enable no-eval */
  });

  it('emits a file when given contents', function() {
    subject.call(webpackContext, 'Entry');
    expect(webpackContext.emitFile).toHaveBeenCalledWith('foo', jasmine.any(String));
    expect(webpackContext.emitFile.calls.mostRecent().args[1]).toContain('the-entry');
  });
});