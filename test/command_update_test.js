const assert = require('assert');
const update = require('../commands/update');
const tmp = require('tmp');
const fs = require('fs');
const path = require('path');

const clazz = {};
['hasWriteAccess', 'fileExists', 'unlinkShrinkwrap'].forEach((m) => {
  clazz[m] = update.constructor[m];
});

const createTmpFile = (mode, content) => {
  const file = tmp.fileSync({
    mode
  });

  if (content) {
    fs.writeFileSync(file.fd, content);
  }
  return file.name;
};

describe('Update command', () => {
  after(() => {
    tmp.setGracefulCleanup();
  });

  it('check a file existance', () => {
    const file = createTmpFile('0644', 'dummy content');

    assert.ok(clazz.fileExists(file));
    assert.ok(!clazz.fileExists(file + '--'));
  });

  it('check RW access on a file', () => {
    const ro = createTmpFile('0400', 'dummy content');
    const rw = createTmpFile('0600', 'dummy content');
    const wo = createTmpFile('0200', 'dummy content');

    assert.ok(!clazz.hasWriteAccess(ro));
    assert.ok(!clazz.hasWriteAccess(wo));

    assert.ok(clazz.hasWriteAccess(rw));
  });

  it('can unlink a shrinkwrap file', () => {
    const rw = createTmpFile('0666', '{}');
    const miss = path.join(rw, 'blah');
    const ro = createTmpFile('0444', '{}');

    assert.ok(clazz.unlinkShrinkwrap(rw));
    assert.ok(clazz.unlinkShrinkwrap(miss));
    assert.ok(!clazz.unlinkShrinkwrap(ro));
  });
});
