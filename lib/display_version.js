const updateNotifier = require('update-notifier');
const chalk = require('chalk');
const symbol = require('log-symbols');

let needUpdateWarn = false;

const pad = (name) => {
  return require('pad-right')(name, 22, ' ');
};

const versionOf = (name) => {
  return require(require.resolve(`${name}/package.json`)).version;
};

const updateInformation = (name) => {
  const pkg = {
    name,
    version: versionOf(name)
  };
  let update = updateNotifier({
    pkg
  }).update;
  if (update) {
    needUpdateWarn = true;
    return '(' + chalk.blue(update.latest) + ')';
  }
  return '';
};

const displayVersionOf = (name) => {
  return `${pad(' - ' + name)}: ${versionOf(name)} ${updateInformation(name)}`;
};

const displayUpdateWarning = () => {
  return `${symbol.info} ` + chalk.blue('Some modules are outdated: ') + 'you should run the ' + chalk.green('update') + ' command to fix them.';
};

module.exports = (log) => {
  log(`${pad('Nuxeo CLI')}: ${require('../package.json').version}`);
  log('Modules');
  log(displayVersionOf('generator-nuxeo'));
  log(displayVersionOf('yeoman-environment'));
  if (needUpdateWarn) {
    log();
    log(displayUpdateWarning());
  }
};
