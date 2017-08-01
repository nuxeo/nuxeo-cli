const parentPath = require('parentpath').sync;
const path = require('path');
const debug = require('debug')('nuxeo:cli:sync:lib');

class PathResolver {
  constructor() {

  }

  get src() {
    return {
      describe: 'Source Folder',
      default: (() => {
        return '/tmp/watcher/src';
      })()
    };
  }

  get dest() {
    return {
      describe: 'Destination Folder',
      default: (() => {
        return this.computeDestination();
      })()
    };
  }

  computeDestination() {
    let targetPath = '/tmp/watcher/dest';
    const yoConf = parentPath('.yo-rc.json');
    debug(`yo-rc file path: "${yoConf}" from cwd: "${process.cwd()}"`);
    if (yoConf) {
      const distrib = require(path.join(yoConf, '.yo-rc.json'))['generator-nuxeo']['distribution:path'];
      debug(`distrib file path: ${distrib}`);
      if (distrib) {
        targetPath = path.join(distrib, 'nxserver', 'nuxeo.war', 'ui');
      }
    }

    return targetPath;
  }
}

module.exports = PathResolver;

module.exports.src = () => {
  const pr = new PathResolver();
  return pr.src;
};

module.exports.dest = () => {
  const pr = new PathResolver();
  return pr.dest;
};

module.exports.computeDestination = () => {
  const pr = new PathResolver();
  return pr.computeDestination();
};
