import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function OTPScreen() {
  const { phone } = useLocalSearchParams<{ phone?: string }>();

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [seconds, setSeconds] = useState(45);
  const [canResend, setCanResend] = useState(false);

  const input1 = useRef<TextInput>(null);
  const input2 = useRef<TextInput>(null);
  const input3 = useRef<TextInput>(null);
  const input4 = useRef<TextInput>(null);

  const refs = [input1, input2, input3, input4];

  // -----------------------------
  // OTP TIMER
  // -----------------------------
  useEffect(() => {
    if (seconds <= 0) {
      setSeconds(0);
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setSeconds((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  // -----------------------------
  // OTP INPUT
  // -----------------------------
  const handleChange = (text: string, index: number) => {
    // Keep only numbers
    const digit = text.replace(/[^0-9]/g, "").slice(-1);

    const newOtp = [...otp];
    newOtp[index] = digit;

    setOtp(newOtp);

    // Move to next box
    if (digit && index < refs.length - 1) {
      refs[index + 1].current?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (
      e.nativeEvent.key === "Backspace" &&
      otp[index] === "" &&
      index > 0
    ) {
      refs[index - 1].current?.focus();
    }
  };

  // -----------------------------
  // VERIFY OTP
  // -----------------------------
  const handleVerify = () => {
    if (otp.some((digit) => digit === "")) {
      Alert.alert("Invalid OTP", "Please enter the complete OTP.");
      return;
    }

    const enteredOtp = otp.join("");

    console.log("Entered OTP:", enteredOtp);
    console.log("Phone:", phone);

    // TODO:
    // Call your backend OTP verification API here.

    router.replace({
      pathname: "/profile",
      params: {
        phone: phone || "",
      },
    });
  };

  // -----------------------------
  // RESEND OTP
  // -----------------------------
  const handleResend = () => {
    if (!canResend) {
      return;
    }

    setOtp(["", "", "", ""]);
    setSeconds(45);
    setCanResend(false);

    input1.current?.focus();

    // TODO:
    // Call your backend resend OTP API here.
  };

  // -----------------------------
  // MASK PHONE NUMBER
  // -----------------------------
  const maskedPhone = phone
    ? `${phone.slice(0, 3)}*****${phone.slice(-3)}`
    : "+91 ***** ***";

  return (
    <LinearGradient
      colors={["#FBD0FD", "#FDE2FB", "#FFF9FE"]}
      style={{
        flex: 1,
        alignItems: "center",
        paddingTop: 60,
      }}
    >
      {/* TITLE */}
      <Text className="text-[32px] font-bold text-[#222]">
        Verify Mobile Number
      </Text>

      {/* LOGO */}
      <Image
        source={require("../assets/images/logoo.png")}
        className="w-[670px] h-[390px] mt-0"
        resizeMode="contain"
        style={{
          transform: [{ translateY: -90 }],
        }}
      />

      {/* OTP CARD */}
      <View
        className="w-[88%] px-[20px] py-[20px] rounded-[25px] bg-[#FFF8FC]"
        style={{
          transform: [{ translateY: -199 }],
          elevation: 8,
        }}
      >
        <Text className="text-[30px] font-bold text-center">
          Enter OTP
        </Text>

        <Text className="text-center mt-[10px]">
          We've sent a code to
        </Text>

        {/* PHONE NUMBER */}
        <View className="flex-row justify-center items-center mt-[8px]">
          <Text className="text-[18px] font-bold text-black">
            {maskedPhone}
          </Text>

          <TouchableOpacity onPress={() => router.back()}>
            <Text className="ml-[10px] mt-[1px] text-[17px] font-bold text-[#B84CF3]">
              Edit
            </Text>
          </TouchableOpacity>
        </View>

        {/* OTP BOXES */}
        <View className="flex-row justify-between mt-[30px]">
          {otp.map((value, index) => (
            <TextInput
              key={index}
              ref={refs[index]}
              value={value}
              onChangeText={(text) =>
                handleChange(text, index)
              }
              onKeyPress={(e) =>
                handleKeyPress(e, index)
              }
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              className="w-[60px] h-[60px] border-[1.5px] border-[#C85AF0] rounded-[12px] text-center text-[22px]"
            />
          ))}
        </View>

        {/* VERIFY BUTTON */}
        <TouchableOpacity onPress={handleVerify}>
          <LinearGradient
            colors={["#F553E7", "#7B67FF"]}
            style={{
              marginTop: 30,
              height: 55,
              borderRadius: 15,
              justifyContent: "center",
              alignItems: "center",
            }}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text className="text-[22px] font-bold text-black">
              Verify
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* TIMER */}
      <Text className="mt-[-170px] text-[#C14AF4] text-[22px] font-bold">
        00:{seconds < 10 ? `0${seconds}` : seconds}
      </Text>

      {/* RESEND TEXT */}
      <Text className="mt-[15px] text-[18px]">
        Didn't receive the code?
      </Text>

      {/* RESEND BUTTON */}
      <TouchableOpacity
        disabled={!canResend}
        onPress={handleResend}
      >
        <Text
          className={`mt-[15px] text-[18px] font-bold ${
            canResend
              ? "text-[#C14AF4]"
              : "text-[#999]"
          }`}
        >
          Resend OTP
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}