import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

const applyTheme = (t: Theme) => {
  document.documentElement.classList.toggle("dark", t === "dark");
  localStorage.setItem("fincare-theme", t);
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem("fincare-theme") as Theme) || "light";
  });

  // On mount, ensure class matches localStorage (already set by inline script, but keep in sync)
  useEffect(() => {
    applyTheme(theme);
  }, []);

  // When user logs in, fetch their saved theme from Supabase and override localStorage
  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("theme")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data?.theme) {
          const t = data.theme as Theme;
          setTheme(t);
          applyTheme(t);
        }
      });
  }, [user?.id]);

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);

    // Sync to Supabase silently
    if (user) {
      supabase
        .from("profiles")
        .update({ theme: next })
        .eq("id", user.id)
        .then();
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
