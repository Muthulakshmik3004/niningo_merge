import React, { useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  Share,
  Alert,
  Image,
  Linking,
  Platform,
  Clipboard,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useTheme } from "../constants/ThemeContext";
import { getCurrentProfile } from "../constants/ProfileStore";

// Natural Human Hand Assets (Realistic hand anatomy, skin tones, and sleeves)
const redHandAsset = require("../assets/invite_friends/natural_left_hand.png");
const blueHandAsset = require("../assets/invite_friends/natural_right_hand.png");
const banknoteAsset = require("../assets/invite_friends/banknote.png");
const coinAsset = require("../assets/invite_friends/coin.png");

// Art-Directed Fixed Coin Positions (Derived from Reference Artwork)
const COIN_CONFIGS = [
  { id: 1, startX: -10, startY: 0, targetX: -75, targetY: 140, scale: 0.9, rotate: "-15deg" },
  { id: 2, startX: 10, startY: 0, targetX: 70, targetY: 150, scale: 0.95, rotate: "12deg" },
  { id: 3, startX: -15, startY: 5, targetX: -85, targetY: 160, scale: 0.85, rotate: "-25deg" },
  { id: 4, startX: 15, startY: 5, targetX: 80, targetY: 170, scale: 0.9, rotate: "18deg" },
  { id: 5, startX: -5, startY: -5, targetX: -20, targetY: 180, scale: 1.0, rotate: "-8deg" },
  { id: 6, startX: 5, startY: -5, targetX: 30, targetY: 190, scale: 0.95, rotate: "15deg" },
  { id: 7, startX: -20, startY: 10, targetX: -55, targetY: 200, scale: 0.8, rotate: "5deg" },
  { id: 8, startX: 20, startY: 10, targetX: 55, targetY: 210, scale: 0.8, rotate: "-10deg" },
];

// Art-Directed Fixed Currency Note Positions (Derived from Reference Artwork)
const NOTE_CONFIGS = [
  { id: 1, startX: -10, startY: 0, targetX: -60, targetY: 130, scale: 0.75, rotate: "-22deg" },
  { id: 2, startX: 10, startY: 0, targetX: 55, targetY: 140, scale: 0.75, rotate: "28deg" },
  { id: 3, startX: -15, startY: 5, targetX: -75, targetY: 150, scale: 0.7, rotate: "-35deg" },
  { id: 4, startX: 15, startY: 5, targetX: 70, targetY: 160, scale: 0.7, rotate: "30deg" },
  { id: 5, startX: 0, startY: -5, targetX: 0, targetY: 170, scale: 0.8, rotate: "-10deg" },
];

