var yeoman = require('yeoman-environment');

module.exports = (name) => {
  return ({argv: argv}) => {
    const env = yeoman.createEnv();

    env.register(require.resolve(`generator-nuxeo/generators/${name}/index.js`), `nuxeo:${name}`);
    env.run(`nuxeo:${name} ${argv._.slice(1).join(' ')}`.trim(), argv);
  };
};
