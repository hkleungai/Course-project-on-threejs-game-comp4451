/* eslint-disable */

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const StylelintPlugin = require('stylelint-webpack-plugin');

const ROOT = path.resolve(__dirname, 'src');

require('dotenv-flow').config();

module.exports = {
  mode: 'development',

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
      {
        enforce: 'pre',
        test: /\.js$/,
        use: 'source-map-loader'
      },
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: [ /node_modules/ ],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          { loader: "css-loader", options: { sourceMap: true } },
          { loader: "sass-loader", options: { sourceMap: true } },
        ],
      },
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
    }),
    new ESLintPlugin({ extensions: ['ts', 'js'] }),
    new MiniCssExtractPlugin(),
    new StylelintPlugin(),
  ]
};
