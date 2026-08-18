import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
  ScrollView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useTheme, THEMES, ThemeKey } from "../constants/ThemeContext";

export default function AccountScreen() {
  const { theme, setThemeKey } = useTheme();
  const [isThemeExpanded, setIsThemeExpanded] = useState(false);
  const [profileImage, setProfileImage] = useState<string>(
    "https://i.pravatar.cc/150?img=32"
  );

  // Entrance Animations
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-8)).current;

  const imageOpacity = useRef(new Animated.Value(0)).current;
  const imageScale = useRef(new Animated.Value(0.96)).current;

  const fieldsAnimValues = useRef(
    [0, 1, 2, 3].map(() => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(8),
    }))
  ).current;

  const themeRowOpacity = useRef(new Animated.Value(0)).current;
  const themeRowTranslateY = useRef(new Animated.Value(8)).current;

  // Accordion Theme Animations
  const themeExpandAnim = useRef(new Animated.Value(0)).current;
  const chevronRotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Header entrance
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

    // 2. Image entrance
    Animated.parallel([
      Animated.timing(imageOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(imageScale, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();

    // 3. Fields entrance (staggered)
    const fieldAnimations = fieldsAnimValues.map((anim) =>
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
    Animated.stagger(40, fieldAnimations).start();

    // 4. Theme row entrance
    Animated.parallel([
      Animated.timing(themeRowOpacity, {
        toValue: 1,
        duration: 250,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(themeRowTranslateY, {
        toValue: 0,
        duration: 250,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const pickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Permission to access media library is required to edit your picture."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });

      if (!result.canceled && result.assets && result.assets[0].uri) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log("Image picker error:", error);
    }
  };

  const toggleThemeAccordion = () => {
    const toValue = isThemeExpanded ? 0 : 1;
    setIsThemeExpanded(!isThemeExpanded);

    Animated.parallel([
      Animated.timing(themeExpandAnim, {
        toValue,
        duration: 250,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: false,
      }),
      Animated.timing(chevronRotateAnim, {
        toValue,
        duration: 250,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const chevronRotate = chevronRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const accordionHeight = themeExpandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 75],
  });

  const accordionOpacity = themeExpandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const colorKeys: ThemeKey[] = ["blue", "purple", "orange", "green", "cyan"];

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["left", "right", "bottom", "top"]}>
      <LinearGradient colors={theme.gradient} style={{ flex: 1 }}>
        <ScrollView
          className="flex-1 px-[25px] pt-[20px]"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
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
              Account
            </Text>
          </Animated.View>

          {/* Profile Picture Section */}
          <Animated.View
            className="items-center mb-[35px]"
            style={{
              opacity: imageOpacity,
              transform: [{ scale: imageScale }],
            }}
          >
            <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
              <Image
                source={{ uri: profileImage }}
                className="w-[120px] h-[120px] rounded-full mb-[12px] border-2 border-white"
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={pickImage} activeOpacity={0.7}>
              <Text
                className="text-[16px] font-bold"
                style={{ color: theme.primary }}
              >
                Edit Picture
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Editable-looking Cards */}
          <View>
            {/* Name */}
            <Animated.View
              style={{
                opacity: fieldsAnimValues[0].opacity,
                transform: [{ translateY: fieldsAnimValues[0].translateY }],
              }}
            >
              <View className="bg-white border border-[#E0E0E0] rounded-[18px] h-[60px] flex-row items-center justify-between px-[20px] mb-[15px]">
                <Text className="text-[18px] font-bold text-[#000]">Arisu</Text>
                <FontAwesome name="pencil" size={20} color="#000" />
              </View>
            </Animated.View>

            {/* Bio */}
            <Animated.View
              style={{
                opacity: fieldsAnimValues[1].opacity,
                transform: [{ translateY: fieldsAnimValues[1].translateY }],
              }}
            >
              <View className="bg-white border border-[#E0E0E0] rounded-[18px] h-[60px] flex-row items-center justify-between px-[20px] mb-[15px]">
                <Text className="text-[18px] font-bold text-[#000]">Bio</Text>
                <FontAwesome name="pencil" size={20} color="#000" />
              </View>
            </Animated.View>

            {/* Username */}
            <Animated.View
              style={{
                opacity: fieldsAnimValues[2].opacity,
                transform: [{ translateY: fieldsAnimValues[2].translateY }],
              }}
            >
              <View className="bg-white border border-[#E0E0E0] rounded-[18px] h-[60px] justify-center px-[20px] mb-[15px]">
                <Text className="text-[18px] font-bold text-[#888]">
                  @arisu123
                </Text>
              </View>
            </Animated.View>

            {/* Gender */}
            <Animated.View
              style={{
                opacity: fieldsAnimValues[3].opacity,
                transform: [{ translateY: fieldsAnimValues[3].translateY }],
              }}
            >
              <View className="bg-white border border-[#E0E0E0] rounded-[18px] h-[60px] justify-center px-[20px] mb-[15px]">
                <Text className="text-[18px] font-bold text-[#888]">male</Text>
              </View>
            </Animated.View>
          </View>

          {/* Theme Accordion Section */}
          <Animated.View
            style={{
              opacity: themeRowOpacity,
              transform: [{ translateY: themeRowTranslateY }],
            }}
          >
            <TouchableOpacity
              className="flex-row items-center justify-between mt-[15px] py-[10px]"
              onPress={toggleThemeAccordion}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center">
                <View className="w-[36px] h-[36px] justify-center items-center mr-[15px]">
                  <Ionicons name="moon" size={30} color={theme.primary} />
                </View>
                <Text className="text-[20px] font-bold text-[#000]">Theme</Text>
              </View>
              <Animated.View style={{ transform: [{ rotate: chevronRotate }] }}>
                <Ionicons name="chevron-down" size={24} color="#000" />
              </Animated.View>
            </TouchableOpacity>

            {/* Animated Horizontal Color Selector */}
            <Animated.View
              style={{
                height: accordionHeight,
                opacity: accordionOpacity,
                overflow: "hidden",
              }}
            >
              <View className="flex-row justify-around items-center pt-[15px] pb-[10px] px-[10px]">
                {colorKeys.map((key) => {
                  const colorPreset = THEMES[key];
                  const isSelected = theme.key === key;

                  return (
                    <TouchableOpacity
                      key={key}
                      onPress={() => setThemeKey(key)}
                      activeOpacity={0.8}
                      className="items-center justify-center"
                    >
                      <View
                        className="w-[44px] h-[44px] rounded-full items-center justify-center border-2"
                        style={{
                          backgroundColor: colorPreset.colorHex,
                          borderColor: isSelected ? "#000" : "transparent",
                          elevation: isSelected ? 4 : 1,
                        }}
                      >
                        {isSelected && (
                          <Ionicons name="checkmark" size={24} color="#fff" />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}
