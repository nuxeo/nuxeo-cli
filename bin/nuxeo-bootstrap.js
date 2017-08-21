#!/usr/bin/env node

// Check user's node version
const pkg = require('../package.json');
const expectedVersion = pkg.engines.node;
if (!require('semver').satisfies(process.version, expectedVersion)) {
  console.log(require('log-symbols').error,
    'Nuxeo CLI - bootstrap - requires Node.js version ' + expectedVersion + '. ' +
    'Current version is ' + process.version + '.');
  process.exit(1);
}

require('../lib/bootstrap.js')();
