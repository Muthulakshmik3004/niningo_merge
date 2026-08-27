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
  TextInput,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useTheme, THEMES, ThemeKey } from "../constants/ThemeContext";
import { getCurrentProfileAsync, setCurrentProfile } from "../constants/ProfileStore";
import { getUsername } from "../services/session";
import BACKEND_URL from "../config";

export default function AccountScreen() {
  const { theme, setThemeKey } = useTheme();
  const [isThemeExpanded, setIsThemeExpanded] = useState(false);
  const [profileImage, setProfileImage] = useState<string>(
    "https://i.pravatar.cc/150?img=32"
  );

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [username, setUsername] = useState("");
  const [gender, setGender] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey>(theme.key);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveVisible, setSaveVisible] = useState(false);

  const originalName = useRef("");
  const originalBio = useRef("");
  const originalTheme = useRef<ThemeKey>(theme.key);
  const originalImage = useRef<string>("https://i.pravatar.cc/150?img=32");

  useEffect(() => {
    setSelectedTheme(theme.key);
  }, [theme.key]);

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

  const checkChanges = () => {
    const nameChanged = name.trim() !== originalName.current.trim();
    const bioChanged = bio.trim() !== originalBio.current.trim();
    const themeChanged = selectedTheme !== originalTheme.current;
    const imageChanged = profileImage !== originalImage.current;
    setSaveVisible(nameChanged || bioChanged || themeChanged || imageChanged);
  };

  const fetchProfileFromBackend = async () => {
    const cached = await getCurrentProfileAsync();
    const sessionUsername = await getUsername();
    const targetUsername = cached?.username || sessionUsername;

    if (!targetUsername) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${BACKEND_URL}/app/profile/?username=${encodeURIComponent(targetUsername)}`
      );
      const data = await response.json();
      if (response.ok && data.profile) {
        const p = data.profile;
        setName(p.name || "");
        setBio(p.bio || "");
        setUsername(p.username || targetUsername);
        
        originalName.current = p.name || "";
        originalBio.current = p.bio || "";
        setGender(p.gender || "");
        if (p.profile_image) {
          setProfileImage(p.profile_image);
        }
        originalImage.current = p.profile_image || "https://i.pravatar.cc/150?img=32";
        await setCurrentProfile({
          name: p.name || "",
          username: p.username || targetUsername,
          bio: p.bio || "",
          language: p.language || "",
          gender: p.gender || "",
          theme: p.theme || theme.key,
          profile_image: p.profile_image || null,
        });
      }
    } catch (err) {
      console.error("Fetch profile error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const cached = await getCurrentProfileAsync();
      if (cached) {
        setName(cached.name || "");
        setBio(cached.bio || "");
        setUsername(cached.username || "");
        originalName.current = cached.name || "";
        originalBio.current = cached.bio || "";
        setGender(cached.gender || "");
        if (cached.profile_image) {
          setProfileImage(cached.profile_image);
        }
        originalImage.current = cached.profile_image || "https://i.pravatar.cc/150?img=32";
      }
      await fetchProfileFromBackend();
    };
    init();

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
        const uri = result.assets[0].uri;
        setProfileImage(uri);
        const profile = await getCurrentProfileAsync();
        if (profile?.username) {
          await setCurrentProfile({
            name: profile.name || "",
            username: profile.username || "",
            bio: profile.bio || "",
            language: profile.language || "",
            gender: profile.gender || "",
            theme: profile.theme || "purple",
            profile_image: uri,
          });
        }
        checkChanges();
      }
    } catch (error) {
      console.log("Image picker error:", error);
    }
  };

  const saveProfile = async () => {
    if (!saveVisible) return;

    const profile = await getCurrentProfileAsync();
    const sessionUsername = await getUsername();
    const targetUsername = username || profile?.username || sessionUsername;

    if (!targetUsername) {
      Alert.alert("Error", "No profile loaded.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${BACKEND_URL}/app/profile/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: targetUsername,
          name: name.trim(),
          bio: bio.trim(),
          theme: selectedTheme,
          profile_image: profileImage,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        const updated = data.profile || {};
        await setCurrentProfile({
          name: updated.name || name.trim(),
          username: updated.username || profile.username,
          bio: updated.bio || bio.trim(),
          language: updated.language || profile.language || "",
          gender: updated.gender || profile.gender || "",
          theme: updated.theme || selectedTheme,
          profile_image: updated.profile_image || profileImage,
        });
        originalName.current = updated.name || name.trim();
        originalBio.current = updated.bio || bio.trim();
        originalTheme.current = (updated.theme as ThemeKey) || selectedTheme;
        originalImage.current = updated.profile_image || profileImage;
        setSaveVisible(false);
        Alert.alert("Success", "Profile updated successfully!");
      } else {
        Alert.alert(data.error || "Failed to update profile. Please try again.");
      }
    } catch (err: any) {
      console.error("Update profile error:", err);
      Alert.alert(
        "Connection Error",
        `Could not reach the backend server at: ${BACKEND_URL}\n\nError details: ${err.message || err}`
      );
    } finally {
      setSaving(false);
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
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.gradient[0] }} edges={["left", "right", "bottom", "top"]}>
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
              <Ionicons name="arrow-back" size={28} color={theme.primary} />
            </TouchableOpacity>
            <Text
              className="text-[28px] font-bold"
              style={{ color: theme.primary }}
            >
              Account
            </Text>
          </Animated.View>

          {loading && (
            <View className="items-center mb-[20px]">
              <ActivityIndicator size="small" color={theme.primary} />
            </View>
          )}

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

          {/* Editable Cards */}
          <View>
            {/* Name */}
            <Animated.View
              style={{
                opacity: fieldsAnimValues[0].opacity,
                transform: [{ translateY: fieldsAnimValues[0].translateY }],
              }}
            >
              <View className="bg-white border border-[#E0E0E0] rounded-[18px] px-[20px] mb-[15px]">
                <Text className="text-[14px] font-semibold mt-[12px]" style={{ color: theme.primary }}>
                  Name
                </Text>
                <TextInput
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    checkChanges();
                  }}
                  onBlur={checkChanges}
                  className="text-[18px] font-bold text-[#000] pb-[12px] pt-[4px]"
                  placeholder="Enter your name"
                />
              </View>
            </Animated.View>

            {/* Bio */}
            <Animated.View
              style={{
                opacity: fieldsAnimValues[1].opacity,
                transform: [{ translateY: fieldsAnimValues[1].translateY }],
              }}
            >
              <View className="bg-white border border-[#E0E0E0] rounded-[18px] px-[20px] mb-[15px]">
                <Text className="text-[14px] font-semibold mt-[12px]" style={{ color: theme.primary }}>
                  Bio
                </Text>
                <TextInput
                  value={bio}
                  onChangeText={(text) => {
                    setBio(text);
                    checkChanges();
                  }}
                  onBlur={checkChanges}
                  placeholder="Tell us about yourself"
                  className="text-[18px] font-bold text-[#000] pb-[12px] pt-[4px]"
                />
              </View>
            </Animated.View>

            {/* Username - READ ONLY */}
            <Animated.View
              style={{
                opacity: fieldsAnimValues[2].opacity,
                transform: [{ translateY: fieldsAnimValues[2].translateY }],
              }}
            >
              <View className="bg-white border border-[#E0E0E0] rounded-[18px] h-[60px] justify-center px-[20px] mb-[15px]">
                <Text className="text-[18px] font-bold" style={{ color: theme.primary }}>
                  @{username || "username"}
                </Text>
              </View>
            </Animated.View>

            {/* Gender - READ ONLY */}
            <Animated.View
              style={{
                opacity: fieldsAnimValues[3].opacity,
                transform: [{ translateY: fieldsAnimValues[3].translateY }],
              }}
            >
              <View className="bg-white border border-[#E0E0E0] rounded-[18px] h-[60px] justify-center px-[20px] mb-[15px]">
                <Text className="text-[18px] font-bold" style={{ color: theme.primary }}>
                  {gender || "Gender"}
                </Text>
              </View>
            </Animated.View>

            {/* Save Button - only visible when changed */}
            {saveVisible && (
              <TouchableOpacity onPress={saveProfile} disabled={saving} className="mb-[20px]">
                <LinearGradient
                  colors={saving ? ["#E0E0E0", "#9E9E9E"] : [theme.primary, theme.primary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    height: 55,
                    borderRadius: 30,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : (
                    <Text className="text-[20px] font-bold text-black">Save Changes</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            )}
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
                <Text className="text-[20px] font-bold" style={{ color: theme.primary }}>Theme</Text>
              </View>
              <Animated.View style={{ transform: [{ rotate: chevronRotate }] }}>
                <Ionicons name="chevron-down" size={24} color={theme.primary} />
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
                      onPress={() => {
                        setSelectedTheme(key);
                        setThemeKey(key);
                        checkChanges();
                      }}
                      activeOpacity={0.8}
                      className="items-center justify-center"
                    >
                      <View
                        className="w-[44px] h-[44px] rounded-full items-center justify-center border-2"
                        style={{
                          backgroundColor: colorPreset.colorHex,
                          borderColor: isSelected ? theme.primary : "transparent",
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
