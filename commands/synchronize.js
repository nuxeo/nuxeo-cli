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

  constructor(dest = '/tmp/watcher/dest', src = '/tmp/watcher/src', pattern = '*.+(js|html|jpg|gif|svg|png|json)') {
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
    const that = this; //WTF?!

    chokidar.watch(this.src, {
      interval: 200,
      awaitWriteFinish: true
    }).on('all', function (event, filePath) { //fucntion needed to access arguments.
      debug('%O', arguments);
      if (!that.handledFile(event, filePath)) {
        debug(`Unhandled event "${event}" or file "${filePath}"`);
        return;
      }
      that.triggerAction(event, filePath);
    });
  }
}

module.exports = {
  run: function () {
    const [{
      argv
    }] = arguments;
    debug('Argv: %O', argv);

    const w = new Watcher(argv.dest, argv.src, argv.pattern);
    debug('%O', w);
    return w.run.apply(w);
  },
  Watcher: Watcher,
  Triggers: {
    Copy: CopyTrigger,
    Unlink: UnlinkTrigger,
    Mkdirp: MkdirTrigger
  }
};
