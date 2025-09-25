import '@testing-library/jest-native/extend-expect';
import 'react-native-gesture-handler/jestSetup';

// Mock firebase/auth to avoid ESM parse and to isolate tests
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn((_auth: any, _cb: any) => () => {})
}));

// Basic mock for expo-secure-store in global setup
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
  getItemAsync: jest.fn()
}));

// Mock RNGH main module to avoid ESM parsing issues in tests, while providing basic components
jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  const View = ({ children }: any) => React.createElement('View', null, children);
  return {
    GestureHandlerRootView: View,
    PanGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    Directions: {},
  };
});

// Mock expo-status-bar ESM
jest.mock('expo-status-bar', () => ({ StatusBar: () => null }));
