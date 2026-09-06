// src/styles/colors.ts

export interface ThemeColors {
  background: string;
  card: string;
  cardBorder: string;
  text: string;
  textSecondary: string;
  primary: string;
  primaryLight: string;
  accent: string;
  border: string;
  shadow: string;
  success: string;
  warning: string;
  danger: string;
  successBg: string;
  warningBg: string;
  dangerBg: string;
  headerBackground: string[];
}

export const lightColors: ThemeColors = {
  background: '#F4FBF7', // Ultra light mint green
  card: '#FFFFFF',
  cardBorder: 'rgba(46, 125, 50, 0.08)',
  text: '#1B3A24', // Deep green-black
  textSecondary: '#5A7361', // Soft sage green
  primary: '#2E7D32', // Emerald green
  primaryLight: '#E8F5E9', // Light emerald green tint
  accent: '#A5D6A7', // Pastel green
  border: '#E0EAE2',
  shadow: 'rgba(46, 125, 50, 0.06)',
  success: '#2E7D32',
  warning: '#EF6C00', // Saturated orange for near-expiry
  danger: '#C62828', // Saturated red for expired
  successBg: '#E8F5E9',
  warningBg: '#FFF3E0',
  dangerBg: '#FFEBEE',
  headerBackground: ['#2E7D32', '#1B5E20'],
};

export const darkColors: ThemeColors = {
  background: '#0E1711', // Deep forest-black
  card: '#162219', // Dark charcoal green
  cardBorder: 'rgba(165, 214, 167, 0.1)',
  text: '#E0EAE2', // Soft gray-green
  textSecondary: '#8CA392', // Muted sage
  primary: '#4CAF50', // Bright emerald green
  primaryLight: '#1B3522', // Deep forest green tint
  accent: '#81C784',
  border: '#243428',
  shadow: 'rgba(0, 0, 0, 0.3)',
  success: '#4CAF50',
  warning: '#FFA726',
  danger: '#E53935',
  successBg: '#1B3522',
  warningBg: '#332514',
  dangerBg: '#381C1B',
  headerBackground: ['#122316', '#0A150D'],
};
