const expect = require('chai').expect;
const pathResolver = require('../commands/synchronize_lib/path_resolver');
const containsChild = require('../commands/synchronize_lib/path_child_finder').containsChild;
const tmp = require('tmp');
const path = require('path');
const fs = require('fs-extra');

describe('Synchronization Lib Modules', function () {
  before(function () {
    this.realCwd = process.cwd();
  });

  after(function () {
    process.chdir(this.realCwd);
  });

  describe('PathResolved class', function () {
    describe('src getter', function () {
      it('returns a default value', function () {
        expect(pathResolver.src().describe).to.be.eq('Source Folder');
        expect(pathResolver.src().default).to.be.eq('/tmp/watcher/src');
      });
    });

    describe('dest getter', function () {
      it('returns a default value', function () {
        expect(pathResolver.dest().describe).to.be.eq('Destination Folder');
        expect(pathResolver.dest().default).to.be.eq('/tmp/watcher/dest');
      });

      describe('can find ".yo-rc.json"', function () {
        beforeEach(function () {
          this.cwdObj = tmp.dirSync();
          this.cwd = this.cwdObj.name;
          process.chdir(this.cwd);

          this.initYoRc = (obj) => {
            fs.writeJSONSync(path.join(this.cwd, '.yo-rc.json'), {
              foo: {
                bar: 0
              },
              'generator-nuxeo': obj
            });
          };
        });

        afterEach(function () {
          fs.emptyDirSync(this.cwd);
          this.cwdObj.removeCallback();
        });

        it('and read configured distribution path', function () {
          expect(pathResolver.computeDestination()).to.be.eq('/tmp/watcher/dest');
          this.initYoRc({
            'distribution:path': '/foo/bar/nxserver'
          });
          expect(pathResolver.computeDestination()).to.match(/^\/foo\/bar\/nxserver\/.+/);
        });

        it('even from a deeper child', function () {
          const darkness = path.join(this.cwd, 'deep', 'deep', 'sooo', 'deep');
          fs.mkdirpSync(darkness);
          process.chdir(darkness);

          expect(pathResolver.computeDestination()).to.be.eq('/tmp/watcher/dest');
          this.initYoRc({
            'distribution:path': '/foo/bar/nxserver'
          });
          expect(pathResolver.computeDestination()).to.match(/^\/foo\/bar\/nxserver\/.+/);
        });

        it('and return default value if distribution not configured', function () {
          expect(pathResolver.computeDestination()).to.be.eq('/tmp/watcher/dest');
          this.initYoRc({
            'wrong:key': '/foo/bar/nxserver'
          });
          expect(pathResolver.computeDestination()).to.be.eq('/tmp/watcher/dest');
        });
      });
    });

  });

  describe('Child Path Finder class', function () {
    it('should detect child paths', function () {
      expect(containsChild(['/a/b'])).to.be.false;
      expect(containsChild(['/a/b', '/c', '/b'])).to.be.false;
      expect(containsChild(['/a/boby', '/a/bob', '/b'])).to.be.false;

      expect(containsChild(['/a/b', '/a', '/b', '/c'])).to.be.true;
      expect(containsChild(['/a/boby', '/a/../a/boby'])).to.be.true;
      expect(containsChild([process.cwd(), '.'])).to.be.true;

      expect(containsChild(['/var/folders/0r/z5sgbmt124zcfq_0g2g4sg9w0000gn/T/tmp-30031F3wqiBN4Zx3Q/a/b', '/var/folders/0r/z5sgbmt124zcfq_0g2g4sg9w0000gn/T/tmp-30031F3wqiBN4Zx3Q/b', '/var/folders/0r/z5sgbmt124zcfq_0g2g4sg9w0000gn/T/tmp-30031F3wqiBN4Zx3Q/a'])).to.be.true;
    });
  });
});
