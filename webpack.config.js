const path = require('path')

const target = process.env.TARGET
const entry = 
  target === 'node'
    ? './src/server.js'
    : './src/index.js'



var fs = require('fs');

var nodeModules = {};
fs.readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });


const externals = // []
  target === 'node'
  ? [require('webpack-node-externals')()]
  : []


module.exports = {
  mode: 'production',
  entry,
  target,
  externals: nodeModules,
  optimization: {
    minimize: false,
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    // library: 'supermodel',
    libraryTarget: 'commonjs2',
    // umdNamedDefine: true,
    // libraryExport: 'default',
    filename: target === 'node' ? 'server.js' : 'index.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/env']
            }
          }
        ],
      },
    ]
  }
}