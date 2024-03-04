/* eslint-disable global-require */
// For info about this file refer to webpack and webpack-hot-middleware documentation
// For info on how we're generating bundles with hashed filenames for cache busting: https://medium.com/@okonetchnikov/long-term-caching-of-static-assets-with-webpack-1ecb139adb95#.w99i89nsz
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const GLOBALS = {
  'process.env.NODE_ENV': JSON.stringify('production'),
  __DEV__: false
};

let appConfig;

const setupConfig = () => {
  switch (process.env.NODE_ENV) {
    case 'production':
      appConfig = {
        apiHost: '{DOMAIN}/api/v1',
        translationsFile: './translations/translations_prod.json',
        checkUserPermissions: true
      };
    default:
      appConfig = {
        apiHost: '{DOMAIN}/api/v1',
        translationsFile: './translations/translations_local.json',
        checkUserPermissions: true
      };
  }
};

setupConfig();

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
    minifyURLs: true
  },
  inject: true
});

module.exports = {
  resolve: {
    extensions: ['*', '.tsx', '.ts', '.js', '.json'],
    alias: {
      src: path.resolve(__dirname, './src')
    }
  },
  performance: {
    hints: false
  },
  devtool: 'inline-source-map',
  entry: [
    'babel-polyfill',
    path.resolve(__dirname, 'src/index.tsx') // Defining path seems necessary for this to work consistently on Windows machines.
  ],
  target: 'web',
  mode: 'production',
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/static/microbit-bridge/',
    filename: '[name].[chunkhash].js'
  },
  plugins: [
    // Tells React to build in prod mode. https://facebook.github.io/react/downloads.html
    new webpack.DefinePlugin(GLOBALS),

    // Generate an external css file with a hash in the filename
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css'
    }),
    new CopyPlugin([
      {
        from: appConfig.translationsFile,
        to: 'translations.json'
      }
    ]),
    new webpack.DefinePlugin({
      API_ENDPOINT: JSON.stringify(appConfig.apiHost),
      CHECK_USER_PERMISSIONS: JSON.stringify(appConfig.checkUserPermissions)
    }),
    // Generate HTML file that contains references to generated bundles. See here for how this works: https://github.com/ampedandwired/html-webpack-plugin#basic-usage
    htmlWebpackPluginInstance
  ],
  module: {
    rules: [
      {
        test: /\.(ts|tsx)?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.eot(\?v=\d+.\d+.\d+)?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              name: '[name].[ext]'
            }
          }
        ]
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000,
              mimetype: 'application/font-woff',
              name: '[name].[ext]'
            }
          }
        ]
      },
      {
        test: /\.[ot]tf(\?v=\d+.\d+.\d+)?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000,
              mimetype: 'application/octet-stream',
              name: '[name].[ext]'
            }
          }
        ]
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              mimetype: 'image/svg+xml',
              name: '[name].[ext]',
              limit: 10 * 1024 // exclude larger than 10 KB
            }
          }
        ]
      },
      {
        test: /\.(jpe?g|png|gif|ico|mp4)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]'
            }
          }
        ]
      },
      {
        test: /(\.css|\.scss|\.sass)$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: true
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [require('cssnano'), require('autoprefixer')],
              sourceMap: true
            }
          }
        ]
      }
    ]
  },
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  }
};
