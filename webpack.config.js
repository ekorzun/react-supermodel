const target = process.env.TARGET

module.exports = {
  entry: './src/index.js',
  target: target || 'node',
  mode: 'production',
  output: {
    filename: target === 'node' ? 'server.js' : 'index.js'
  },
  module: {
    rules: [
      {
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/env']
            }
          }
        ],
        test: /\.js$/,
        exclude: /node_modules/,
      },
    ]
  }
}