import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

type Theme = 'liquid-glass' | 'ethereal-ivory' | 'sage-moss' | 'pastel-rose';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  applyTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "liquid-glass",
  setTheme: () => null,
  applyTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "liquid-glass",
  storageKey = "theme-preference",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );
  const { user } = useAuth();

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    
    // Apply new theme class
    document.body.classList.add(`theme-${newTheme}`);
    
    // Update CSS variables based on theme
    switch (newTheme) {
      case 'ethereal-ivory':
        root.style.setProperty('--background', '240 10% 98%');
        root.style.setProperty('--foreground', '240 10% 3.9%');
        root.style.setProperty('--card', '240 10% 96%');
        root.style.setProperty('--primary', '25 95% 53%');
        break;
      case 'sage-moss':
        root.style.setProperty('--background', '120 10% 95%');
        root.style.setProperty('--foreground', '120 10% 10%');
        root.style.setProperty('--card', '120 10% 92%');
        root.style.setProperty('--primary', '120 30% 25%');
        break;
      case 'pastel-rose':
        root.style.setProperty('--background', '340 10% 98%');
        root.style.setProperty('--foreground', '340 10% 15%');
        root.style.setProperty('--card', '340 10% 95%');
        root.style.setProperty('--primary', '340 80% 55%');
        break;
      default: // liquid-glass
        root.style.setProperty('--background', '222.2 84% 4.9%');
        root.style.setProperty('--foreground', '210 40% 98%');
        root.style.setProperty('--card', '222.2 84% 4.9%');
        root.style.setProperty('--primary', '266 80% 65%');
        break;
    }
  };

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Sync with user preference from database
  useEffect(() => {
    if (user?.themePreference) {
      setTheme(user.themePreference as Theme);
    }
  }, [user?.themePreference]);

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      localStorage.setItem(storageKey, newTheme);
      setTheme(newTheme);
      applyTheme(newTheme);
    },
    applyTheme,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};