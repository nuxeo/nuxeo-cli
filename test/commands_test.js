const assert = require('assert');

const getCommand = (name) => {
  return require(`../commands/${name}`);
};

describe('As a wrapper generator command,', () => {
  ['bootstrap', 'hotreload', 'sample'].forEach((name) => {
    it(`I can find '${name}'`, () => {
      assert.ok(getCommand(name));
    });
  });

  it('I throw an exception if it do not exists', () => {
    assert.throws(() => {
      getCommand('wrongCmd');
    }, Error, 'Error Thrown');
  });
});
