import React from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

const updates = [
  {
    id: "1",
    name: "Meena",
    time: "1:05 pm",
    image: "https://i.pravatar.cc/150?img=11",
  },
  {
    id: "2",
    name: "Usagi",
    time: "11:35 am",
    image: "https://i.pravatar.cc/150?img=2",
  },
  {
    id: "3",
    name: "Praveen",
    time: "10:15 am",
    image: "https://i.pravatar.cc/150?img=3",
  },
  {
    id: "4",
    name: "Kuina",
    time: "10:07 am",
    image: "https://i.pravatar.cc/150?img=5",
  },
  {
    id: "5",
    name: "Arun",
    time: "9:32 am",
    image: "https://i.pravatar.cc/150?img=1",
  },
];

export default function Status() {
  return (
    <LinearGradient
      colors={["#ffe7f5", "#ffffff", "#f6e5ff"]}
      style={{ flex: 1, paddingTop: 55, paddingHorizontal: 16 }}
    >
      <Text className="text-[30px] font-bold text-[#b03dd7] mb-[20px]">Moments</Text>

      <Text className="text-[20px] font-semibold text-[#444] mb-[15px] mt-[10px]">Today</Text>

      {/* My Moment - NOT CLICKABLE */}
      <View className="flex-row items-center mb-[20px]">
        <Image
          source={{ uri: "https://i.pravatar.cc/150?img=10" }}
          className="w-[60px] h-[60px] rounded-[30px] border-[3px] border-[#00d26a] mr-[15px]"
        />

        <View>
          <Text className="text-[18px] font-bold text-[#222]">My Moment</Text>
          <Text className="text-[14px] text-[#666] mt-[4px]">3 minutes ago</Text>
        </View>
      </View>

      <Text className="text-[20px] font-semibold text-[#444] mb-[15px] mt-[10px]">Recent Updates</Text>

      <FlatList
        data={updates}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="flex-row items-center mb-[20px]"
          >
            <Image
              source={{ uri: item.image }}
              className="w-[60px] h-[60px] rounded-[30px] border-[3px] border-[#00d26a] mr-[15px]"
            />

            <View>
              <Text className="text-[18px] font-bold text-[#222]">{item.name}</Text>
              <Text className="text-[14px] text-[#666] mt-[4px]">{item.time}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </LinearGradient>
  );
}