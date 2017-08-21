const ArgvAdapter = require('./argv_adapter');

module.exports = () => {
  const yo = require('yeoman-environment');
  const argv = require('yargs').usage('Usage: $0 <generator> [options]').option('dry-run', {
    alias: 'n',
    default: false,
    desc: 'Don\'t actually create the file(s), just list parameters, default values and errors.'
  }).demandCommand(1).help().argv;

  // Execute generator
  const env = yo.createEnv(undefined, undefined, new ArgvAdapter(argv));
  const cmd = 'app';
  env.register(require.resolve(`generator-nuxeo/generators/${cmd}/index.js`), `nuxeo:${cmd}`);
  env.run(`nuxeo ${argv._.join(' ')} -n`);
};
