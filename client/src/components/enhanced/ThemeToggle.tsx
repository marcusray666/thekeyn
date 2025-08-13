import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

interface ThemeToggleProps {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
  showLabel?: boolean;
}

export function ThemeToggle({ 
  variant = "ghost", 
  size = "default", 
  showLabel = false 
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="transition-colors duration-200"
    >
      {theme === "light" ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
      {showLabel && (
        <span className="ml-2">
          {theme === "light" ? "Dark" : "Light"} Mode
        </span>
      )}
    </Button>
  );
}