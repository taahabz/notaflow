'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Theme } from '@/types/theme';

// Use the Theme enum for ThemeType
export type ThemeType = Theme.LIGHT | Theme.DARK | Theme.BLUE | Theme.GREEN | Theme.PURPLE | Theme.PINK | Theme.ORANGE;

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

// Create context with default values
const ThemeContext = createContext<ThemeContextType>({
  theme: Theme.LIGHT,
  setTheme: () => {},
});

// Custom hook to use the theme context
export const useThemeContext = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize with system preference or saved preference
  const [theme, setTheme] = useState<ThemeType>(Theme.LIGHT);
  
  useEffect(() => {
    // Load saved theme from localStorage if available
    const savedTheme = localStorage.getItem('notaflow-theme') as ThemeType;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // If no saved theme but system prefers dark mode
      setTheme(Theme.DARK);
    }
  }, []);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
    // Save theme preference
    localStorage.setItem('notaflow-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}; 