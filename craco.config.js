const path = require('path');

module.exports = {
  webpack: {
    configure: webpackConfig => {
      const svgRuleIndex = webpackConfig.module.rules.findIndex(rule =>
        rule.oneOf && rule.oneOf.some(r => r.test && r.test.toString().includes('svg'))
      );

      if (svgRuleIndex === -1) {
        return webpackConfig;
      }

      const svgRule = webpackConfig.module.rules[svgRuleIndex];
      const oneOfRules = svgRule.oneOf;

      // Find the existing SVG loader
      const existingSvgLoaderIndex = oneOfRules.findIndex(
        rule => rule.test && rule.test.toString().includes('svg')
      );

      if (existingSvgLoaderIndex === -1) {
        return webpackConfig;
      }

      const existingSvgLoader = oneOfRules[existingSvgLoaderIndex];

      // Exclude node_modules from the existing SVG loader
      existingSvgLoader.exclude = /node_modules/;

      // Add a new rule to handle SVG files inside node_modules
      oneOfRules.splice(existingSvgLoaderIndex + 1, 0, {
        test: /\.svg$/,
        include: /node_modules/,
        use: [
          {
            loader: require.resolve('file-loader'),
            options: {
              name: 'static/media/[name].[hash:8].[ext]',
            },
          },
        ],
      });

      return webpackConfig;
    },
  },
};
