//2

// Go to login page
import { router, useLocalSearchParams } from "expo-router";


import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";


export default function OTPScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();

  const [otp, setOtp] = useState(["", "", "", ""]);  
  const [seconds, setSeconds] = useState(45);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (seconds === 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  const input1 = useRef<TextInput>(null);
  const input2 = useRef<TextInput>(null);
  const input3 = useRef<TextInput>(null);
  const input4 = useRef<TextInput>(null);

  const refs = [input1, input2, input3, input4];

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 3) {
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



  const handleVerify = () => {
    // Check if the entire OTP is entered
    if (otp.some((digit) => digit === "")) {
      alert("Please enter the OTP");
      return;
    }

    // If OTP is complete, navigate to profile with phone param
    router.replace({
      pathname: "/profile",
      params: { phone },
    });
  };


  return (
    <LinearGradient
      colors={["#FBD0FD", "#FDE2FB", "#FFF9FE"]}
      style={{ flex: 1, alignItems: "center", paddingTop: 60 }}
    >
      <Text className="text-[32px] font-bold text-[#222]">Verify Mobile Number</Text>

      <Image
        source={require("../assets/images/logoo.png")}
        className="w-[670px] h-[390px] mt-0"
        resizeMode="contain"
        style={{ transform: [{ translateY: -90 }] }}
      />

      <View
        className="w-[88%] px-[20px] py-[20px] rounded-[25px] bg-[#FFF8FC]"
        style={{ transform: [{ translateY: -199 }], elevation: 8 }}
      >
        <Text className="text-[30px] font-bold text-center">Enter OTP</Text>

        <Text className="text-center mt-[10px]">
          We've sent a code to
        </Text>

        <View className="flex-row justify-center items-center mt-[8px]">
          <Text className="text-[18px] font-bold text-black">
            {phone ? `${phone.slice(0, 3)}*****${phone.slice(-3)}` : "+91 ***** ***"}
          </Text>
          {/* back to login page */}
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="ml-[10px] mt-[1px] text-[17px] font-bold text-[#B84CF3]">Edit</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-between mt-[30px]">
          {otp.map((value, index) => (
            <TextInput
              key={index}
              ref={refs[index]}
              value={value}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              className="w-[60px] h-[60px] border-[1.5px] border-[#C85AF0] rounded-[12px] text-center text-[22px]"
              textAlign="center"
            />
          ))}
        </View>

        <TouchableOpacity onPress={handleVerify}>
          <LinearGradient
            colors={["#F553E7", "#7B67FF"]}
            style={{ marginTop: 30, height: 55, borderRadius: 15, justifyContent: "center", alignItems: "center" }}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text className="text-[22px] font-bold text-black">Verify</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      {/* timer ooda */}
      <Text className="mt-[-170px] text-[#C14AF4] text-[22px] font-bold">
        00:{seconds < 10 ? `0${seconds}` : seconds}
      </Text>

      <Text className="mt-[15px] text-[18px]">
        Didn't receive the code?
      </Text>

      <TouchableOpacity
        disabled={!canResend}
        onPress={() => {
          setSeconds(45);
          setCanResend(false);
          // Add OTP resend integration here later when connecting to backend
        }}
      >
        <Text
          className={`mt-[15px] text-[18px] font-bold ${canResend ? "text-[#C14AF4]" : "text-[#999]"}`}
        >
          Resend OTP
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}