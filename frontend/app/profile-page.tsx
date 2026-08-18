import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Animated,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTheme } from "../constants/ThemeContext";

export default function ProfilePage() {
  const { theme } = useTheme();

  // Animations
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(-8)).current;

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerScale = useRef(new Animated.Value(0.96)).current;

  const menuAnimValues = useRef(
    [0, 1, 2, 3, 4].map(() => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(8),
    }))
  ).current;

  useEffect(() => {
    // 1. Title animation
    Animated.parallel([
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(titleTranslateY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Header animation
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(headerScale, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();

    // 3. Staggered Menu animations
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

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => router.replace("/"),
        },
      ],
      { cancelable: true }
    );
  };

  const menuItems = [
    { title: "Account", action: () => router.push("/account") },
    { title: "Activity", action: () => router.push("/activity") },
    { title: "Invite Friends", action: () => router.push("/invite-friends") },
    { title: "Settings", action: () => router.push("/settings") },
    { title: "Logout", action: handleLogout },
  ];

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["left", "right", "bottom", "top"]}>
      <LinearGradient colors={theme.gradient} style={{ flex: 1 }}>
        <View className="px-[25px] pt-[20px] flex-1">
          {/* Animated Header Title */}
          <Animated.View
            style={{
              opacity: titleOpacity,
              transform: [{ translateY: titleTranslateY }],
            }}
          >
            <Text
              className="text-[28px] font-bold mb-[20px]"
              style={{ color: theme.primary }}
            >
              Profile
            </Text>
          </Animated.View>

          {/* Animated User Info Section */}
          <Animated.View
            className="flex-row items-center mb-[40px]"
            style={{
              opacity: headerOpacity,
              transform: [{ scale: headerScale }],
            }}
          >
            <Image
              source={{ uri: "https://i.pravatar.cc/150?img=32" }}
              className="w-[85px] h-[85px] rounded-full border-2 border-[#fff]"
            />
            <View className="ml-[20px] flex-1">
              <Text className="text-[22px] font-bold text-black">Arisu</Text>
              <Text className="text-[18px] text-[#666] font-semibold">Bio</Text>
            </View>
            <TouchableOpacity
              className="items-center justify-center p-[5px]"
              onPress={() => router.push("/activity")}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="podium"
                size={30}
                color={theme.primary}
              />
              <MaterialCommunityIcons
                name="star"
                size={14}
                color={theme.primary}
                style={{ position: "absolute", top: -6 }}
              />
            </TouchableOpacity>
          </Animated.View>

          {/* Animated Menu Items */}
          {menuItems.map((item, index) => (
            <Animated.View
              key={index}
              style={{
                opacity: menuAnimValues[index].opacity,
                transform: [{ translateY: menuAnimValues[index].translateY }],
              }}
            >
              <TouchableOpacity
                className="flex-row justify-between items-center py-[20px]"
                onPress={item.action}
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

        {/* Bottom Navigation */}
        <View className="absolute left-0 right-0 bottom-0 h-[65px] flex-row justify-around items-center bg-white border-t border-[#eee] rounded-t-[25px]">
          <TouchableOpacity onPress={() => router.push("/all")}>
            <Ionicons name="clipboard-outline" size={28} color="#777" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/status")}>
            <Ionicons name="chatbubble-outline" size={28} color="#777" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="gift-outline" size={28} color="#777" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/profile-page")}>
            <Ionicons name="person" size={28} color={theme.primary} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
