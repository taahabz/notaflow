'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Font } from '@/types/font';

// FontType based on the Font enum
export type FontType = Font.SYSTEM | Font.CASCADIA_MONO | Font.ROBOTO_SLAB | Font.HUBOT_SANS | Font.ROWDIES;

interface FontContextType {
  font: FontType;
  setFont: (font: FontType) => void;
}

// Create context with default values
const FontContext = createContext<FontContextType>({
  font: Font.SYSTEM,
  setFont: () => {},
});

// Custom hook to use the font context
export const useFontContext = () => useContext(FontContext);

export const FontProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize with system font or saved preference
  const [font, setFont] = useState<FontType>(Font.SYSTEM);
  
  useEffect(() => {
    // Load saved font from localStorage if available
    const savedFont = localStorage.getItem('notaflow-font') as FontType;
    if (savedFont && Object.values(Font).includes(savedFont as Font)) {
      setFont(savedFont);
    }
  }, []);

  useEffect(() => {
    // Apply font to document
    document.documentElement.style.fontFamily = getFontFamily(font);
    // Save font preference
    localStorage.setItem('notaflow-font', font);
  }, [font]);

  // Helper function to get the actual CSS font-family value
  const getFontFamily = (font: FontType): string => {
    switch (font) {
      case Font.CASCADIA_MONO:
        return '"Cascadia Mono", monospace';
      case Font.ROBOTO_SLAB:
        return '"Roboto Slab", serif';
      case Font.HUBOT_SANS:
        return '"Hubot Sans", sans-serif';
      case Font.ROWDIES:
        return '"Rowdies", sans-serif';
      default:
        return 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    }
  };

  return (
    <FontContext.Provider value={{ font, setFont }}>
      {children}
    </FontContext.Provider>
  );
}; 