module.exports = () => {
  const optimist = require('yargs')
    .usage('Usage: $0 <command> [options] [args]')
    .commandDir('../commands')
    .example('$0 bootstrap operation listener')
    .example('$0 hotreload configure')
    .example('$0 sample')
    .example('$0 studio link')
    .example('$0 studio sync')
    .example('$0 sync [--src resources/ui] [--dest nuxeo/nxserver/nuxeo.war/ui]')
    .example('$0 update')
    .options('h', {
      alias: 'help',
      describe: 'Print this message, or any command help.',
      type: 'boolean'
    })
    .options('v', {
      alias: 'version',
      describe: 'Show version',
      type: 'boolean'
    })
    .options('n', {
      describe: 'Quiet - Hide welcome message',
      type: 'boolean'
    })
    .recommendCommands();

  const argv = optimist.argv;

  if (!argv.n) {
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
