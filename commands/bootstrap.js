module.exports = {
  command: 'bootstrap',
  aliases: 'b',
  describe: 'Bootstrap Nuxeo project, bundles or several components in the current folder.',
  ...require('../lib/command_generator')('app'),
};
