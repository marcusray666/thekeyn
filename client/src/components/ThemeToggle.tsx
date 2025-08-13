import { useTheme } from "../theme/ThemeProvider";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const dark = document.documentElement.classList.contains("dark");
  return (
    <button
      aria-label="Toggle theme"
      onClick={() => setTheme(dark ? "light" : "dark")}
      className="w-9 h-9 rounded-full border border-soft hover:bg-neutral-50 dark:hover:bg-neutral-900 flex items-center justify-center"
    >
      {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}