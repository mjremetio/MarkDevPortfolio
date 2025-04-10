import { createContext, useContext, useEffect, useState, ReactNode } from "react";

// Define theme type
type Theme = "dark" | "light";

// Define theme context type
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

// Create context with default values to avoid undefined check
export const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {}
});

// Custom hook for using theme
export function useTheme() {
  const context = useContext(ThemeContext);
  return context;
}

// Theme provider component
export function ThemeProvider({ children }: { children: ReactNode }) {
  // Initialize theme with SSR-safe approach
  const [theme, setTheme] = useState<Theme>("light");
  
  // Initialize theme from localStorage on component mount
  useEffect(() => {
    // Check local storage first
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
      setTheme(savedTheme);
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      // Then check system preference
      setTheme("dark");
    }
  }, []);

  // Update document classes and localStorage when theme changes
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Toggle between light and dark theme
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === "light" ? "dark" : "light"));
  };

  // Provide theme context to children
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
