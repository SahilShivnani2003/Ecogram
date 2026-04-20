module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@': './src',
          '@assets': './src/assets',
          '@components': './src/components',
          '@screens': './src/screens',
          '@types': './src/types',
          '@navigation': './src/navigation',
          '@utils': './src/utils',
          '@features': './src/features',
          '@theme': './src/theme',
          '@store': './src/store',
          '@context': './src/context',
          '@service': './src/service'
        },
      },
    ],
    'react-native-reanimated/plugin'
  ]
};
