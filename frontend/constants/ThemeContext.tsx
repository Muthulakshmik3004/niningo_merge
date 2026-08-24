import React, { createContext, useContext, useState, useEffect } from "react";
import { getCurrentProfileAsync } from "./ProfileStore";

export type ThemeKey = "blue" | "purple" | "orange" | "green" | "cyan";

export interface ThemeConfig {
  key: ThemeKey;
  name: string;
  primary: string;
  gradient: [string, string];
  colorHex: string;
}

export const THEMES: Record<ThemeKey, ThemeConfig> = {
  blue: {
    key: "blue",
    name: "Blue",
    primary: "#3B82F6",
    gradient: ["#E0F2FE", "#F0F9FF"],
    colorHex: "#3B82F6",
  },
  purple: {
    key: "purple",
    name: "Purple",
    primary: "#B84CE8",
    gradient: ["#FDE6FE", "#FFF7FD"],
    colorHex: "#B84CE8",
  },
  orange: {
    key: "orange",
    name: "Orange",
    primary: "#F97316",
    gradient: ["#FFEDD5", "#FFF7ED"],
    colorHex: "#F97316",
  },
  green: {
    key: "green",
    name: "Green",
    primary: "#22C55E",
    gradient: ["#DCFCE7", "#F0FDF4"],
    colorHex: "#22C55E",
  },
  cyan: {
    key: "cyan",
    name: "Cyan",
    primary: "#06B6D4",
    gradient: ["#CFFAFE", "#ECFEFF"],
    colorHex: "#06B6D4",
  },
};

interface ThemeContextType {
  theme: ThemeConfig;
  setThemeKey: (key: ThemeKey) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: THEMES.purple,
  setThemeKey: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeKey, setThemeKey] = useState<ThemeKey>("purple");

  useEffect(() => {
    const initTheme = async () => {
      const profile = await getCurrentProfileAsync();
      const savedTheme = profile?.theme;
      if (savedTheme && savedTheme in THEMES) {
        setThemeKey(savedTheme as ThemeKey);
      }
    };
    initTheme();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: THEMES[themeKey], setThemeKey }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
