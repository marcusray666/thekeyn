import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

type ThemeProviderContext = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeProviderContext = createContext<ThemeProviderContext | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage for saved theme preference
    const saved = localStorage.getItem("loggin-theme");
    return (saved as Theme) || "light";
  });

  useEffect(() => {
    // Allow theme switching - removed forced dark mode
    // Theme will be controlled by user interaction
  }, []);

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement;
    const body = document.body;
    
    // Remove existing theme classes
    root.classList.remove("light", "dark");
    body.classList.remove("light", "dark");
    
    // Add current theme class
    root.classList.add(theme);
    body.classList.add(theme);
    
    // Apply theme-specific styles
    if (theme === "dark") {
      document.body.style.background = "#0F0F0F";
      document.body.style.color = "#FFFFFF";
      root.style.background = "#0F0F0F";
      root.style.color = "#FFFFFF";
    } else {
      document.body.style.background = "#FFFFFF";
      document.body.style.color = "#000000";
      root.style.background = "#FFFFFF";
      root.style.color = "#000000";
    }
    
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