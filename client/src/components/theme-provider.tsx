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
        // Light warm theme
        root.style.setProperty('--background', '40 20% 97%'); // Warm white
        root.style.setProperty('--foreground', '20 14% 8%'); // Much darker brown for better contrast
        root.style.setProperty('--card', '40 15% 94%'); // Light cream
        root.style.setProperty('--card-foreground', '20 14% 8%'); // Much darker
        root.style.setProperty('--primary', '25 95% 53%'); // Warm orange
        root.style.setProperty('--primary-foreground', '0 0% 100%');
        root.style.setProperty('--muted', '40 10% 90%');
        root.style.setProperty('--muted-foreground', '20 14% 25%'); // Much darker muted text
        root.style.setProperty('--accent', '40 10% 88%');
        root.style.setProperty('--accent-foreground', '20 14% 8%'); // Much darker
        root.style.setProperty('--border', '40 15% 85%');
        root.style.setProperty('--input', '40 15% 92%');
        root.style.setProperty('--ring', '25 95% 53%');
        break;
      case 'sage-moss':
        // Nature green theme
        root.style.setProperty('--background', '100 15% 96%'); // Light sage
        root.style.setProperty('--foreground', '140 25% 8%'); // Much darker forest green
        root.style.setProperty('--card', '100 12% 93%');
        root.style.setProperty('--card-foreground', '140 25% 8%'); // Much darker
        root.style.setProperty('--primary', '140 40% 35%'); // Forest green
        root.style.setProperty('--primary-foreground', '0 0% 100%');
        root.style.setProperty('--muted', '100 8% 88%');
        root.style.setProperty('--muted-foreground', '140 20% 25%'); // Much darker muted text
        root.style.setProperty('--accent', '100 8% 85%');
        root.style.setProperty('--accent-foreground', '140 25% 8%'); // Much darker
        root.style.setProperty('--border', '100 12% 82%');
        root.style.setProperty('--input', '100 12% 90%');
        root.style.setProperty('--ring', '140 40% 35%');
        break;
      case 'pastel-rose':
        // Soft pink theme
        root.style.setProperty('--background', '340 15% 97%'); // Light rose
        root.style.setProperty('--foreground', '340 30% 8%'); // Much darker rose
        root.style.setProperty('--card', '340 12% 94%');
        root.style.setProperty('--card-foreground', '340 30% 8%'); // Much darker
        root.style.setProperty('--primary', '340 70% 55%'); // Rose pink
        root.style.setProperty('--primary-foreground', '0 0% 100%');
        root.style.setProperty('--muted', '340 8% 90%');
        root.style.setProperty('--muted-foreground', '340 20% 25%'); // Much darker muted text
        root.style.setProperty('--accent', '340 8% 87%');
        root.style.setProperty('--accent-foreground', '340 30% 8%'); // Much darker
        root.style.setProperty('--border', '340 12% 85%');
        root.style.setProperty('--input', '340 12% 92%');
        root.style.setProperty('--ring', '340 70% 55%');
        break;
      default: // liquid-glass
        // Dark cosmic theme
        root.style.setProperty('--background', '222.2 84% 4.9%'); // Dark space
        root.style.setProperty('--foreground', '210 40% 98%'); // Bright white
        root.style.setProperty('--card', '222.2 84% 4.9%');
        root.style.setProperty('--card-foreground', '210 40% 98%');
        root.style.setProperty('--primary', '266 80% 65%'); // Purple
        root.style.setProperty('--primary-foreground', '210 40% 98%');
        root.style.setProperty('--muted', '217.2 32.6% 17.5%');
        root.style.setProperty('--muted-foreground', '215 20.2% 65.1%');
        root.style.setProperty('--accent', '217.2 32.6% 17.5%');
        root.style.setProperty('--accent-foreground', '210 40% 98%');
        root.style.setProperty('--border', '217.2 32.6% 17.5%');
        root.style.setProperty('--input', '217.2 32.6% 17.5%');
        root.style.setProperty('--ring', '266 80% 65%');
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