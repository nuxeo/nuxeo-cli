module.exports = {
  command: 'studio',
  describe: 'Plug your Studio Project to your current project.',
  handler: require('../lib/command_generator')('studio').handler
};
