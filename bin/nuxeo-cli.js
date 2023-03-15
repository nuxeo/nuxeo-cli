#!/usr/bin/env node

// Check user's node version
const pkg = require('../package.json');
const expectedVersion = pkg.engines.node;
if (!require('semver').satisfies(process.version, expectedVersion)) {
  console.log(require('log-symbols').error,
    'Nuxeo CLI requires Node.js version ' + expectedVersion + '. ' +
    'Current version is ' + process.version + '.');
  process.exit(1);
}

// Notify if update is required
const updateNotifier = require('update-notifier');
if (pkg.version) { // only if version is defined in package.json (i.e it's a released version)
  updateNotifier({
    pkg
  }).notify();
}

require('../lib/cli.js')();
