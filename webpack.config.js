const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: './js/sidebar/sidebar.js', // Your main entry JS file
  output: {
    filename: 'bundle.min.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true, // Clean the output directory before emit
  },
  mode: 'production', // Enables production optimizations including minification
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
  // If you need to support older browsers, you might configure target or babel-loader here
  // target: ['web', 'es5'], 
};
