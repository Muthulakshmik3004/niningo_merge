import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Animated,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { useTheme } from "../constants/ThemeContext";
import BottomFooter from "../components/BottomFooter";
import { getCurrentProfileAsync, setCurrentProfile, clearCurrentProfile } from "../constants/ProfileStore";
import { clearSession, getUsername } from "../services/session";
import BACKEND_URL from "../config";

export default function ProfilePage() {
  const { theme, setThemeKey } = useTheme();
  const [profileImage, setProfileImage] = useState<string>("https://i.pravatar.cc/150?img=32");
  const [displayName, setDisplayName] = useState("User");
  const [displayBio, setDisplayBio] = useState("Bio");
  const [loading, setLoading] = useState(false);

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

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const cached = await getCurrentProfileAsync();
        const sessionUsername = await getUsername();
        const targetUsername = cached?.username || sessionUsername;

        if (targetUsername) {
          try {
            setLoading(true);
            const response = await fetch(
              `${BACKEND_URL}/app/profile/?username=${encodeURIComponent(targetUsername)}`
            );
            const data = await response.json();
            if (response.ok && data.profile) {
              const p = data.profile;
              setDisplayName(p.name || cached?.name || p.username || targetUsername);
              setDisplayBio(p.bio || "");
              if (p.profile_image) {
                setProfileImage(p.profile_image);
              }
              if (p.theme) {
                setThemeKey(p.theme);
              }
              await setCurrentProfile({
                name: p.name || "",
                username: p.username || targetUsername,
                bio: p.bio || "",
                language: p.language || "",
                gender: p.gender || "",
                theme: p.theme || "purple",
                profile_image: p.profile_image || null,
              });
            } else if (cached?.name) {
              setDisplayName(cached.name);
              setDisplayBio(cached.bio || "");
            }
          } catch (err) {
            console.error("Failed to fetch profile:", err);
            if (cached?.name) setDisplayName(cached.name);
          } finally {
            setLoading(false);
          }
        }
      };
      load();
    }, [])
  );

  useEffect(() => {

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
          onPress: async () => {
            await clearCurrentProfile();
            await clearSession();
            router.replace("/");
          },
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
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.gradient[0] }} edges={["left", "right", "bottom", "top"]}>
      <LinearGradient colors={theme.gradient} style={{ flex: 1 }}>
        <View className="px-[25px] pt-[20px] flex-1">
          {loading && (
            <View className="items-center mb-[15px]">
              <ActivityIndicator size="small" color={theme.primary} />
            </View>
          )}

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
              source={{ uri: profileImage }}
              className="w-[85px] h-[85px] rounded-full border-2 border-[#fff]"
            />
            <View className="ml-[20px] flex-1">
              <View className="flex-row items-center">
                <Text className="text-[22px] font-bold text-black">{displayName}</Text>
                <TouchableOpacity
                  onPress={() => router.push("/account")}
                  className="ml-[10px] w-[28px] h-[28px] rounded-full bg-white justify-center items-center"
                  style={{ elevation: 3, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 3 }}
                >
                  <Ionicons name="pencil" size={16} color={theme.primary} />
                </TouchableOpacity>
              </View>
              <Text className="text-[18px] text-[#666] font-semibold mt-[2px]">{displayBio}</Text>
            </View>
            <TouchableOpacity
              className="items-center justify-center p-[5px]"
              onPress={() => router.push("/ranking")}
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
        <BottomFooter activeTab="profile" />
      </LinearGradient>
    </SafeAreaView>
  );
}
