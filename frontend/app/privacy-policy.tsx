import React, { useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTheme } from "../constants/ThemeContext";

export default function PrivacyPolicyScreen() {
  const { theme } = useTheme();

  // Entrance Animation
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-8)).current;

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
              Privacy & Policy
            </Text>
          </Animated.View>

          {/* Content */}
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            <View className="bg-white rounded-[20px] p-[20px] border border-[#E0E0E0]">
              <Text className="text-[18px] font-bold text-black mb-[10px]">
                Niningo Privacy Policy
              </Text>
              <Text className="text-[14px] text-[#888] mb-[20px]">
                Last Updated: August 2026
              </Text>

              <Text className="text-[16px] font-bold text-black mb-[6px]">
                1. Introduction
              </Text>
              <Text className="text-[15px] text-[#444] leading-[24px] mb-[18px]">
                Welcome to Niningo. We are committed to protecting your privacy
                and ensuring a safe user experience. This policy explains how we
                collect, use, and protect your information.
              </Text>

              <Text className="text-[16px] font-bold text-black mb-[6px]">
                2. Information We Collect
              </Text>
              <Text className="text-[15px] text-[#444] leading-[24px] mb-[18px]">
                • Mobile Number: Used exclusively for account authentication via OTP verification.{"\n"}
                • Profile Information: Your Name, Username, Bio, Gender, and Profile Picture that you provide during registration or account editing.{"\n"}
                • Task & Activity Data: Information relating to tasks assigned, completed, or shared within the app.
              </Text>

              <Text className="text-[16px] font-bold text-black mb-[6px]">
                3. How We Use Information
              </Text>
              <Text className="text-[15px] text-[#444] leading-[24px] mb-[18px]">
                We use your information to facilitate task sharing, maintain user accounts, provide customer support, and continuously enhance your application experience.
              </Text>

              <Text className="text-[16px] font-bold text-black mb-[6px]">
                4. Data Protection & Security
              </Text>
              <Text className="text-[15px] text-[#444] leading-[24px] mb-[18px]">
                We implement standard administrative and technical safeguards to keep your personal data secure. We do not sell or monetize your personal data.
              </Text>

              <Text className="text-[16px] font-bold text-black mb-[6px]">
                5. Contact Us
              </Text>
              <Text className="text-[15px] text-[#444] leading-[24px]">
                If you have questions regarding this Privacy Policy, please contact us at support@niningo.app.
              </Text>
            </View>
          </ScrollView>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
