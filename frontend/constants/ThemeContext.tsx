import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCurrentProfileAsync, setCurrentProfile } from "./ProfileStore";
import BACKEND_URL from "../config";

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

const THEME_STORAGE_KEY = "niningo_selected_theme";

interface ThemeContextType {
  theme: ThemeConfig;
  setThemeKey: (key: ThemeKey) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: THEMES.purple,
  setThemeKey: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeKey, setThemeKeyState] = useState<ThemeKey>("purple");

  useEffect(() => {
    const initTheme = async () => {
      try {
        const savedThemeKey = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedThemeKey && savedThemeKey in THEMES) {
          setThemeKeyState(savedThemeKey as ThemeKey);
          return;
        }
      } catch (e) {
        console.error("Failed to load theme from storage:", e);
      }

      const profile = await getCurrentProfileAsync();
      const savedTheme = profile?.theme;
      if (savedTheme && savedTheme in THEMES) {
        setThemeKeyState(savedTheme as ThemeKey);
      }
    };
    initTheme();
  }, []);

  const setThemeKey = async (key: ThemeKey) => {
    if (key in THEMES) {
      setThemeKeyState(key);
      try {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, key);
      } catch (e) {
        console.error("Failed to save theme to storage:", e);
      }

      // Sync with profile store & backend
      try {
        const profile = await getCurrentProfileAsync();
        if (profile) {
          const updated = { ...profile, theme: key };
          await setCurrentProfile(updated);
          if (profile.username) {
            fetch(`${BACKEND_URL}/app/profile/`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                username: profile.username,
                theme: key,
              }),
            }).catch((err) => console.warn("Theme sync to backend failed:", err));
          }
        }
      } catch (err) {
        console.warn("Theme profile update failed:", err);
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme: THEMES[themeKey], setThemeKey }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

