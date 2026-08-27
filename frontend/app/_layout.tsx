import "../global.css";
import { Stack } from "expo-router";
import { ThemeProvider, useTheme } from "../constants/ThemeContext";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";

function RootContent() {
  const { theme } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.gradient[0] }}>
      <StatusBar style="light" backgroundColor={theme.primary} />
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootContent />
    </ThemeProvider>
  );
}

