//7
import { SafeAreaView } from "react-native-safe-area-context";
import { Zocial } from "@expo/vector-icons";

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTheme } from "../constants/ThemeContext";

const DATA: any[] = [];

export default function UnreadScreen() {
  const { theme } = useTheme();
  const [selected, setSelected] = useState("Pending");
  const [search, setSearch] = useState("");

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["left", "right", "bottom"]}>
      <LinearGradient
        colors={theme.gradient}
        style={{ flex: 1, paddingTop: 38, paddingHorizontal: 15 }}
      >
        {/* Header */}
        <View className="flex-row justify-between items-center mb-[15px]">
          <Text className="text-[34px] font-bold" style={{ color: theme.primary }}>Task</Text>

          <View className="items-center">
            <Text className="text-[24px]">❤️‍🔥</Text>
            <Text className="text-[13px] font-bold text-[#FF7B00]">26 Days</Text>
          </View>
        </View>

        {/* Search */}
        <View className="flex-row items-center bg-white rounded-[30px] border border-[#BFBFBF] px-[15px] h-[50px]">
          <Ionicons name="search" size={20} color="#777" />

        <TextInput
  placeholder="Search Contact"
  placeholderTextColor="#888"
  className="flex-1 ml-[8px] text-[16px]"
  value={search}
  onChangeText={setSearch}
/>
        </View>

        {/* Filter */}
        <View className="flex-row justify-between mt-[12px] mb-[15px]">
          {["All", "Unread", "Pending", "Groups"].map((item) => (
            <TouchableOpacity
              key={item}
             onPress={() => {
  setSelected(item);

  if (item === "All") {
    router.push("/all");
  }

  if (item === "Unread") {
    router.push("/unread");
  }

  if (item === "Groups") {
    router.push("/groups");
  }
}}
              className="px-[18px] py-[7px] rounded-[18px] border"
              style={{
                borderColor: theme.primary,
                backgroundColor: selected === item ? theme.primary + "33" : "#FFF",
              }}
            >
              <Text
                style={{
                  color: "#000",
                  fontWeight: "600",
                }}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Contact List */}
        
                  <FlatList
                            data={DATA.filter((item) =>
                    item.name.toLowerCase().includes(search.toLowerCase())
                  )}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity className="flex-row items-center py-[12px]">
              <Image
                source={{ uri: item.image }}
                className="w-[60px] h-[60px] rounded-[30px]"
              />

              <View className="flex-1 ml-[12px]">
                <Text className="text-[22px] font-bold text-[#222]">{item.name}</Text>
                <Text className="text-[15px] text-[#666] mt-[3px]">{item.msg}</Text>
              </View>

              <View className="items-end">
                <Text className="text-[13px] text-[#666] mb-[8px]">{item.time}</Text>

                <View
                  className="w-[22px] h-[22px] rounded-[11px] justify-center items-center"
                  style={{ backgroundColor: item.color }}
                >
                  <Text className="text-white font-bold text-[12px]">
                    {item.count}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
                {/* Floating Add Button */}
        <TouchableOpacity 
          className="absolute right-[20px] bottom-[80px]"
          style={{ elevation: 8 }}
        >
  <LinearGradient
    colors={[theme.primary, theme.primary]}
    style={{
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: "center",
      alignItems: "center",
    }}
  >
            <Ionicons
              name="add"
              size={34}
              color="#fff"
            />
          </LinearGradient>
        </TouchableOpacity>

        {/* Bottom Navigation */}
        <View className="absolute left-0 right-0 bottom-0 h-[60px] flex-row justify-around items-center bg-white rounded-t-[25px]">
<TouchableOpacity>
   {/* onPress={() => router.push("/all")}> */}
  <Ionicons name="document-text-outline" size={28} color="#777" />
</TouchableOpacity>

<TouchableOpacity>
   {/* onPress={() => router.push("/unread")}> */}
  <Zocial name="statusnet" size={28} color="#777" />
</TouchableOpacity>

<TouchableOpacity>
  <Ionicons name="gift-outline" size={28} color="#777" />
</TouchableOpacity>

<TouchableOpacity onPress={() => router.push("/profile-page")}>
  <Ionicons name="person-outline" size={28} color="#777" />
</TouchableOpacity>

        </View>

      </LinearGradient>
    </SafeAreaView>
  );
}