require('react-native-get-random-values');
// Mock básico para evitar errores de módulos nativos de Expo
jest.mock('expo-font');
jest.mock('expo-constants', () => ({
  expoConfig: { extra: {} }
}));

// Mock para AWS Amplify
jest.mock('aws-amplify/auth', () => ({
  fetchAuthSession: jest.fn(() => Promise.resolve({ tokens: {} })),
  signIn: jest.fn(),
  signUp: jest.fn(),
  resetPassword: jest.fn(),
  confirmResetPassword: jest.fn(),
}));
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
}));