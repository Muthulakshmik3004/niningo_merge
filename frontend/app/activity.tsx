import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTheme } from "../constants/ThemeContext";

type TabState = "Pending" | "Completed" | "Expired";

const PENDING_DATA = [
  {
    id: "1",
    name: "Kani Mozhi",
    desc: "Pharmacy task Pending",
    date: "Apr 14, 2026",
  },
  {
    id: "2",
    name: "Ram Kumar",
    desc: "Grocery task Pending",
    date: "Apr 13, 2026",
  },
  {
    id: "3",
    name: "Saranya",
    desc: "Grocery task Pending",
    date: "Apr 13, 2026",
  },
];

const COMPLETED_DATA = [
  {
    id: "1",
    name: "Vijay Kumar",
    desc: "Grocery task Completed",
    date: "Today, 9:15 am",
  },
  {
    id: "2",
    name: "Rajasekaran",
    desc: "Fun task Completed",
    date: "Yesterday",
  },
  {
    id: "3",
    name: "Saam Bro",
    desc: "Fun task Completed",
    date: "Apr 9, 2026",
  },
];

const EXPIRED_DATA = [
  {
    id: "1",
    name: "Kathija",
    desc: "This task is expired",
    date: "Apr 9, 2026",
  },
  {
    id: "2",
    name: "Amma",
    desc: "This task is expired",
    date: "Apr 8, 2026",
  },
];

export default function ActivityScreen() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabState>("Pending");

  // Entrance Animations
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-8)).current;

  const tabsOpacity = useRef(new Animated.Value(0)).current;

  // List Transition Animation
  const listOpacity = useRef(new Animated.Value(1)).current;
  const listTranslateY = useRef(new Animated.Value(0)).current;

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
      Animated.timing(tabsOpacity, {
        toValue: 1,
        duration: 250,
        delay: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleTabChange = (newTab: TabState) => {
    if (newTab === activeTab) return;

    // Fade out list quickly
    Animated.parallel([
      Animated.timing(listOpacity, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(listTranslateY, {
        toValue: 6,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setActiveTab(newTab);
      // Fade/slide back in
      Animated.parallel([
        Animated.timing(listOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(listTranslateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const getTabData = () => {
    switch (activeTab) {
      case "Pending":
        return {
          data: PENDING_DATA,
          cardBg: "bg-[#FFF8EC]",
          cardBorder: "border-[#FFE0B2]",
          badgeBg: "bg-[#FCAC04]",
          badgeText: "Pending",
        };
      case "Completed":
        return {
          data: COMPLETED_DATA,
          cardBg: "bg-[#F0FDF4]",
          cardBorder: "border-[#BBF7D0]",
          badgeBg: "bg-[#34EF4A]",
          badgeText: "Completed",
        };
      case "Expired":
        return {
          data: EXPIRED_DATA,
          cardBg: "bg-[#FEF2F2]",
          cardBorder: "border-[#FCA5A5]",
          badgeBg: "bg-[#DE4314]",
          badgeText: "Expired",
        };
    }
  };

  const { data, cardBg, cardBorder, badgeBg, badgeText } = getTabData();

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["left", "right", "bottom", "top"]}>
      <LinearGradient colors={theme.gradient} style={{ flex: 1 }}>
        <View className="pt-[20px] flex-1">
          {/* Header */}
          <Animated.View
            className="px-[25px]"
            style={{
              opacity: headerOpacity,
              transform: [{ translateY: headerTranslateY }],
            }}
          >
            <View className="flex-row items-center mb-[10px]">
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
                Activity
              </Text>
            </View>

            <Text className="text-[16px] text-[#222] font-semibold mb-[20px]">
              A complete view of your task journey over time.
            </Text>
          </Animated.View>

          {/* Pill Tabs */}
          <Animated.View
            className="px-[20px] flex-row justify-between mb-[25px]"
            style={{ opacity: tabsOpacity }}
          >
            {/* Pending Tab */}
            <TouchableOpacity
              onPress={() => handleTabChange("Pending")}
              activeOpacity={0.8}
              className={`flex-1 items-center py-[10px] rounded-[20px] border mx-[5px] ${
                activeTab === "Pending"
                  ? "bg-[#FCAC04] border-[#FCAC04]"
                  : "bg-transparent border-[#B0B0B0]"
              }`}
            >
              <Text className="font-bold text-black text-[15px]">Pending</Text>
            </TouchableOpacity>

            {/* Completed Tab */}
            <TouchableOpacity
              onPress={() => handleTabChange("Completed")}
              activeOpacity={0.8}
              className={`flex-1 items-center py-[10px] rounded-[20px] border mx-[5px] ${
                activeTab === "Completed"
                  ? "bg-[#34EF4A] border-[#34EF4A]"
                  : "bg-transparent border-[#B0B0B0]"
              }`}
            >
              <Text className="font-bold text-black text-[15px]">
                Completed
              </Text>
            </TouchableOpacity>

            {/* Expired Tab */}
            <TouchableOpacity
              onPress={() => handleTabChange("Expired")}
              activeOpacity={0.8}
              className={`flex-1 items-center py-[10px] rounded-[20px] border mx-[5px] ${
                activeTab === "Expired"
                  ? "bg-[#DE4314] border-[#DE4314]"
                  : "bg-transparent border-[#B0B0B0]"
              }`}
            >
              <Text className="font-bold text-black text-[15px]">Expired</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* List Content with smooth transition */}
          <ScrollView
            className="flex-1 px-[20px]"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 30 }}
          >
            <Animated.View
              style={{
                opacity: listOpacity,
                transform: [{ translateY: listTranslateY }],
              }}
            >
              {data.map((item) => (
                <View
                  key={item.id}
                  className={`flex-row justify-between items-center py-[16px] px-[20px] mb-[12px] rounded-[16px] border ${cardBg} ${cardBorder}`}
                >
                  <View className="flex-1 mr-[10px]">
                    <Text className="text-[18px] font-bold text-black mb-[4px]">
                      {item.name}
                    </Text>
                    <Text className="text-[15px] text-[#333] mb-[4px]">
                      {item.desc}
                    </Text>
                    <Text className="text-[13px] text-[#666]">{item.date}</Text>
                  </View>

                  <View
                    className={`px-[14px] py-[7px] rounded-full ${badgeBg}`}
                  >
                    <Text className="text-black font-bold text-[13px]">
                      {badgeText}
                    </Text>
                  </View>
                </View>
              ))}
            </Animated.View>
          </ScrollView>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
