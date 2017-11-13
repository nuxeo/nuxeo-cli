const debug = require('debug')('nuxeo:cli:serve');
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const mimeType = require('mime-types');
const glob = require('glob');
const minimatch = require('minimatch');

const defaultGlob = '**/*.*';

class RouteResolver {

  constructor() {
    this.routes = {};
  }

  register(reqPath, handler) {
    this.routes[`^.${reqPath}$`] = handler;
  }

  handle(req, res, reqPath) {
    Object.keys(this.routes).forEach((route) => {
      if (reqPath.match(route)) {
        this.routes[route](req, res, reqPath);
      }
    });
  }
}
const resolver = new RouteResolver();

// Root route, in order to list all available files
resolver.register('/', (req, res) => {
  glob(resolver.argv.pattern, (err, files) => {

    const resFiles = {};
    files.forEach((file) => {
      const dirname = path.format({
        root: '/',
        base: path.dirname(file)
      });
      const filename = path.basename(file);

      const folder = resFiles[dirname] || {};
      folder[filename] = `http://localhost:${resolver.argv.port}/${file}`;
      resFiles[dirname] = folder;
    });

    res.setHeader('Content-type', 'application/json');
    res.end(JSON.stringify(resFiles));
  });
});

// Files serving route
resolver.register('/.+', (req, res, pathname) => {
  fs.exists(pathname, function (exists) {
    debug(`Handling file: ${pathname} (${exists})`);
    if (!exists) {
      // if the file is not found, returns 404
      res.statusCode = 404;
      res.end(`File ${pathname} not found!`);
      return;
    }

    // if is a directory returns 400
    if (fs.statSync(pathname).isDirectory()) {
      res.statusCode = 400;
      res.end(`${pathname} is a directory!`);
      return;
    }

    // if the file exists but not in the glob returns 403
    if (!minimatch(pathname, `./${resolver.argv.pattern}`)) {
      debug(`${pathname} do not match ${resolver.argv.pattern}.`);
      res.statusCode = 403;
      res.end(`File ${pathname} not available.`);
      return;
    }

    // read file from file system
    fs.readFile(pathname, function (err, data) {
      if (err) {
        res.statusCode = 500;
        res.end(`Error getting the file: ${err}.`);
      } else {
        // if the file is found, set Content-type and send data
        // based on the URL path, extract the file extention. e.g. .js, .doc, ...
        const ext = path.parse(pathname).ext;
        res.setHeader('Content-type', mimeType.lookup(ext) || 'text/plain');
        res.end(data);
      }
    });
  });
});

module.exports = {
  command: 'serve',
  desc: 'Serves Local Resources',
  handler: function (argv) {
    require('../lib/analytics').event('nuxeo:serve', argv._.slice(1).join(' '));
    debug('Argv: %O', argv);

    // Set file matching pattern (glob format)
    resolver.argv = argv;

    setTimeout(() => {
      http.createServer((req, res) => {
        const pathname = `.${url.parse(req.url, undefined, true).pathname}`;
        console.log(`${req.method} ${pathname}`);
        resolver.handle(req, res, pathname);
      }).listen(argv.port);
      console.log(`Start serving files from ${process.cwd()}: http://localhost:${argv.port}`);
    }, 5);
  },
  builder: (yargs) => {
    return yargs
      .help()
      .options({
        port: {
          describe: 'Server port',
          default: 23987
        },
        pattern: {
          describe: 'Glob matching pattern for serve files',
          default: defaultGlob
        }
      });
  }
};
