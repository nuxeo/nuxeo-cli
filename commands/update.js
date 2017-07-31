const fs = require('fs');
const path = require('path');
const isWindows = require('is-windows');
const sym = require('log-symbols');


class UpdateCmd {
  /**
   * Helper method to check current user has access to a file
   * @param {String} file to check path
   * @returns {Boolean} true if file is readable and writable, false otherwise
   */
  static hasWriteAccess(file) {
    try {
      fs.accessSync(file, fs.constants.R_OK | fs.constants.W_OK);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Helper method to check if file exists
   * @param {String} file to check path
   * @returns {Boolean} `true` if file exists, `false` otherwise.
   */
  static fileExists(file) {
    return fs.existsSync(file);
  }

  /**
   * Unlink shrinkwrap file to be able to trigger a `generator-nuxeo` update
   * @param {String} shrinkwrap path
   * @returns {Boolean} `true` if file is deleted or do not exists, `false` otherwise.
   */
  static unlinkShrinkwrap(shrinkwrap) {
    if (UpdateCmd.fileExists(shrinkwrap)) {
      if (UpdateCmd.hasWriteAccess(shrinkwrap)) {
        fs.unlinkSync(shrinkwrap);
      } else {
        return false;
      }
    }
    return true;
  }

  get command() {
    return 'update';
  }
  get describe() {
    return 'Update Nuxeo CLI to get latest features.';
  }
  handler(argv, targetPath) {
    const root = targetPath || path.join(__dirname, '..');
    if (!UpdateCmd.hasWriteAccess(root)) {
      console.error(sym.error, `Unable to get write access for folder '${root}'. You might need to use a 'sudo'.`);
      console.error(sym.info, 'You should have a look to: https://docs.npmjs.com/getting-started/fixing-npm-permissions');
      process.exit(3);
    }

    const shrinkwrap = path.join(root, 'npm-shrinkwrap.json');
    if (!UpdateCmd.unlinkShrinkwrap(shrinkwrap)) {
      console.error(sym.error, `Unable to get write access for file '${shrinkwrap}'. You might need to use a 'sudo'.`);
      console.error('Or, try to remove it manually.');
      process.exit(4);
    }

    const spawn = require('child_process').spawn;
    const cmd = spawn(isWindows() ? 'npm.cmd' : 'npm', ['update', 'generator-nuxeo'], {
      cwd: root
    });

    cmd.on('close', (code) => {
      if (code === 0) {
        console.log(sym.success, `${argv.$0} has been updated succesfully.`);
      } else {
        console.log(sym.error, `An error occured. Try to run 'npm update' from '${root}' to check the error.`);
      }
    });
  }
}

module.exports = new UpdateCmd();
