var yeoman = require('yeoman-environment');

module.exports = (name) => {
  const env = yeoman.createEnv();
  env.register(require.resolve(`generator-nuxeo/generators/${name}/index.js`), `nuxeo:${name}`);

  return {
    run: ({ argv }) => {
      argv._ncli = true;
      env.run(`nuxeo:${name} ${argv._.slice(1).join(' ')}`.trim(), argv);
    }
  };
};
