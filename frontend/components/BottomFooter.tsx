import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons, Zocial } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTheme } from "../constants/ThemeContext";

export type TabName = "all" | "status" | "rewards" | "profile";

interface BottomFooterProps {
  activeTab?: TabName;
}

export default function BottomFooter({ activeTab }: BottomFooterProps) {
  const { theme } = useTheme();

  const getIconColor = (tab: TabName) => {
    return activeTab === tab ? theme.primary : "#777777";
  };

  return (
    <View
      style={{
        backgroundColor: theme.gradient[0] || "#FFFFFF",
        borderTopWidth: 1.5,
        borderTopColor: theme.primary + "30",
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 10,
      }}
      className="absolute left-0 right-0 bottom-0 h-[60px] flex-row justify-around items-center rounded-t-[25px]"
    >
      {/* Task / All */}
      <TouchableOpacity
        onPress={() => router.push("/all")}
        activeOpacity={0.7}
      >
        <Ionicons
          name={activeTab === "all" ? "document-text" : "document-text-outline"}
          size={28}
          color={getIconColor("all")}
        />
      </TouchableOpacity>

      {/* Status */}
      <TouchableOpacity
        onPress={() => router.push("/status")}
        activeOpacity={0.7}
      >
        <Zocial
          name="statusnet"
          size={28}
          color={getIconColor("status")}
        />
      </TouchableOpacity>

      {/* Rewards */}
      <TouchableOpacity
        onPress={() => router.push("/rewards")}
        activeOpacity={0.7}
      >
        <Ionicons
          name={activeTab === "rewards" ? "gift" : "gift-outline"}
          size={28}
          color={getIconColor("rewards")}
        />
      </TouchableOpacity>

      {/* Profile */}
      <TouchableOpacity
        onPress={() => router.push("/profile-page")}
        activeOpacity={0.7}
      >
        <Ionicons
          name={activeTab === "profile" ? "person" : "person-outline"}
          size={28}
          color={getIconColor("profile")}
        />
      </TouchableOpacity>
    </View>
  );
}
