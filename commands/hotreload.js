module.exports = {
  command: 'hotreload',
  describe: 'Hotreload your latest modifications in a Nuxeo Server.',
  handler: require('../lib/command_generator')('hotreload').handler
};
