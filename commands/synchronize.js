const chokidar = require('chokidar');
const debug = require('debug')('nuxeo:cli:sync');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const padr = require('pad-right');
const minimatch = require('minimatch');
const pathResolver = require('./synchronize_lib/path_resolver');
const containsChild = require('./synchronize_lib/path_child_finder').containsChild;
const isArray = require('isarray');
const _ = require('lodash');

class Watcher {

  constructor(dest = '', src = '', pattern = Watcher.GLOB) {
    this.dest = Watcher.normalizePath(dest);
    this.src = Watcher.normalizePath(src);
    this.pattern = pattern;
    this.watchers = {};
  }

  static normalizePath(opt) {
    if (isArray(opt)) {
      return _.map(opt, (o) => {
        return path.normalize(o);
      });
    } else {
      return path.normalize(opt);
    }
  }

  static get GLOB() {
    return '*.+(js|html|jpg|gif|svg|png|json|jsp)';
  }

  static coerce(opt) {
    let _opt = !isArray(opt) ? [opt] : opt;

    if (containsChild(_opt)) {
      throw new Error('The directories contain a child of one of the parent directories.');
    }

    _opt = _opt.map((o) => {
      fs.ensureDirSync(o);
      return path.resolve(o);
    });

    return _opt.length === 1 ? _opt[0] : _opt;
  }

  static log(verb, color, text) {
    console.log(`${chalk[color](padr(verb.toUpperCase(), 7, ' '))}: ${text}`);
  }

  handledFile(event, filePath) {
    return !!event && (event.match(/Dir$/) || minimatch(path.basename(filePath), this.pattern, {
      nocase: true
    }));
  }

  startMainWatcher() {
    this.watchers.main = chokidar.watch(this.src, {
      interval: 200,
      awaitWriteFinish: true
    });

    this.watchers.main.on('all', function (event, filePath) { //function needed to access arguments.
      debug('%O', arguments);
      if (!this.handledFile(event, filePath)) {
        debug(`Unhandled event "${event}" or file "${filePath}"`);
        return;
      }
      this.triggerAction(event, filePath);
    }.bind(this));
  }

  restartMainWatcher() {
    this.watchers.main.close();
    delete this.watchers.main;

    this.startMainWatcher();
  }

  startServerRestartWatcher(lookupFile = path.join('nxserver', 'nuxeo.war', 'WEB-INF', 'dev')) {
    const dp = pathResolver.findBaseDistributionPath(this.dest);
    if (!dp) {
      return;
    }

    const fp = path.join(dp, lookupFile);
    if (!fs.pathExistsSync(fp)) {
      Watcher.log('Warn', 'yellow', `You should enable the '${chalk.blue('sdk')}' template in order to detect server's restart to start a new synchronization automatically.`);
      return;
    }

    Watcher.log('Info', 'blue', 'Nuxeo Server restart watcher enabled.');
    this.watchers.server = chokidar.watch(fp, {
      ignored: '**/dev/*',
      ignoreInitial: true
    });
    this.watchers.server.on('all', () => {
      Watcher.log('Restart', 'red', `Server has been restarted. Reinitialise Synchronization from: ${chalk.blue(this.src)}`);
      this.restartMainWatcher();
    });
  }

  resolveAction(event, filePath) {
    // unlink, unlinkDir
    if (event.startsWith('unlink')) {
      return new UnlinkTrigger(this.computeDestination(filePath));
    } else
    if (['change', 'add'].indexOf(event) >= 0) {
      return new CopyTrigger(filePath, this.computeDestination(filePath));
    } else
    if (event === 'addDir') {
      return new MkdirTrigger(this.computeDestination(filePath));
    } else {
      debug(`Unhandled event: ${event}`);
    }

    return undefined;
  }

  triggerAction(event, filePath) {
    const a = this.resolveAction(event, filePath);
    if (a) {
      a.trigger();
    }
  }

  computeDestination(source) {
    const src = isArray(this.src) ? _.find(this.src, (f) => {
      return path.join(source, path.sep).startsWith(path.join(f, path.sep));
    }) : this.src;

    return path.join(this.dest, source.replace(src, ''));
  }

  run() {
    setTimeout(() => {
      // Delayed to 5ms, to free the thread to print the logo before any other log
      console.log(`Waiting changes from "${chalk.blue(this.src)}", to "${chalk.blue(this.dest)}"`);

      this.startMainWatcher();
      this.startServerRestartWatcher();
    }, 5);
  }
}

class ActionTrigger {
  trigger() {
    debug('Not overrided method!');
  }

  debug() {
    debug('New action registered: %O', this);
  }
}

class CopyTrigger extends ActionTrigger {
  constructor(source, destination) {
    super();
    this.source = source;
    this.destination = destination;
    this.debug();
  }

  trigger() {
    Watcher.log('Copy', 'green', `${this.source} -> ${this.destination}`);

    const destinationDir = path.dirname(this.destination);
    if (!fs.pathExistsSync(destinationDir)) {
      debug('Missing Destination Dir, trigger MkdirTrigger');
      new MkdirTrigger(destinationDir).trigger();
    }

    fs.copySync(this.source, this.destination);
  }
}

class MkdirTrigger extends ActionTrigger {
  constructor(destination) {
    super();
    this.destination = destination;
    this.debug();
  }

  trigger() {
    Watcher.log('Mkdir', 'magenta', this.destination);
    fs.mkdirpSync(this.destination);
  }
}

class RestartWatcherTrigger extends ActionTrigger {
  constructor(watcher) {
    super();
    this.watcher = watcher;
    this.debug();
  }

  trigger() {

  }
}

class UnlinkTrigger extends ActionTrigger {
  constructor(destination) {
    super();
    this.destination = destination;
    this.debug();
  }

  trigger() {
    Watcher.log('Delete', 'yellow', this.destination);
    fs.removeSync(this.destination);
  }
}


module.exports = {
  command: 'sync',
  desc: 'Web Resources Folder Synchronization',
  handler: function (argv) {
    debug('Argv: %O', argv);

    const w = new Watcher(argv.dest, argv.src, argv.pattern);
    debug('%O', w);
    return w.run.apply(w);
  },
  builder: (yargs) => {
    return yargs
      .help()
      .options({
        src: pathResolver.src(),
        dest: pathResolver.dest(),
        pattern: {
          describe: 'Glob matching pattern for synchronizable files',
          default: Watcher.GLOB
        }
      }).coerce(['src', 'dest'], Watcher.coerce);
  },
  Watcher: Watcher,
  Triggers: {
    Copy: CopyTrigger,
    Unlink: UnlinkTrigger,
    Mkdirp: MkdirTrigger
  }
};
