/**
 * Handle proxy configuration automatically.
 * Warp global-tunnel-ng module to configure default node request object according to system proxy.
 *
 * To use a proxy, configure `http_proxy` or `HTTP_PROXY` env variable
 */
module.exports = (() => {
  const MAJOR_NODEJS_VERSION = parseInt(process.version.slice(1).split('.')[0], 10);
  if (MAJOR_NODEJS_VERSION >= 10) {
    // `global-agent` works with Node.js v10 and above.
    require('global-agent').bootstrap({environmentVariableNamespace:""});
  } else {
    require('global-tunnel-ng').initialize();
  }
})();
