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
    // Force dark theme always - user preference from replit.md
    setTheme("dark");
  }, []);

  useEffect(() => {
    // Apply dark theme to document - force override
    const root = document.documentElement;
    const body = document.body;
    
    // Remove any light theme classes
    root.classList.remove("light", "light-theme");
    body.classList.remove("light", "light-theme");
    
    // Force add dark theme classes
    root.classList.add("dark");
    body.classList.add("dark");
    
    // Force dark styles with inline styles as backup
    document.body.style.background = "#0F0F0F";
    document.body.style.color = "#FFFFFF";
    root.style.background = "#0F0F0F";
    root.style.color = "#FFFFFF";
    
    // Save to localStorage
    localStorage.setItem("loggin-theme", "dark");
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