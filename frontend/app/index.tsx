

import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";

import BACKEND_URL from "../config";

function NinigoIntro({ onFinish }: { onFinish: () => void }) {
  const textOpacity = useRef(new Animated.Value(1)).current;

  // Logo animation
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.55)).current;
  const logoTranslateY = useRef(new Animated.Value(10)).current;

  // Welcome animation
  const welcomeOpacity = useRef(new Animated.Value(0)).current;
  const welcomeTranslateY = useRef(new Animated.Value(12)).current;

  // Background animation
  const backgroundOpacity = useRef(new Animated.Value(0)).current;

  const [introText, setIntroText] = useState("g n i o N n i");

  useEffect(() => {
    let active = true;

    const sequence = async () => {
      // ------------------------------------------------
      // 0.0s - Scattered letters
      // ------------------------------------------------
      await new Promise((resolve) => setTimeout(resolve, 700));

      if (!active) return;

      // ------------------------------------------------
      // 0.7s - Hide scattered letters
      // ------------------------------------------------
      await new Promise<void>((resolve) => {
        Animated.timing(textOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }).start(() => resolve());
      });

      if (!active) return;

      // ------------------------------------------------
      // Show Ninigo letters
      // ------------------------------------------------
      setIntroText("N i n i n g o");

      await new Promise<void>((resolve) => {
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start(() => resolve());
      });

      // ------------------------------------------------
      // Hold Ninigo text
      // ------------------------------------------------
      await new Promise((resolve) => setTimeout(resolve, 1450));

      if (!active) return;

      // ------------------------------------------------
      // Logo animation
      // Bigger + exact center
      // ------------------------------------------------
      await new Promise<void>((resolve) => {
        Animated.parallel([
          // Fade logo in
          Animated.timing(logoOpacity, {
            toValue: 1,
            duration: 850,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),

          // Logo starts small and becomes full size
          Animated.spring(logoScale, {
            toValue: 1,
            friction: 7,
            tension: 45,
            useNativeDriver: true,
          }),

          // Small vertical movement
          Animated.timing(logoTranslateY, {
            toValue: 0,
            duration: 850,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),

          // Hide Ninigo text
          Animated.timing(textOpacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start(() => resolve());
      });

      if (!active) return;

      // ------------------------------------------------
      // Hold logo
      // ------------------------------------------------
      await new Promise((resolve) => setTimeout(resolve, 900));

      if (!active) return;

      // ------------------------------------------------
      // Pink welcome background
      // ------------------------------------------------
      await new Promise<void>((resolve) => {
        Animated.parallel([
          Animated.timing(backgroundOpacity, {
            toValue: 1,
            duration: 850,
            useNativeDriver: true,
          }),

          Animated.timing(welcomeOpacity, {
            toValue: 1,
            duration: 700,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),

          Animated.timing(welcomeTranslateY, {
            toValue: 0,
            duration: 700,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start(() => resolve());
      });

      // ------------------------------------------------
      // Hold Welcome screen
      // ------------------------------------------------
      await new Promise((resolve) => setTimeout(resolve, 850));

      if (active) {
        onFinish();
      }
    };

    sequence();

    return () => {
      active = false;
    };
  }, [
    backgroundOpacity,
    logoOpacity,
    logoScale,
    logoTranslateY,
    onFinish,
    textOpacity,
    welcomeOpacity,
    welcomeTranslateY,
  ]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#FFFFFF",
      }}
    >
      <StatusBar style="dark" />

      {/* ============================================
          OPENING WORD ANIMATION
      ============================================ */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,

          alignItems: "center",
          justifyContent: "center",

          opacity: textOpacity,
        }}
      >
        <Text
          style={{
            color: "#9A32B7",
            fontSize: 22,
            fontWeight: "700",
            letterSpacing: 7,
          }}
        >
          {introText}
        </Text>
      </Animated.View>

      {/* ============================================
          PINK WELCOME BACKGROUND
          Placed BEFORE logo so logo stays visible
      ============================================ */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,

          backgroundColor: "#FBDDF7",

          opacity: backgroundOpacity,

          zIndex: 2,
        }}
      />

      {/* ============================================
          NINIGO LOGO
          ONLY ONE LOGO - CENTER OF SCREEN
      ============================================ */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",

          top: 0,
          bottom: 0,
          left: 0,
          right: 0,

          alignItems: "center",
          justifyContent: "center",

          opacity: logoOpacity,

          zIndex: 10,

          transform: [
            {
              scale: logoScale,
            },
            {
              translateY: logoTranslateY,
            },
          ],
        }}
      >
        <Image
          source={require("../assets/images/logoo.png")}
          style={{
            width: 380,
            height: 460,
          }}
          resizeMode="contain"
        />
      </Animated.View>

      {/* ============================================
          WELCOME TEXT
      ============================================ */}
      <Animated.Text
        style={{
          position: "absolute",

          bottom: "18%",

          left: 0,
          right: 0,

          textAlign: "center",

          color: "#9A32B7",

          fontSize: 20,
          fontWeight: "800",

          opacity: welcomeOpacity,

          transform: [
            {
              translateY: welcomeTranslateY,
            },
          ],

          zIndex: 20,
        }}
      >
        Welcome
      </Animated.Text>
    </View>
  );
}

export default function App() {
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  const finishIntro = React.useCallback(() => {
    setShowIntro(false);
  }, []);

  const handleMobile = (text: string) => {
    const value = text.replace(/[^0-9]/g, "");

    if (value.length <= 10) {
      setMobile(value);
    }
  };

  const handleContinue = async () => {
    if (mobile.length !== 10) {
      Alert.alert(
        "Invalid Mobile Number",
        "Enter a valid 10-digit mobile number."
      );
      return;
    }

    if (loading) {
      return;
    }

    const phoneNumber = `+91${mobile}`;

    try {
      setLoading(true);

      const response = await fetch(`${BACKEND_URL}/app/mobile/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
        }),
      });

      const data = await response.json();

      console.log("Mobile login response:", data);

      if (!response.ok) {
        Alert.alert(
          "Error",
          data.error || "Unable to continue. Please try again."
        );
        return;
      }

      if (data.next_screen === "profile" && !data.exists) {
        router.replace({
          pathname: "/otp",
          params: {
            phone: phoneNumber,
          },
        });
        return;
      }

      if (data.next_screen === "profile") {
        router.replace({
          pathname: "/profile",
          params: {
            phone: phoneNumber,
          },
        });
        return;
      }

      if (data.next_screen === "location") {
        router.replace({
          pathname: "/location",
          params: {
            username: data.username || "",
          },
        });
        return;
      }

      if (data.next_screen === "tasks") {
        router.replace("/all");
        return;
      }

      Alert.alert(
        "Something went wrong",
        "The server returned an unknown next screen."
      );
    } catch (error) {
      console.error("Mobile login error:", error);

      Alert.alert(
        "Connection Error",
        "Unable to connect to the server. Please check your internet connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // INTRO SCREEN
  // ============================================
  if (showIntro) {
    return <NinigoIntro onFinish={finishIntro} />;
  }

  // ============================================
  // LOGIN SCREEN
  // ============================================
  return (
    <LinearGradient
      colors={["#FBD0FD", "#FDE2FB", "#FFF9FE"]}
      start={{
        x: 0,
        y: 0,
      }}
      end={{
        x: 0,
        y: 1,
      }}
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 40,
        paddingBottom: 20,
      }}
    >
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 w-full items-center justify-evenly px-[18px]"
      >
        {/* ============================================
            LOGIN SCREEN LOGO
        ============================================ */}
        <Image
          source={require("../assets/images/logoo.png")}
          className="w-[570px] h-[410px] mt-[5px]"
          resizeMode="contain"
        />

        {/* ============================================
            LOGIN CARD
        ============================================ */}
        <View
          className="w-[92%] bg-[#FFF8FC] rounded-[34px] px-[24px] py-[30px] mt-[-60px]"
          style={{
            shadowColor: "#D36AF0",
            shadowOpacity: 0.28,
            shadowOffset: {
              width: 0,
              height: 8,
            },
            shadowRadius: 15,
            elevation: 10,

            transform: [
              {
                translateY: -60,
              },
            ],
          }}
        >
          <Text className="text-[22px] font-bold text-[#111] mb-[25px]">
            Login with Mobile Number
          </Text>

          {/* MOBILE INPUT */}
          <View
            className="h-[58px] flex-row items-center border-[1.8px] border-[#CB5CF3] rounded-[14px] bg-white px-[16px]"
          >
            <Text className="text-[18px] font-bold text-black">
              +91
            </Text>

            <View className="w-[1px] h-[28px] bg-[#8E8E8E] mx-[12px]" />

            <TextInput
              placeholder="Mobile Number"
              placeholderTextColor="#999"
              keyboardType="number-pad"
              value={mobile}
              onChangeText={handleMobile}
              maxLength={10}
              editable={!loading}
              className="flex-1 text-[18px] text-black py-0"
            />
          </View>

          {/* CONTINUE BUTTON */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleContinue}
            disabled={loading}
          >
            <LinearGradient
              colors={["#F553E7", "#7B67FF"]}
              start={{
                x: 0,
                y: 0,
              }}
              end={{
                x: 1,
                y: 0,
              }}
              style={{
                height: 56,
                width: "74%",
                borderRadius: 15,

                justifyContent: "center",
                alignItems: "center",
                alignSelf: "center",

                marginTop: 26,

                opacity: loading ? 0.6 : 1,
              }}
            >
              <Text className="text-[19px] font-bold text-black">
                {loading ? "Please wait..." : "Continue"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* ============================================
            TERMS & PRIVACY
        ============================================ */}
        <Text
          className="w-[70%] text-center text-[13px] text-[#222] mb-[10px] leading-[20px]"
        >
          By Continuing, you agree to our{" "}

          <Text
            className="text-[#7A2BE2] font-bold"
            onPress={() => router.push("/terms")}
          >
            Terms
          </Text>

          {" & "}

          <Text
            className="text-[#7A2BE2] font-bold"
            onPress={() => router.push("/privacy")}
          >
            Privacy Policy
          </Text>
        </Text>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}