export default function InviteFriendsScreen() {
  const { theme } = useTheme();

  // Keyframe Animated Values for Left Natural Hand (Green Sleeve, Dark Skin)
  const redHandTranslateY = useRef(new Animated.Value(0)).current;
  const redHandTranslateX = useRef(new Animated.Value(0)).current;
  const redHandRotate = useRef(new Animated.Value(1)).current;

  // Keyframe Animated Values for Right Natural Hand (Blue Sleeve, Tan Skin)
  const blueHandTranslateY = useRef(new Animated.Value(0)).current;
  const blueHandTranslateX = useRef(new Animated.Value(0)).current;
  const blueHandRotate = useRef(new Animated.Value(1)).current;

  // Particles Scatter Animation Progress
  const particleAnim = useRef(new Animated.Value(1)).current;

  // Scroll-based replay tracking
  const animationAreaHeight = useRef(250);
  const previousVisibility = useRef(true);
  const readyForReplay = useRef(false);
  const layoutMeasured = useRef(false);

  const handleAnimationAreaLayout = (event: any) => {
    const layout = event?.nativeEvent?.layout;
    if (layout && layout.height > 0) {
      animationAreaHeight.current = layout.height;
      layoutMeasured.current = true;
    }
  };

  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent?.contentOffset?.y || 0;
    const threshold = animationAreaHeight.current * 0.5;
    const isVisible = scrollY < threshold;

    if (isVisible !== previousVisibility.current) {
      const wasVisible = previousVisibility.current;
      previousVisibility.current = isVisible;

      if (!wasVisible && isVisible && readyForReplay.current) {
        readyForReplay.current = false;
        playEntranceAnimation();
      } else if (!isVisible) {
        readyForReplay.current = true;
      }
    }
  };

  // Entrance Sequence Controller (Resets and replays on screen focus and scroll visibility)
  const playEntranceAnimation = useCallback(() => {
    // 1. Reset all animated values to start position
    redHandTranslateY.setValue(100);
    redHandTranslateX.setValue(-25);
    redHandRotate.setValue(0);

    blueHandTranslateY.setValue(100);
    blueHandTranslateX.setValue(25);
    blueHandRotate.setValue(0);

    particleAnim.setValue(0);

    // 2. Play Entrance Sequence
    Animated.sequence([
      // Keyframe 1 -> Keyframe 2 -> Keyframe 3 (Sleeves & hands rise into full view: 550ms)
      Animated.parallel([
        Animated.timing(redHandTranslateY, {
          toValue: 0,
          duration: 550,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(redHandTranslateX, {
          toValue: 0,
          duration: 550,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(redHandRotate, {
          toValue: 1,
          duration: 550,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(blueHandTranslateY, {
          toValue: 0,
          duration: 550,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(blueHandTranslateX, {
          toValue: 0,
          duration: 550,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(blueHandRotate, {
          toValue: 1,
          duration: 550,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),

      // Keyframe 3 -> Keyframe 4 (Coins, Banknotes & Spark impact burst outward: 1200ms)
      Animated.timing(particleAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [
    redHandTranslateY,
    redHandTranslateX,
    redHandRotate,
    blueHandTranslateY,
    blueHandTranslateX,
    blueHandRotate,
    particleAnim,
  ]);

  // Replay animation every time the user enters Invite Friends screen
  useFocusEffect(
    useCallback(() => {
      previousVisibility.current = true;
      readyForReplay.current = false;
      playEntranceAnimation();
    }, [playEntranceAnimation])
  );

  const getReferralMessage = () => {
    const profile = getCurrentProfile();
    const username = profile?.username || "arisu123";
    return `Hey! Join me on Niningo to manage tasks together: https://niningo.app/invite/${username}`;
  };

  const openUrl = async (url: string, fallbackMessage: string) => {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Unable to open", fallbackMessage);
    }
  };

  const handleShare = async (method?: string) => {
    const message = getReferralMessage();

    if (method === "whatsapp") {
      const encoded = encodeURIComponent(message);
      const whatsappUrl =
        Platform.OS === "ios"
          ? `whatsapp://send?text=${encoded}`
          : `https://wa.me/?text=${encoded}`;
      await openUrl(whatsappUrl, "WhatsApp is not installed on this device.");
      return;
    }

    if (method === "message") {
      const encoded = encodeURIComponent(message);
      const smsUrl = `sms:?body=${encoded}`;
      await openUrl(smsUrl, "Unable to open Messages.");
      return;
    }

    try {
      await Share.share({ message });
    } catch (error) {
      console.log("Share error:", error);
    }
  };

  const handleCopyLink = async () => {
    const message = getReferralMessage();
    try {
      await Clipboard.setString(message);
      Alert.alert("Link Copied!", "Referral link copied to clipboard.");
    } catch {
      Alert.alert("Link Copied!", "Referral link copied to clipboard.");
    }
  };

  const redRotateInterpolate = redHandRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["-10deg", "0deg"],
  });

  const blueRotateInterpolate = blueHandRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["10deg", "0deg"],
  });

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.gradient[0] }}
      edges={["left", "right", "bottom", "top"]}
    >
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View className="flex-row items-center px-[22px] pt-[15px] pb-[10px]">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-[12px] p-[4px]"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={28} color={theme.primary} />
          </TouchableOpacity>
          <Text className="text-[26px] font-bold" style={{ color: theme.primary }}>
            Invite Friends
          </Text>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {/* Top Hero Illustration Area */}
          <View
            className="items-center justify-center my-[10px] h-[250px]"
            onLayout={handleAnimationAreaLayout}
          >
            {/* Yellow Organic Background Blob Container */}
            <View
              style={{
                width: 320,
                height: 230,
                backgroundColor: "#F8E28A",
                borderRadius: 115,
                borderTopLeftRadius: 140,
                borderBottomRightRadius: 130,
                transform: [{ rotate: "-6deg" }],
                overflow: "hidden", // Clipped strictly inside Yellow Blob
                position: "relative",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Layer 1: Background Currency Notes */}
              {NOTE_CONFIGS.map((item) => {
                const translateX = particleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [item.startX, item.targetX],
                });
                const translateY = particleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [item.startY, item.targetY],
                });
                const opacity = particleAnim.interpolate({
                  inputRange: [0, 0.2, 1],
                  outputRange: [0, 1, 1],
                });

                return (
                  <Animated.View
                    key={`note-${item.id}`}
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "5%",
                      marginLeft: -25,
                      marginTop: -15,
                      transform: [
                        { translateX },
                        { translateY },
                        { scale: item.scale },
                        { rotate: item.rotate },
                      ],
                      opacity,
                      zIndex: 5,
                    }}
                  >
                    <Image
                      source={banknoteAsset}
                      style={{ width: 60, height: 40 }}
                      resizeMode="contain"
                    />
                  </Animated.View>
                );
              })}

               {/* Layer 3: Natural Right Hand (Blue Sleeve, Warm Tan Skin) */}
              <Animated.View
                style={{
                  position: "absolute",
                  right: 15,
                  bottom: -10,
                  transform: [
                    { translateY: blueHandTranslateY },
                    { translateX: blueHandTranslateX },
                    { rotate: blueRotateInterpolate },
                  ],
                  zIndex: 9,
                }}
              >
                <Image
                  source={blueHandAsset}
                  style={{ width: 185, height: 190 }}
                  resizeMode="contain"
                />
              </Animated.View>

              {/* Layer 4: Natural Left Hand (Green Sleeve, Dark Brown Skin, Front Overlap) */}
              <Animated.View
                style={{
                  position: "absolute",
                  left: 20,
                  bottom: -10,
                  transform: [
                    { translateY: redHandTranslateY },
                    { translateX: redHandTranslateX },
                    { rotate: redRotateInterpolate },
                  ],
                  zIndex: 11,
                }}
              >
                <Image
                  source={redHandAsset}
                  style={{ width: 180, height: 190 }}
                  resizeMode="contain"
                />
              </Animated.View>

              {/* Layer 5: Foreground Gold Illustrated Coins */}
              {COIN_CONFIGS.map((item) => {
                const translateX = particleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [item.startX, item.targetX],
                });
                const translateY = particleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [item.startY, item.targetY],
                });
                const opacity = particleAnim.interpolate({
                  inputRange: [0, 0.2, 1],
                  outputRange: [0, 1, 1],
                });

                return (
                  <Animated.View
                    key={`coin-${item.id}`}
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "5%",
                      marginLeft: -15,
                      marginTop: -15,
                      transform: [
                        { translateX },
                        { translateY },
                        { scale: item.scale },
                        { rotate: item.rotate },
                      ],
                      opacity,
                      zIndex: 15,
                    }}
                  >
                    <Image
                      source={coinAsset}
                      style={{ width: 32, height: 32 }}
                      resizeMode="contain"
                    />
                  </Animated.View>
                );
              })}
            </View>
          </View>

          {/* Primary Reward Container */}
          <View className="rounded-t-[36px] pt-[25px] px-[20px] pb-[30px] min-h-[500px]" style={{ backgroundColor: theme.primary }}>
            <Text className="text-[18px] font-bold text-white mb-[16px]">
              Invite your friends and get Reward
            </Text>

            {/* White Reward Progress Card */}
            <View className="bg-white rounded-[26px] p-[20px] mb-[25px]">
              {/* Progress Line */}
              <View className="flex-row items-center justify-between px-[10px] relative h-[30px]">
                {/* Background Gray Line */}
                <View
                  style={{
                    position: "absolute",
                    left: 20,
                    right: 20,
                    height: 3,
                    backgroundColor: "#D0D0D0",
                  }}
                />
                {/* Active Theme Line */}
                <View
                  style={{
                    position: "absolute",
                    left: 20,
                    width: "33%",
                    height: 3,
                    backgroundColor: theme.primary,
                  }}
                />

                {/* Node 1 */}
                <View className="w-[16px] h-[16px] rounded-full z-10" style={{ backgroundColor: theme.primary }} />

                {/* Node 2 (Active Target with Star) */}
                <View className="w-[30px] h-[30px] rounded-full items-center justify-center z-10 border-2 border-white" style={{ backgroundColor: theme.primary }}>
                  <Ionicons name="star" size={16} color="#fff" />
                </View>

                {/* Node 3 */}
                <View className="w-[16px] h-[16px] rounded-full bg-[#A0A0A0] z-10" />

                {/* Node 4 */}
                <View className="w-[16px] h-[16px] rounded-full bg-[#A0A0A0] z-10" />
              </View>

              {/* Percentage */}
              <Text className="text-[32px] font-bold text-center mt-[8px] mb-[4px]" style={{ color: theme.primary }}>
                10%
              </Text>

              {/* Message */}
              <Text className="text-[13px] font-semibold text-center leading-[18px] px-[5px]" style={{ color: theme.primary }}>
                Just 11 more invites to boost your earnings to 15%! keep pushing, the Rewards are waiting!
              </Text>
            </View>

            {/* Scanner Section */}
            <Text className="text-[22px] font-bold text-white text-center mb-[14px]">
              Scanner
            </Text>

            {/* White QR Code Card */}
            <View className="w-[180px] h-[180px] bg-white rounded-[28px] align-self-center justify-center items-center p-[15px] mb-[16px] self-center">
              {/* QR Code Matrix Grid */}
              <View className="w-[140px] h-[140px] border-4 border-black p-[6px] justify-between">
                <View className="flex-row justify-between">
                  <View className="w-[36px] h-[36px] border-4 border-black justify-center items-center">
                    <View className="w-[16px] h-[16px] bg-black" />
                  </View>
                  <View className="w-[36px] h-[36px] border-4 border-black justify-center items-center">
                    <View className="w-[16px] h-[16px] bg-black" />
                  </View>
                </View>
                <View className="flex-row justify-between items-center px-[10px]">
                  <View className="w-[14px] h-[14px] bg-black" />
                  <View className="w-[18px] h-[18px] bg-black" />
                  <View className="w-[14px] h-[14px] bg-black" />
                </View>
                <View className="flex-row justify-between">
                  <View className="w-[36px] h-[36px] border-4 border-black justify-center items-center">
                    <View className="w-[16px] h-[16px] bg-black" />
                  </View>
                  <View className="flex-row items-end gap-1">
                    <View className="w-[14px] h-[14px] bg-black" />
                    <View className="w-[14px] h-[14px] bg-black" />
                  </View>
                </View>
              </View>
            </View>

            {/* Subtext */}
            <Text className="text-[15px] font-semibold text-white text-center mb-[20px]">
              Inviting friends is a win.You will get a gift card
            </Text>

            {/* Primary Share Button */}
            <TouchableOpacity
              onPress={() => handleShare()}
              activeOpacity={0.85}
              className="mb-[25px]"
            >
              <LinearGradient
                colors={[theme.primary, theme.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  height: 50,
                  width: "65%",
                  borderRadius: 25,
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  alignSelf: "center",
                }}
              >
                <Ionicons
                  name="share-social-outline"
                  size={20}
                  color="#fff"
                  style={{ marginRight: 8 }}
                />
                <Text className="text-[18px] font-bold text-white">Share</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Option 1: Share via WhatsApp */}
            <TouchableOpacity
              onPress={() => handleShare("whatsapp")}
              activeOpacity={0.8}
              className="bg-[#ECECEC] rounded-full h-[52px] px-[20px] flex-row items-center mb-[12px]"
            >
              <FontAwesome name="whatsapp" size={26} color="#25D366" />
              <Text className="text-[16px] font-semibold text-[#222] ml-[15px]">
                Share via whatsapp
              </Text>
            </TouchableOpacity>

            {/* Option 2: Share via Message */}
            <TouchableOpacity
              onPress={() => handleShare("message")}
              activeOpacity={0.8}
              className="bg-[#ECECEC] rounded-full h-[52px] px-[20px] flex-row items-center mb-[12px]"
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={24}
                color="#00A8E8"
              />
              <Text className="text-[16px] font-semibold text-[#222] ml-[15px]">
                Share via Message
              </Text>
            </TouchableOpacity>

            {/* Option 3: Share via Link */}
            <TouchableOpacity
              onPress={handleCopyLink}
              activeOpacity={0.8}
              className="bg-[#ECECEC] rounded-full h-[52px] px-[20px] flex-row items-center mb-[12px]"
            >
              <Ionicons name="link-outline" size={24} color="#D35400" />
              <Text className="text-[16px] font-semibold text-[#222] ml-[15px]">
                Share via Link
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
