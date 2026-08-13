// 4

import React, { useState } from "react";

import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";

import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";

import {
  Ionicons,
  MaterialIcons,
  Entypo,
} from "@expo/vector-icons";

export default function LocationScreen() {

    const [home, setHome] = useState("");
const [office, setOffice] = useState("");

const getLocation = async (
  type: "home" | "office"
) => {
    // location code
};

  return (
    <LinearGradient
      colors={["#FBD0FD", "#FDE2FB", "#FFF9FE"]}
      style={{ flex: 1, paddingHorizontal: 20, paddingTop: 60 }}
    >
      {/* Header */}
      <View className="flex-row items-center mb-[30px]">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#222" />
        </TouchableOpacity>

        <View className="flex-1">
          <Text className="text-[28px] font-bold text-[#222] ml-[15px]">Choose Location</Text>
          <Text className="text-[14px] text-[#C14AF4] ml-[15px] mt-[5px]">
            Let's find your locations to get started
          </Text>
        </View>
      </View>

      {/* Home Card */}
      <View 
        className="bg-[#FFF8FC] rounded-[25px] p-[30px] mb-[25px]"
        style={{ elevation: 8, shadowColor: "#D55AF6", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.2, shadowRadius: 10 }}
      >
        <View className="flex-row items-center mb-[15px]">
          <MaterialIcons
            name="home"
            size={22}
            color="#C14AF4"
          />

          <Text className="text-[18px] font-bold ml-[8px] text-[#222]">
            Home Location
          </Text>

          <Text className="text-red-500 text-[18px] ml-[5px]">*</Text>
        </View>

        <TextInput
          className="border-[1.5px] border-[#D55AF6] rounded-[14px] h-[55px] px-[15px] bg-white text-[16px]"
          placeholder="Enter home address"
          value={home}
          onChangeText={setHome}
        />

        <TouchableOpacity
          className="flex-row items-center justify-center mt-[15px] h-[50px] border-[1.5px] border-[#D55AF6] rounded-[25px] bg-white"
          onPress={() => getLocation("home")}
        >
          <Entypo
            name="location-pin"
            size={20}
            color="#222"
          />

          <Text className="ml-[8px] text-[16px] font-semibold text-[#222]">
            Use Current Location
          </Text>
        </TouchableOpacity>
      </View>

      {/* Office Card */}
      <View 
        className="bg-[#FFF8FC] rounded-[25px] p-[30px] mb-[25px]"
        style={{ elevation: 8, shadowColor: "#D55AF6", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.2, shadowRadius: 10 }}
      >
        <View className="flex-row items-center mb-[15px]">
          <MaterialIcons
            name="work-outline"
            size={22}
            color="#C14AF4"
          />

          <Text className="text-[18px] font-bold ml-[8px] text-[#222]">
            Office Location
          </Text>
        </View>

        <TextInput
          className="border-[1.5px] border-[#D55AF6] rounded-[14px] h-[55px] px-[15px] bg-white text-[16px]"
          placeholder="Enter office address"
          value={office}
          onChangeText={setOffice}
        />

        <TouchableOpacity
          className="flex-row items-center justify-center mt-[15px] h-[50px] border-[1.5px] border-[#D55AF6] rounded-[25px] bg-white"
          onPress={() => getLocation("office")}
        >
          <Entypo
            name="location-pin"
            size={20}
            color="#222"
          />

          <Text className="ml-[8px] text-[16px] font-semibold text-[#222]">
            Use Current Location
          </Text>
        </TouchableOpacity>
      </View>

      {/* Continue Button */}
      
      <TouchableOpacity
  onPress={() => router.push("/all")}
>
  <LinearGradient
    colors={["#F553E7", "#6B63FF"]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={{ height: 55, borderRadius: 30, justifyContent: "center", alignItems: "center", marginTop: 20, marginHorizontal: 60 }}
  >
    <Text className="text-[22px] font-bold text-black">
      Continue
    </Text>
  </LinearGradient>
</TouchableOpacity>
    </LinearGradient>
  );
}