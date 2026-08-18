import React, { useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTheme } from "../constants/ThemeContext";

export default function AboutUsScreen() {
  const { theme } = useTheme();

  // Entrance Animations
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-8)).current;

  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentScale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
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
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 250,
        delay: 100,
        useNativeDriver: true,
      }),
      Animated.timing(contentScale, {
        toValue: 1,
        duration: 250,
        delay: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["left", "right", "bottom", "top"]}>
      <LinearGradient colors={theme.gradient} style={{ flex: 1 }}>
        <View className="px-[25px] pt-[20px] flex-1">
          {/* Header */}
          <Animated.View
            className="flex-row items-center mb-[25px]"
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
              About Us
            </Text>
          </Animated.View>

          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            <Animated.View
              className="bg-white rounded-[24px] p-[25px] items-center border border-[#E0E0E0]"
              style={{
                opacity: contentOpacity,
                transform: [{ scale: contentScale }],
                elevation: 4,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 10,
              }}
            >
              {/* App Logo */}
              <Image
                source={require("../assets/images/logoo.png")}
                className="w-[180px] h-[100px] mb-[15px]"
                resizeMode="contain"
              />

              <Text className="text-[24px] font-bold text-black mb-[4px]">
                Niningo
              </Text>

              <View
                className="px-[14px] py-[4px] rounded-full mb-[20px]"
                style={{ backgroundColor: `${theme.primary}20` }}
              >
                <Text
                  className="text-[13px] font-bold"
                  style={{ color: theme.primary }}
                >
                  Version 1.0.0
                </Text>
              </View>

              <Text className="text-[15px] text-[#444] text-center leading-[24px] mb-[20px]">
                Niningo is a task and moment management platform designed to help
                individuals and teams collaborate, track daily activities, and stay
                connected effortlessly.
              </Text>

              <Text className="text-[14px] text-[#888] text-center">
                © 2026 Niningo. All rights reserved.
              </Text>
            </Animated.View>
          </ScrollView>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
