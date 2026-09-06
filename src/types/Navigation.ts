// src/types/Navigation.ts
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Home: undefined;
};
export type AuthScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;