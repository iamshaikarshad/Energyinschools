/* eslint-disable global-require */
// For info about this file refer to webpack and webpack-hot-middleware documentation
// For info on how we're generating bundles with hashed filenames for cache busting: https://medium.com/@okonetchnikov/long-term-caching-of-static-assets-with-webpack-1ecb139adb95#.w99i89nsz
import webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

import HtmlWebpackPlugin from 'html-webpack-plugin';
import InlineSourcePlugin from 'html-webpack-inline-source-plugin';

import path from 'path';
import ModernizrWebpackPlugin from 'modernizr-webpack-plugin';
import modernizrConfig from './src/modernizr-config.json';

import getBuildEnvConfig from './tools/getBuildEnvConfig';

const htmlWebpackPluginInstance = new HtmlWebpackPlugin({
  template: 'src/index.ejs',
  favicon: 'src/favicon.ico',
  minify: {
    removeComments: true,
    collapseWhitespace: true,
    removeRedundantAttributes: true,
    useShortDoctype: true,
    removeEmptyAttributes: true,
    removeStyleLinkTypeAttributes: true,
    keepClosingSlash: true,
    minifyJS: true,
    minifyCSS: true,
    minifyURLs: true,
  },
  inject: true,
  // Note that you can add custom options here if you need to handle other custom logic in index.html
  // To track JavaScript errors via TrackJS, sign up for a free trial at TrackJS.com and enter your token below.
  trackJSToken: '',
  inlineSource: 'runtime.+\\.js',
});

export default {
  resolve: {
    extensions: ['*', '.js', '.jsx', '.json'],
  },
  entry: [
    'babel-polyfill',
    path.resolve(__dirname, 'src/index'),
  ],
  target: 'web',
  mode: 'production',
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/static/front-end/',
    filename: '[name].[contenthash].js',
  },
  plugins: [
    // Hash the files using MD5 so that their names change when the content changes.
    new webpack.HashedModuleIdsPlugin(),
    // Tells React to build in prod mode. https://facebook.github.io/react/downloads.html
    new webpack.DefinePlugin({
      'process.env': Object.assign(
        {
          NODE_ENV: JSON.stringify('production'),
          BUILD_ENV: JSON.stringify(process.env.BUILD_ENV || 'production'), // for Windows local testing: start command to set variable example: set BUILD_ENV=your_value_here&&npm run build
        },
        getBuildEnvConfig(process.env.BUILD_ENV || 'production'),
      ),
      __DEV__: false,
    }),

    // Generate an external css file with a hash in the filename
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
    }),
    // Generate HTML file that contains references to generated bundles. See here for how this works: https://github.com/ampedandwired/html-webpack-plugin#basic-usage
    htmlWebpackPluginInstance,
    new InlineSourcePlugin(),

    new ModernizrWebpackPlugin({
      htmlWebpackPlugin: htmlWebpackPluginInstance,
      options: modernizrConfig.options,
      filename: 'modernizr.js',
      noChunk: true,
      minify: modernizrConfig.minify,
      'feature-detects': modernizrConfig['feature-detects'],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env',
                {
                  targets: {
                    ie: 11,
                  },
                },
              ],
            ],
          },
        },
      },
      {
        test: /\.eot(\?v=\d+.\d+.\d+)?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              name: '[name].[ext]',
            },
          },
        ],
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000,
              mimetype: 'application/font-woff',
              name: '[name].[ext]',
            },
          },
        ],
      },
      {
        test: /\.[ot]tf(\?v=\d+.\d+.\d+)?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000,
              mimetype: 'application/octet-stream',
              name: '[name].[ext]',
            },
          },
        ],
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              mimetype: 'image/svg+xml',
              name: '[name].[ext]',
              limit: 10 * 1024, // exclude larger than 10 KB
            },
          },
        ],
      },
      {
        test: /\.(jpe?g|png|gif|ico)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
            },
          },
        ],
      },
      {
        test: /(\.css|\.scss|\.sass)$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          }, {
            loader: 'postcss-loader',
            options: {
              plugins: () => [
                require('cssnano'),
                require('autoprefixer'),
              ],
              sourceMap: true,
            },
          }, {
            loader: 'sass-loader',
            options: {
              includePaths: [path.resolve(__dirname, 'src', 'scss')],
              sourceMap: true,
            },
          },
        ],
      },
    ],
  },
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
};
