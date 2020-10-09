const _ = require('lodash');
const chalk = require('chalk');

class ArgvAdapter {
  constructor(argv) {
    this.argv = argv;
  }

  transform(question, value) {
    if (question.type === 'checkbox' && !_.isArray(value)) {
      value = value.split(/,\s*/);
    }
    if (question.type === 'confirm') {
      value = _.isBoolean(value) ? value : value === 'true';
    }
    if (typeof value === 'number') {
      value = value.toString();
    }
    return value;
  }

  prompt(questions, cb) {
    const res = {};
    const missing = [];
    questions.forEach((question) => {
      // Handle when function - to don't required not-needed parameter
      if (_.isFunction(question.when) && !question.when(res)) {
        return;
      }

      // Compute value with an empty string as default
      let value = this.argv.params[question.name] || question.default || '';
      if (_.isFunction(value)) {
        value = value.apply(undefined);
      }
      // Transform to typed value; as Inquirer.js returns typed values
      value = this.transform(question, value);

      if (_.isFunction(question.filter)) {
        value = question.filter(value);
      }

      // Apply validate function, to ensure value is correct
      let err;
      if (_.isFunction(question.validate) && (err = question.validate(value, res)) !== true) {
        missing.push(`${chalk.red(question.name)}: ${err}`);
      }
      res[question.name] = value;
    });

    // Log each question/answer tuple
    _.forEach(res, (value, key) => {
      this.log.info(`    ${chalk.grey(key)}: ${value}`);
    });

    // Check errors
    if (!_.isEmpty(missing)) {
      this.log.error('Parameter(s) in error:');
      missing.forEach(m => {
        this.log.info(`    ${m}`);
      });
      process.exit(2);
    }

    // Exit if dry run is on
    if (this.argv.dryRun) {
      process.exit(0);
    }

    res.action = 'force';

    // Assuming response is expecting a Promise if missing callback method.
    if (cb) {
      cb(res);
    } else {
      return Promise.resolve(res);
    }
  }

  diff() {
    return 'Y';
  }

  get log() {
    return require('yeoman-environment/lib/util/log')();
  }
}

module.exports = ArgvAdapter;
