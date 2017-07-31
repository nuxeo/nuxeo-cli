module.exports = {
  command: 'sample',
  describe: 'Generate a Sample project to discover how things work.',
  handler: require('../lib/command_generator')('sample').handler
};
