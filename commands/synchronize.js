module.exports = {
  command: 'sync',
  describe: 'Synchronize Web resouces with Nuxeo Server.',
  ...require('../lib/command_generator')('synchronize')
};
