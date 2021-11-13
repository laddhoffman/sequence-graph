const path = require('path');

module.exports = {
  entry: './browser.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'development',
  devServer: {
      contentBase: './'
  }
};