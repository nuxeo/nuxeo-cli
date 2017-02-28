module.exports = () => {
  const optimist = require('yargs')
    .usage('Usage: $0 <command> [options] [args]')
    .command('bootstrap', 'Bootstrap Nuxeo project, bundles or several components in the current folder.', require('../commands/bootstrap').run)
    .example('$0 bootstrap operation listener')
    .command('hotreload', 'Hotreload your latest modifications in a Nuxeo Server.', require('../commands/hotreload').run)
    .example('$0 hotreload configure')
    .command('sample', 'Generate a Sample project to discover how things work.', require('../commands/sample').run)
    .example('$0 sample')
    .command('update', 'Update Nuxeo CLI to get latest features.', require('../commands/update').run)
    .options('h', {
      alias: 'help',
      describe: 'Print Nuxeo CLI version',
      type: 'boolean'
    })
    .options('v', {
      alias: 'version',
      describe: 'Show version',
      type: 'boolean'
    })
    .options('q', {
      describe: 'Quiet - Hide welcome message',
      type: 'boolean'
    });
  const argv = optimist.argv;

  if (!argv.q) {
    console.log(require('../lib/welcome'));
  }

  if (argv.version) {
    require('../lib/display_version')(console.log);
    process.exit(0);
  }

  if (argv._.length === 0) {
    optimist.showHelp();
    process.exit(argv.help ? 0 : 1);
  }
};
