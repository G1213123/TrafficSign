const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack'); // Ensure webpack is required
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // Added
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin'); // Added
require('dotenv').config(); // Load .env file

module.exports = {  entry: {
    main: './js/main.js',
    homepage: './js/homepage.js',
    nav: './js/nav.js'
  },
  output: {
    filename: './js/[name].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true, // Clean the output directory before emit.
  },
  mode: 'production', // Set mode to production for optimizations
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader'], // Changed
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|ico|woff|woff2|ttf)$/i,
        type: 'asset/resource',
      },
    ],
  },  plugins: [
    // Homepage HTML
    new HtmlWebpackPlugin({
      template: './index.html', // Path to your source index.html (homepage)
      filename: 'index.html',   // Output filename
      chunks: ['homepage'],     // Include only homepage bundle
      inject: true,             // Inject scripts into the homepage
      title: 'Road Sign Factory - Professional Traffic Sign Designer',
      appVersion: (process.env.VERSION || require('./package.json').version || 'dev').replace(/-/g, '.')
    }),    // App HTML
    new HtmlWebpackPlugin({      template: './design.html', // Path to your design.html
      filename: 'design.html',   // Output filename
      chunks: ['main'],       // Include only main bundle
      inject: true,           // Inject scripts into the app
      title: 'Road Sign Factory - Online Sign Creator',
      appVersion: process.env.VERSION || require('./package.json').version || 'dev'
    }),    // Changelog HTML
    new HtmlWebpackPlugin({
      template: './changelog.html', // Path to your changelog.html
      filename: 'changelog.html',   // Output filename
      chunks: ['nav'],              // Include nav bundle for navigation functionality
      inject: true,                 // Inject scripts into the changelog
      title: 'Changelog - Road Sign Factory',
      appVersion: process.env.VERSION || require('./package.json').version || 'dev'
    }),
    // About HTML
    new HtmlWebpackPlugin({
      template: './about.html',     // Path to your about.html
      filename: 'about.html',       // Output filename
      chunks: ['nav'],              // Include nav bundle for navigation functionality
      inject: true,                 // Inject scripts into the about page
      title: 'About - Road Sign Factory',
      appVersion: process.env.VERSION || require('./package.json').version || 'dev'
    }),new CopyWebpackPlugin({
      patterns: [
        { from: 'css', to: 'css' },
        { from: 'images', to: 'images' },
        // Include DXF bundle for publishing
        { from: 'js/dxf', to: 'js/dxf' },
        { from: 'ads.txt', to: 'ads.txt' }, // Ensure ads.txt is copied
        { from: 'app.yaml', to: 'app.yaml' }, // Ensure app.yaml is copied
        { from: 'sitemap.xml', to: 'sitemap.xml' }, // Ensure sitemap.xml is copied
        { from: 'robots.txt', to: 'robots.txt' } // Ensure robots.txt is copied
      ],
    }),
    // Optional: If you need the version available in your JS code as well
    new webpack.DefinePlugin({
      'process.env.APP_VERSION': JSON.stringify(process.env.VERSION || require('./package.json').version || 'dev'),
      'process.env.APP_TITLE': JSON.stringify('Road Sign Factory - Online Sign Creator')
    }),
    new MiniCssExtractPlugin({ // Added
      filename: 'css/[name].css', // Output CSS filename
    }),
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
      new CssMinimizerPlugin(), // Added
    ],
  },
  devtool: false, // Disable source maps in production for smaller bundle size
};
