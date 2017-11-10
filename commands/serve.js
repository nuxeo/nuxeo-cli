const debug = require('debug')('nuxeo:cli:serve');
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const mimeType = require('mime-types');

const defaultGlob = '**/*.*';

const localServer = (req, res) => {
  // parse URL
  const parsedUrl = url.parse(req.url, undefined, true);
  // extract URL path
  const pathname = `.${parsedUrl.pathname}`;

  console.log(`${req.method} ${pathname}`);

  fs.exists(pathname, function (exist) {
    if (!exist) {
      // if the file is not found, return 404
      res.statusCode = 404;
      res.end(`File ${pathname} not found!`);
      return;
    }

    // if is a directory returns bad request
    if (fs.statSync(pathname).isDirectory()) {
      res.statusCode = 400;
      res.end(`${pathname} is a directory!`);
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
};

module.exports = {
  command: 'serve',
  desc: 'Serves Local Resources',
  handler: function (argv) {
    require('../lib/analytics').event('nuxeo:serve', argv._.slice(1).join(' '));
    debug('Argv: %O', argv);

    setTimeout(() => {
      http.createServer(localServer).listen(argv.port);
      console.log(`Start serving local files: http://localhost:${argv.port}`);
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
