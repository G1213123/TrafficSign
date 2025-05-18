const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack'); // Ensure webpack is required
require('dotenv').config(); // Load .env file

module.exports = {
  entry: './js/main.js',
  output: {
    filename: './js/main.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true, // Clean the output directory before emit.
  },
  mode: 'production', // Set mode to production for optimizations
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|ico|woff|woff2|ttf)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html', // Path to your source index.html
      filename: 'index.html',   // Output filename
      inject: false,           // Inject scripts into the body
      title: 'Road Sign Factory - Online Sign Creator', // Add title here
      appVersion: process.env.VERSION || require('./package.json').version || 'dev' // Pass the version from .env or package.json, default to 'dev'
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'css', to: 'css' },
        { from: 'images', to: 'images' },
        // Include DXF bundle for publishing
        { from: 'js/dxf', to: 'js/dxf' },
        { from: 'ads.txt', to: 'ads.txt' }, // Ensure ads.txt is copied
        { from: 'app.yaml', to: 'app.yaml' }, // Ensure app.yaml is copied
        { from: 'LICENSE', to: 'LICENSE' },
        { from: 'readme.md', to: 'readme.md' }
      ],
    }),
    // Optional: If you need the version available in your JS code as well
    new webpack.DefinePlugin({
      'process.env.APP_VERSION': JSON.stringify(process.env.VERSION || require('./package.json').version || 'dev'),
      'process.env.APP_TITLE': JSON.stringify('Road Sign Factory - Online Sign Creator')
    })
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true, // Remove console logs in production
          },
          mangle: true, // Shorten variable names
        },
        extractComments: false, // Do not extract comments to a separate file
      }),
    ],
  },
  devtool: false, // Disable source maps in production for smaller bundle size
};
