const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './js/main.js', // Your main entry JS file
  output: {
    filename: './js/bundle.min.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true, // Clean the output directory before emit
  },
  mode: 'production', // Enables production optimizations including minification
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html', // Use your root index.html as a template
      inject: 'body',
      minify: {
        collapseWhitespace: true,
        removeComments: true,
      },
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'css', to: 'css' }, // Copy css/ and all subfolders (fonts)
        { from: 'images', to: 'images' }, // Copy images/
        { from: 'js/dxf-bundle.js', to: 'js/dxf-bundle.js' }, // Copy dxf-bundle.js
        { from: '.gcloudignore', to: '.gcloudignore' },  
        { from: '.gitignore', to: '.gitignore' },  
        { from: 'app.yaml', to: 'app.yaml' },  
      ],
    }),
  ],
};
