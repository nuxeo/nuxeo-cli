const fs = require('fs');
const path = require('path');
const sym = require('log-symbols');

module.exports = ({
  argv: argv
}) => {
  const root = path.join(__dirname, '..', 'dsad');
  try {
    fs.accessSync(root, fs.constants.R_OK | fs.constants.W_OK);
  } catch (e) {
    console.error(sym.error, `Unable to get write access for folder '${root}'. You might need to use a 'sudo'.`);
    console.error(sym.info, 'You should have a look to: https://docs.npmjs.com/getting-started/fixing-npm-permissions');
    process.exit(3);
  }

  const spawn = require('child_process').spawn;
  const cmd = spawn('npm', ['update'], {
    cwd: root
  });

  cmd.on('close', (code) => {
    if (code === 0) {
      console.log(sym.success, `${argv.$0} has been updated succesfully.`);
    } else {
      console.log(sym.error, `An error occured. Try to run 'npm update' from '${root}' to check the error.`);
    }
  });
};
