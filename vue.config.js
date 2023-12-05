const path = require('path');
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

module.exports = {
  publicPath: './',
  pluginOptions: {
    express: {
      shouldServeApp: true,
      serverDir: '.'
    },
    webpackBundleAnalyzer: {
      openAnalyzer: false
    }
  },
  chainWebpack: config => {
    config.resolve.alias.set('@', path.resolve(__dirname, 'src'));
    config.resolve.alias.set(
      'bn.js',
      path.resolve(path.join(__dirname, 'node_modules', 'bn.js'))
    );
  },

  css: {
    sourceMap: !IS_PRODUCTION,
    requireModuleExtension: true,
    loaderOptions: {
      sass: {
        prependData: `@import "@/vars.scss"`
      },
      scss: {
        prependData: `@import "@/vars.scss";`
      }
    }
  },
  devServer: {
    compress: true,
    disableHostCheck: true,   // That solved it
  }
};
