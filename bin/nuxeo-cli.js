#!/usr/bin/env node

const optimist = require('yargs')
  .usage('Usage: $0 <command> [options] [args]')
  .command('bootstrap', 'Bootstrap Nuxeo project, bundles or several components in the current folder.', require('../commands/bootstrap'))
  .example('$0 bootstrap operation listener')
  .command('hotreload', 'Hotreload your latest modifications in a Nuxeo Server.', require('../commands/hotreload'))
  .example('$0 hotreload configure')
  .command('update', 'Update to get the latest features.', require('../commands/update'))
  .options('h', {
    alias: 'help',
    describe: 'Print Nuxeo CLI version',
    type: 'boolean'
  })
  .options('v', {
    alias: 'version',
    describe: 'Show version',
    type: 'boolean'
  });
const argv = optimist.argv;

if (argv.version) {
  const pad = (name) => {
    return require('pad-right')(name, 22, ' ');
  };
  const versionOf = (name) => {
    return require(require.resolve(`${name}/package.json`)).version;
  };
  const displayVersionOf = (name) => {
    return `${pad(' - ' + name)}: ${versionOf(name)}`;
  };

  console.log(`${pad('Nuxeco CLI')}: ${require('../package.json').version}`);
  console.log('Modules');
  console.log(displayVersionOf('generator-nuxeo'));
  console.log(displayVersionOf('yeoman-environment'));
  process.exit(0);
}

if (argv._.length === 0) {
  optimist.showHelp();
  process.exit(argv.help ? 0 : 1);
}
