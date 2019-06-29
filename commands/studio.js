module.exports = {
  command: 'studio',
  describe: 'Plug your Studio Project to your current project.',
  ...require('../lib/command_generator')('studio')
};
