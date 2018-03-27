// Import External Dependencies
const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const SSGPlugin = require('static-site-generator-webpack-plugin');

// Load Common Configuration
const common = require('./webpack.common.js');
const Content = require('./src/_content.json');

const paths = Content.children.reduce((paths, page) => {
  if (page.type === 'directory') {
    paths = Object.assign(
      paths,
      page.children.reduce((childPaths, child) => {
        childPaths[child.url] = child.title;
        return childPaths;
      }, {})
    );
  } else {
    paths[page.url] = page.title;
  }

  return paths;
}, {});

// ...
const prod = {
  plugins: [
    new UglifyJSPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    })
  ]
};

// Export both SSG and SPA configurations
module.exports = env => [
  merge(common(env), prod, {
    target: 'node',
    entry: {
      index: './server.jsx'
    },
    plugins: [
      new SSGPlugin({
        paths: Object.keys(paths),
        locals: { paths },
        globals: {
          window: {}
        }
      })
    ],
    output: {
      filename: 'server.[name].js',
      libraryTarget: 'umd'
    }
  }),
  merge(common(env), prod, {
    target: 'web',
    plugins: [
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        chunks: ['index']
      })
    ]
  })
];
