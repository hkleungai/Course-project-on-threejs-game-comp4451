/* eslint-disable */

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const ROOT = path.resolve(__dirname, 'src');

require('dotenv-flow').config();

module.exports = {
  context: ROOT,

  entry: {
    'main': path.resolve(ROOT, 'main.ts')
  },

  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },

  resolve: {
    extensions: ['.ts', '.js'],
    modules: [ROOT, 'node_modules']
  },

  module: {
    rules: [
      /****************
      * PRE-LOADERS
      *****************/
      {
        enforce: 'pre',
        test: /\.js$/,
        use: 'source-map-loader'
      },
      {
        enforce: 'pre',
        test: /\.ts$/,
        exclude: /node_modules/,
        use: 'tslint-loader'
      },

      /****************
      * LOADERS
      *****************/
      {
        test: /\.ts$/,
        exclude: [ /node_modules/ ],
        use: 'ts-loader'
      }
    ]
  },

  devtool: 'cheap-module-source-map',

  devServer: {
    port: process.env.PORT || 3000,
    inline: true,
    progress: true,
    profile: true,
    contentBase: ROOT,
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(ROOT, 'index.html'),
      favicon: path.resolve(ROOT, 'assets/tiles/plains.png'),
    })
  ]
};
