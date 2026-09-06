import React, { createContext, useState, useEffect, ReactNode } from 'react';
import storage from '../utils/storage';
import { ThemeColors, lightColors, darkColors } from '../styles/colors';

interface ThemeContextType {
  isDarkMode: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  colors: lightColors,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Load saved theme preference on start
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await storage.getItem('app_theme');
        if (savedTheme === 'dark') {
          setIsDarkMode(true);
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      } finally {
        setLoading(false);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    try {
      const nextMode = !isDarkMode;
      setIsDarkMode(nextMode);
      await storage.setItem('app_theme', nextMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  const colors = isDarkMode ? darkColors : lightColors;

  if (loading) {
    return null; // Prevent layout flash during load
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
export default ThemeContext;
