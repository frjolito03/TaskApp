module.exports = {
  preset: 'jest-expo',

  setupFiles: ['./jest.setup.js'],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],

  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?react-native|@react-native|expo|@expo|@expo-google-fonts|@unimodules|react-native-svg|aws-amplify|@aws-amplify)"
  ],

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1"
  },

  testMatch: [
    "**/__tests__/**/*.test.[jt]s?(x)",
    "**/?(*.)+(spec|test).[jt]s?(x)"
  ],

  moduleDirectories: ['node_modules', '<rootDir>']
};