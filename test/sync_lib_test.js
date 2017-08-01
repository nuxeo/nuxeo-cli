const expect = require('chai').expect;
const pathResolver = require('../commands/synchronize_lib/path_resolver');
const tmp = require('tmp');
const path = require('path');
const fs = require('fs-extra');

describe('Synchronization Lib Modules', function () {
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
});
