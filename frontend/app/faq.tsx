import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTheme } from "../constants/ThemeContext";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: "1",
    question: "What is Niningo?",
    answer:
      "Niningo is a modern task and moment-sharing application designed to help you assign, track, and complete everyday tasks with your friends and contacts seamlessly.",
  },
  {
    id: "2",
    question: "How do I edit my profile information?",
    answer:
      "Go to Profile > Account. From there, you can view your profile picture, update your picture, edit your Name and Bio, and customize your app visual theme.",
  },
  {
    id: "3",
    question: "How do I change the app visual theme?",
    answer:
      "Navigate to Profile > Account > Theme. Tap the Theme row to expand the color palette and select your preferred color (Blue, Purple, Orange, Green, or Cyan).",
  },
  {
    id: "4",
    question: "Where can I view my task history?",
    answer:
      "Navigate to Profile > Activity. You can filter your tasks by Pending, Completed, and Expired categories.",
  },
  {
    id: "5",
    question: "How do I invite my friends?",
    answer:
      "Go to Profile > Invite Friends. You can copy your unique referral link or share it via WhatsApp, SMS, or any installed app.",
  },
];

function FAQAccordionItem({ item }: { item: FAQItem }) {
  const [isOpen, setIsOpen] = useState(false);
  const animValue = useRef(new Animated.Value(0)).current;

  const toggleAccordion = () => {
    const toValue = isOpen ? 0 : 1;
    setIsOpen(!isOpen);

    Animated.timing(animValue, {
      toValue,
      duration: 250,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: false,
    }).start();
  };

  const chevronRotate = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const contentHeight = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 95],
  });

  const contentOpacity = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View className="bg-white rounded-[18px] border border-[#E0E0E0] mb-[12px] overflow-hidden">
      <TouchableOpacity
        className="flex-row justify-between items-center p-[18px]"
        onPress={toggleAccordion}
        activeOpacity={0.7}
      >
        <Text className="text-[17px] font-bold text-black flex-1 mr-[10px]">
          {item.question}
        </Text>
        <Animated.View style={{ transform: [{ rotate: chevronRotate }] }}>
          <Ionicons name="chevron-down" size={22} color="#000" />
        </Animated.View>
      </TouchableOpacity>

      <Animated.View
        style={{
          maxHeight: contentHeight,
          opacity: contentOpacity,
          overflow: "hidden",
        }}
      >
        <View className="px-[18px] pb-[18px] pt-[2px] border-t border-[#F0F0F0]">
          <Text className="text-[15px] text-[#555] leading-[22px]">
            {item.answer}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

export default function FAQScreen() {
  const { theme } = useTheme();

  // Entrance Animations
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
              FAQ
            </Text>
          </Animated.View>

          {/* Accordions */}
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 30 }}
          >
            {FAQ_DATA.map((item) => (
              <FAQAccordionItem key={item.id} item={item} />
            ))}
          </ScrollView>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
