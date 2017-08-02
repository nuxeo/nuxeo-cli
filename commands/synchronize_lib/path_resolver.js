const parentPath = require('parentpath').sync;
const path = require('path');
const debug = require('debug')('nuxeo:cli:sync:lib:resolve');
const fs = require('fs-extra');

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
      type: 'string',
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
        targetPath = path.join(distrib, 'nxserver', 'nuxeo.war');
      }
    }

    return targetPath;
  }

  findBaseDistributionPath(target, child = path.join('bin', 'nuxeo.conf')) {
    let cp = path.join(target, 'dummy');
    while (cp !== (cp = path.dirname(cp))) {
      const confFile = path.join(cp, child);
      debug('Looking for %O', confFile);
      if (fs.existsSync(confFile)) {
        return cp;
      }
    }

    return undefined;
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

module.exports.findBaseDistributionPath = (target, child) => {
  const pr = new PathResolver();
  return pr.findBaseDistributionPath(target, child);
};
