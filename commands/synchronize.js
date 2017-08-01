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

class ActionTrigger {
  trigger() {
    debug('Not overrided method!');
  }

  debug() {
    debug('New action registered: %O', this);
  }

  format(val, color) {
    return chalk[color](padr(val, 7, ' ')) + ':';
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
    console.log(`${this.format('Copy', 'green')} ${this.source} -> ${this.destination}`);

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
    console.log(`${this.format('Mkdir', 'yellow')} ${this.destination}`);
    fs.mkdirpSync(this.destination);
  }
}

class UnlinkTrigger extends ActionTrigger {
  constructor(destination) {
    super();
    this.destination = destination;
    this.debug();
  }

  trigger() {
    console.log(`${this.format('Delete', 'red')} ${this.destination}`);
    fs.removeSync(this.destination);
  }
}

class Watcher {

  constructor(dest = '', src = '', pattern = Watcher.GLOB) {
    this.dest = path.normalize(dest);
    this.src = path.normalize(src);
    this.pattern = pattern;
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

  handledFile(event, filePath) {
    return !!event && (event.match(/Dir$/) || minimatch(path.basename(filePath), this.pattern, {
      nocase: true
    }));
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
    return path.join(this.dest, source.replace(this.src, ''));
  }

  run() {
    setTimeout(() => {
      // Delayed to 5ms, to free the thread to print the logo before any other log
      console.log(`Waiting changes on "${chalk.blue(this.src)}", to "${chalk.blue(this.dest)}"`);
    }, 5);

    chokidar.watch(this.src, {
      interval: 200,
      awaitWriteFinish: true
    }).on('all', function (event, filePath) { //function needed to access arguments.
      debug('%O', arguments);
      if (!this.handledFile(event, filePath)) {
        debug(`Unhandled event "${event}" or file "${filePath}"`);
        return;
      }
      this.triggerAction(event, filePath);
    }.bind(this));
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
