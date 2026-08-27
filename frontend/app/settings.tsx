import React, { useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTheme } from "../constants/ThemeContext";

export default function SettingsScreen() {
  const { theme } = useTheme();

  // Entrance Animations
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-8)).current;

  const menuAnimValues = useRef(
    [0, 1, 2, 3, 4].map(() => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(8),
    }))
  ).current;

  useEffect(() => {
    // Header
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(headerTranslateY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();

    // Menu rows staggered
    const menuAnimations = menuAnimValues.map((anim) =>
      Animated.parallel([
        Animated.timing(anim.opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(anim.translateY, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ])
    );
    Animated.stagger(50, menuAnimations).start();
  }, []);

  const settingsItems = [
    { title: "FAQ", route: "/faq" },
    { title: "Privacy & Policy", route: "/privacy-policy" },
    { title: "Terms & Conditions", route: "/terms" },
    { title: "Help & Support", route: "/help-support" },
    { title: "About Us", route: "/about-us" },
  ];

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["left", "right", "bottom", "top"]}>
      <LinearGradient colors={theme.gradient} style={{ flex: 1 }}>
        <View className="px-[25px] pt-[20px] flex-1">
          {/* Header */}
          <Animated.View
            className="flex-row items-center mb-[30px]"
            style={{
              opacity: headerOpacity,
              transform: [{ translateY: headerTranslateY }],
            }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-[15px]"
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={28} color="#000" />
            </TouchableOpacity>
            <Text
              className="text-[28px] font-bold"
              style={{ color: theme.primary }}
            >
              Settings
            </Text>
          </Animated.View>

          {/* Menu Items */}
          {settingsItems.map((item, index) => (
            <Animated.View
              key={index}
              style={{
                opacity: menuAnimValues[index].opacity,
                transform: [{ translateY: menuAnimValues[index].translateY }],
              }}
            >
              <TouchableOpacity
                className="flex-row justify-between items-center py-[20px]"
                onPress={() => router.push(item.route as any)}
                activeOpacity={0.7}
              >
                <Text className="text-[20px] font-bold text-black">
                  {item.title}
                </Text>
                <Ionicons name="chevron-forward" size={24} color="#000" />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
