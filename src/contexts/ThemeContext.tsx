'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Define available themes
export type ThemeType = 'light' | 'dark' | 'blue' | 'green' | 'purple' | 'pink' | 'orange';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

// Create context with default values
const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {},
});

// Custom hook to use the theme context
export const useThemeContext = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize with system preference or saved preference
  const [theme, setTheme] = useState<ThemeType>('light');
  
  useEffect(() => {
    // Load saved theme from localStorage if available
    const savedTheme = localStorage.getItem('notaflow-theme') as ThemeType;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // If no saved theme but system prefers dark mode
      setTheme('dark');
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