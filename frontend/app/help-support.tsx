import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Linking,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTheme } from "../constants/ThemeContext";

export default function HelpSupportScreen() {
  const { theme } = useTheme();

  // Entrance Animations
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-8)).current;

  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(8)).current;

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
      Animated.timing(contentTranslateY, {
        toValue: 0,
        duration: 250,
        delay: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleEmailSupport = () => {
    Linking.openURL("mailto:support@niningo.app").catch(() => {
      Alert.alert(
        "Contact Support",
        "Please send an email to support@niningo.app"
      );
    });
  };

  const handleReportProblem = () => {
    Alert.alert(
      "Report a Problem",
      "Thank you for reporting! Our team will investigate and address your feedback promptly."
    );
  };

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
              Help & Support
            </Text>
          </Animated.View>

          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            <Animated.View
              style={{
                opacity: contentOpacity,
                transform: [{ translateY: contentTranslateY }],
              }}
            >
              {/* Option 1: Email Support */}
              <TouchableOpacity
                onPress={handleEmailSupport}
                activeOpacity={0.8}
                className="bg-white rounded-[20px] p-[20px] border border-[#E0E0E0] mb-[15px] flex-row items-center justify-between"
              >
                <View className="flex-row items-center flex-1 mr-[10px]">
                  <View
                    className="w-[48px] h-[48px] rounded-full justify-center items-center mr-[15px]"
                    style={{ backgroundColor: `${theme.primary}18` }}
                  >
                    <Ionicons name="mail" size={24} color={theme.primary} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[18px] font-bold text-black mb-[2px]">
                      Contact Support
                    </Text>
                    <Text className="text-[14px] text-[#666]">
                      Email support@niningo.app
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={22} color="#888" />
              </TouchableOpacity>

              {/* Option 2: Report Problem */}
              <TouchableOpacity
                onPress={handleReportProblem}
                activeOpacity={0.8}
                className="bg-white rounded-[20px] p-[20px] border border-[#E0E0E0] mb-[15px] flex-row items-center justify-between"
              >
                <View className="flex-row items-center flex-1 mr-[10px]">
                  <View
                    className="w-[48px] h-[48px] rounded-full justify-center items-center mr-[15px]"
                    style={{ backgroundColor: `${theme.primary}18` }}
                  >
                    <MaterialCommunityIcons
                      name="alert-circle-outline"
                      size={26}
                      color={theme.primary}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[18px] font-bold text-black mb-[2px]">
                      Report a Problem
                    </Text>
                    <Text className="text-[14px] text-[#666]">
                      Let us know if something isn't working
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={22} color="#888" />
              </TouchableOpacity>

              {/* Option 3: FAQ */}
              <TouchableOpacity
                onPress={() => router.push("/faq")}
                activeOpacity={0.8}
                className="bg-white rounded-[20px] p-[20px] border border-[#E0E0E0] mb-[15px] flex-row items-center justify-between"
              >
                <View className="flex-row items-center flex-1 mr-[10px]">
                  <View
                    className="w-[48px] h-[48px] rounded-full justify-center items-center mr-[15px]"
                    style={{ backgroundColor: `${theme.primary}18` }}
                  >
                    <Ionicons
                      name="help-circle-outline"
                      size={26}
                      color={theme.primary}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[18px] font-bold text-black mb-[2px]">
                      Browse FAQs
                    </Text>
                    <Text className="text-[14px] text-[#666]">
                      Find quick answers to common questions
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={22} color="#888" />
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
