const expect = require('chai').expect;
const Sync = require('../commands/synchronize');
const tmp = require('tmp');
const path = require('path');
const fs = require('fs-extra');

describe('Synchronization Command', function () {
  beforeEach(function () {
    this.cwdObj = tmp.dirSync();
    this.cwd = this.cwdObj.name;
  });

  afterEach(function () {
    fs.emptyDirSync(this.cwd);
    this.cwdObj.removeCallback();
  });

  describe('contains valid triggers.', function () {
    function createFile(dest, content = {}) {
      expect(fs.existsSync(dest)).to.be.false;
      fs.writeFileSync(dest, content);

      const destSize = fs.lstatSync(dest).size;
      expect(fs.lstatSync(dest).size).to.be.greaterThan(0);

      return destSize;
    }

    describe('Mkdirp Trigger', function () {
      it('can create a simple folder', function () {
        const dest = path.join(this.cwd, 'simple');

        expect(fs.existsSync(dest)).to.be.false;
        new Sync.Triggers.Mkdirp(dest).trigger();
        expect(fs.existsSync(dest)).to.be.true;
      });

      it('can create a folders deeply', function () {
        const dest = path.join(this.cwd, 'deep', 'folder', 'creation', 'deeply');

        expect(fs.existsSync(dest)).to.be.false;
        new Sync.Triggers.Mkdirp(dest).trigger();
        expect(fs.existsSync(dest)).to.be.true;
      });

      it('do not fail when folder already exists', function () {
        const dest = path.join(this.cwd, 'twicce');

        expect(fs.existsSync(dest)).to.be.false;
        new Sync.Triggers.Mkdirp(dest).trigger();
        new Sync.Triggers.Mkdirp(dest).trigger();
        new Sync.Triggers.Mkdirp(dest).trigger();
        new Sync.Triggers.Mkdirp(dest).trigger();
        expect(fs.existsSync(dest)).to.be.true;
      });
    });

    describe('Copy Trigger', function () {
      it('can copy a file', function () {
        const src = path.join(this.cwd, 'myObject.js');
        const srcSize = createFile(src, {
          foo: 'baaaar'
        });

        const dest = path.join(this.cwd, 'destination.json');
        expect(fs.existsSync(dest)).to.be.false;
        new Sync.Triggers.Copy(src, dest).trigger();

        expect(fs.existsSync(dest)).to.be.true;
        expect(fs.lstatSync(dest).size).to.be.eq(srcSize);
      });

      it('can copy a file to a missing folder', function () {
        const src = path.join(this.cwd, 'myObject.js');
        const srcSize = createFile(src, {
          foo: 'baaaar'
        });

        const dest = path.join(this.cwd, 'folder', 'folder', 'folder', 'destination.json');
        expect(fs.existsSync(dest)).to.be.false;
        new Sync.Triggers.Copy(src, dest).trigger();

        expect(fs.existsSync(dest)).to.be.true;
        expect(fs.lstatSync(dest).size).to.be.eq(srcSize);
      });
    });

    describe('Unlink Trigger', function () {
      it('can delete file', function () {
        const dest = path.join(this.cwd, 'toBeDeleted.js');
        createFile(dest);

        expect(fs.existsSync(dest)).to.be.true;
        new Sync.Triggers.Unlink(dest).trigger();
        expect(fs.existsSync(dest)).to.be.false;
      });

      it('can delete folder', function () {
        const dest = path.join(this.cwd, 'folderish');
        new Sync.Triggers.Mkdirp(dest).trigger();
        expect(fs.existsSync(dest)).to.be.true;

        new Sync.Triggers.Unlink(dest).trigger();
        expect(fs.existsSync(dest)).to.be.false;
      });

      it('can delete a non empty folder', function () {
        const folder = path.join(this.cwd, 'folderish');
        new Sync.Triggers.Mkdirp(folder).trigger();
        expect(fs.existsSync(folder)).to.be.true;

        createFile(path.join(folder, 'file1'));
        createFile(path.join(folder, 'file2'));
        createFile(path.join(folder, 'file3'));

        new Sync.Triggers.Unlink(folder).trigger();
        expect(fs.existsSync(folder)).to.be.false;
      });

      it('do not fail if the destination doesn\'t exist', function () {
        const dest = path.join(this.cwd, 'unknown');

        expect(fs.existsSync(dest)).to.be.false;
        new Sync.Triggers.Unlink(dest).trigger();
        expect(fs.existsSync(dest)).to.be.false;
      });
    });
  });

  describe('minimatch default rule', function () {
    const match = ['toto.js', 'blabla.html', 'toto.svg', 'bla.jpg', 'img.png', 'toto.JS', 'json.json'];
    const nonmatch = ['blasd.tr', '.git', 'toto.js.swp', '.toto.js', 'dqewq.js~'];
    const watcher = new Sync.Watcher();

    match.forEach((f) => {
      it(`match ${f}`, function () {
        expect(watcher.handledFile('fake', f)).to.be.true;
      });

      it(`match deeper ${f}`, function () {
        expect(watcher.handledFile('fake', path.join('dir', 'deep', f))).to.be.true;
      });
    });

    nonmatch.forEach((f) => {
      it(`do not match ${f}`, function () {
        expect(watcher.handledFile('fake', f)).to.be.false;
      });

      it(`do not match deeper ${f}`, function () {
        expect(watcher.handledFile('fake', path.join('dir', 'deep', f))).to.be.false;
      });
    });
  });

  describe('resolve ActionTrigger', function () {
    const tests = [{
      event: 'add',
      trigger: Sync.Triggers.Copy
    }, {
      event: 'unlink',
      trigger: Sync.Triggers.Unlink
    }, {
      event: 'unlinkDir',
      trigger: Sync.Triggers.Unlink
    }, {
      event: 'change',
      trigger: Sync.Triggers.Copy
    }, {
      event: 'addDir',
      trigger: Sync.Triggers.Mkdirp
    }];

    const watcher = new Sync.Watcher();

    tests.forEach((test) => {
      it(`with "${test.event}" event as ${test.trigger.name}.`, function () {
        const trigger = watcher.resolveAction(test.event, '');
        expect(trigger instanceof test.trigger).to.be.true;
      });
    });
  });
});
