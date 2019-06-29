module.exports = {
  command: 'hotreload',
  describe: 'Hotreload your latest modifications in a Nuxeo Server.',
  ...require('../lib/command_generator')('hotreload')
};
