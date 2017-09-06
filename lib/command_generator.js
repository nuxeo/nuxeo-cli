const yeoman = require('yeoman-environment');

module.exports = function (name) {
  const env = yeoman.createEnv();
  env.register(require.resolve(`generator-nuxeo/generators/${name}/index.js`), `nuxeo:${name}`);

  return {
    handler: function (argv) {
      argv._ncli = true;
      const generator = `nuxeo:${name}`;
      const cmds = argv._.slice(1).join(' ');

      require('./analytics').event(generator, cmds || '<default>');

      setTimeout(() => {
        // Delayed... to "I don't know why"; JS thread is still magic.
        // Without #setTimeout; env#run will not be able to do anything without passing another arg... I have do not understand...
        // See: https://jira.nuxeo.com/browse/NXBT-1835
        env.run(`${generator} ${cmds}`.trim(), argv);
      }, 5);
    }
  };
};
