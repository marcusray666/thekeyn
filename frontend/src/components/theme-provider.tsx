import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

type ThemeProviderContext = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeProviderContext = createContext<ThemeProviderContext | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    // Load theme from localStorage on mount
    const savedTheme = localStorage.getItem("loggin-theme") as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement;
    const body = document.body;
    
    // Remove existing theme classes
    root.classList.remove("light", "dark");
    body.classList.remove("light-theme", "dark-theme");
    
    // Add new theme classes
    root.classList.add(theme);
    body.classList.add(`${theme}-theme`);
    
    // Save to localStorage
    localStorage.setItem("loggin-theme", theme);
  }, [theme]);

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}