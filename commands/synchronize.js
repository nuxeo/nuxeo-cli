const chokidar = require('chokidar');
const debug = require('debug')('nuxeo:cli:watch');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const padr = require('pad-right');
const minimatch = require('minimatch');

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

  constructor(dest, src, pattern) {
    this.dest = path.normalize(dest);
    this.src = path.normalize(src);
    this.pattern = pattern;
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
        src: {
          describe: 'Source folder',
          default: '/tmp/watcher/src'
        },
        dest: {
          describe: 'Destination folder',
          default: '/tmp/watcher/dest'
        },
        pattern: {
          describe: 'Glob matching pattern for synchronizable files',
          default: '*.+(js|html|jpg|gif|svg|png|json|jsp)'
        }
      }).coerce(['src', 'dest'], (opt) => {
        fs.ensureDirSync(opt);
        return opt;
      });
  },
  Watcher: Watcher,
  Triggers: {
    Copy: CopyTrigger,
    Unlink: UnlinkTrigger,
    Mkdirp: MkdirTrigger
  }
};
