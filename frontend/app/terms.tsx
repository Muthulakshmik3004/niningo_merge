import React, { useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTheme } from "../constants/ThemeContext";

export default function TermsScreen() {
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
              Terms & Conditions
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
                Niningo Terms & Conditions
              </Text>
              <Text className="text-[14px] text-[#888] mb-[20px]">
                Welcome to Niningo. By using our application, you agree to the following terms.
              </Text>

              <Text className="text-[16px] font-bold text-black mb-[6px]">
                1. Account Registration
              </Text>
              <Text className="text-[15px] text-[#444] leading-[24px] mb-[18px]">
                Users must provide accurate and genuine information when creating or editing their account profile. You are responsible for maintaining confidentiality.
              </Text>

              <Text className="text-[16px] font-bold text-black mb-[6px]">
                2. Mobile Verification
              </Text>
              <Text className="text-[15px] text-[#444] leading-[24px] mb-[18px]">
                Your registered mobile number is used strictly for authentication and account security via OTP verification.
              </Text>

              <Text className="text-[16px] font-bold text-black mb-[6px]">
                3. User Conduct & Content
              </Text>
              <Text className="text-[15px] text-[#444] leading-[24px] mb-[18px]">
                You agree not to upload harmful, offensive, illegal, or misleading content. Respect all users in collaborative task features.
              </Text>

              <Text className="text-[16px] font-bold text-black mb-[6px]">
                4. Account Suspension
              </Text>
              <Text className="text-[15px] text-[#444] leading-[24px] mb-[18px]">
                We reserve the right to suspend or terminate accounts that violate community standards or engage in fraudulent activities.
              </Text>

              <Text className="text-[16px] font-bold text-black mb-[6px]">
                5. Updates to Terms
              </Text>
              <Text className="text-[15px] text-[#444] leading-[24px]">
                Services and terms may be updated periodically. Continued use of Niningo constitutes your acceptance of any changes.
              </Text>
            </View>
          </ScrollView>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}