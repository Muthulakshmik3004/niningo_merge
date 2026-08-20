import { router } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import BACKEND_URL from "../config";

export default function App() {
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);

  const handleMobile = (text: string) => {
    const value = text.replace(/[^0-9]/g, "");

    if (value.length <= 10) {
      setMobile(value);
    }
  };

  const handleContinue = async () => {
    if (mobile.length !== 10) {
      Alert.alert("Invalid Mobile Number", "Enter a valid 10-digit mobile number.");
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


      // ------------------------------------------------
      // Decide which screen should open
      // ------------------------------------------------

      // New users now go through OTP verification first
      if (data.next_screen === "profile" && !data.exists) {
        router.replace({
          pathname: "/otp",
          params: {
            phone: phoneNumber,
          },
        });
        return;
      }

      // Existing users (profile already exists) keep original flow
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

      // Fallback
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

  return (
    <LinearGradient
      colors={["#FBD0FD", "#FDE2FB", "#FFF9FE"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 40,
        paddingBottom: 20,
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 w-full items-center justify-evenly px-[18px]"
      >
        {/* LOGO */}
        <Image
          source={require("../assets/images/logoo.png")}
          className="w-[570px] h-[410px] mt-[5px]"
          resizeMode="contain"
        />

        {/* LOGIN CARD */}
        <View
          className="w-[92%] bg-[#FFF8FC] rounded-[34px] px-[24px] py-[30px] mt-[-60px]"
          style={{
            shadowColor: "#D36AF0",
            shadowOpacity: 0.28,
            shadowOffset: { width: 0, height: 8 },
            shadowRadius: 15,
            elevation: 10,
            transform: [{ translateY: -60 }],
          }}
        >
          <Text className="text-[22px] font-bold text-[#111] mb-[25px]">
            Login with Mobile Number
          </Text>

          {/* MOBILE NUMBER */}
          <View className="h-[58px] flex-row items-center border-[1.8px] border-[#CB5CF3] rounded-[14px] bg-white px-[16px]">
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
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
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

        {/* TERMS & PRIVACY */}
        <Text className="w-[70%] text-center text-[13px] text-[#222] mb-[10px] leading-[20px]">
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