/**
 * Handle proxy configuration automatically.
 * Warp global-tunnel-ng module to configure default node request object according to system proxy.
 *
 * To use a proxy, configure `http_proxy` or `HTTP_PROXY` env variable
*/
module.exports = (() => {
  const env = process.env;
  const proxy = env.http_proxy || env.HTTP_PROXY;
  if (!proxy) {
    return;
  }

  const [host, port = 3128] = proxy.split(':');
  require('global-tunnel-ng').initialize({
    host,
    port
  });
})();
