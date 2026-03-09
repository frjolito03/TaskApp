// ---- FIX EXPO WINTER RUNTIME ----
// Bloqueamos el runtime de Expo que causa el error de "outside of scope"
jest.mock('expo/src/winter/runtime.native', () => ({}), { virtual: true });
jest.mock('expo/src/winter/installGlobal', () => ({}), { virtual: true });

// ---------------------------------

require("react-native-get-random-values");

jest.mock('@react-native-async-storage/async-storage', () => 
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
// Mock de react-native-reanimated
jest.mock("react-native-reanimated", () =>
  require("react-native-reanimated/mock")
);

// Mock de expo-router
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn()
  }),
  useLocalSearchParams: () => ({}),
  Slot: ({ children }) => children
}));

// Mock de Expo Constants
jest.mock("expo-constants", () => ({
  expoConfig: { extra: {} }
}));

// Mock de Expo Font
jest.mock("expo-font");

// Mock SecureStore
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn()
}));

// Mock AWS Amplify Auth
jest.mock("aws-amplify/auth", () => ({
  fetchAuthSession: jest.fn(() =>
    Promise.resolve({ tokens: {} })
  ),
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  resetPassword: jest.fn(),
  confirmResetPassword: jest.fn()
}));