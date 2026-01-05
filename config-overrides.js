const webpack = require('webpack');

module.exports = function override(config, env) {
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "util": require.resolve("util/"),
    "buffer": require.resolve("buffer/"),
    "process": require.resolve("process/browser"),
    "stream": require.resolve("stream-browserify"),
    "crypto": require.resolve("crypto-browserify"),
    "path": require.resolve("path-browserify"),
    "os": require.resolve("os-browserify/browser"),
    "fs": false,
    "net": false,
    "tls": false
  };

  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
  ];

  return config;
};