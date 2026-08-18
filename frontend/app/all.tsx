// 5
import { router } from "expo-router";

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
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const DATA = [
  {
    id: "1",
    name: "Arun",
    msg: "Task Assigned",
    time: "11:54 am",
    count: 1,
    image: "https://i.pravatar.cc/150?img=1",
    color: "#39E600",
  },
  {
    id: "2",
    name: "Usagi",
    msg: "Task Assigned",
    time: "9:55 am",
    count: 1,
    image: "https://i.pravatar.cc/150?img=2",
    color: "#39E600",
  },
  {
    id: "3",
    name: "Praveen",
    msg: "Task Assigned",
    time: "Yesterday",
    count: 1,
    image: "https://i.pravatar.cc/150?img=3",
    color: "#FF8A00",
  },
  {
    id: "4",
    name: "Natasa",
    msg: "Task Assigned",
    time: "Yesterday",
    count: 1,
    image: "https://i.pravatar.cc/150?img=4",
    color: "#FF8A00",
  },
  {
    id: "5",
    name: "Kuina",
    msg: "Task Assigned",
    time: "Yesterday",
    count: 1,
    image: "https://i.pravatar.cc/150?img=5",
    color: "#FF8A00",
  },
];

export default function TaskScreen() {

  const [selected, setSelected] = useState("All");
  const [search, setSearch] = useState("");

return (
  <SafeAreaView style={{ flex: 1 }}    edges={["left", "right", "bottom"]}>
    <LinearGradient
      colors={["#FFD7F8", "#FFF7FD"]}
      style={{ flex: 1, paddingTop: 38, paddingHorizontal: 15 }}
    >

      {/* Header */}

      <View className="flex-row justify-between items-center mb-[15px]">

        <Text className="text-[34px] font-bold text-[#B84CE8]">
          Task
        </Text>

        <View className="items-center">

          <Text className="text-[24px]">
            ❤️‍🔥
          </Text>

          <Text className="text-[13px] font-bold text-[#FF7B00]">
            26 Days
          </Text>

        </View>

      </View>

      {/* Search */}

      <View className="flex-row items-center bg-white rounded-[30px] border border-[#BFBFBF] px-[15px] h-[50px]">

        <Ionicons
          name="search"
          size={20}
          color="#777"
        />

       <TextInput
  placeholder="Search Contact"
  placeholderTextColor="#888"
  className="flex-1 ml-[8px] text-[16px]"
  value={search}
  onChangeText={setSearch}
/>

      </View>

      {/* Filter Buttons */}

      <View className="flex-row justify-between mt-[12px] mb-[15px]">

 
        {["All", "Unread", "Pending", "Groups"].map((item) => (
  <TouchableOpacity
    key={item}
    onPress={() => {
      setSelected(item);

      if (item === "Unread") {
        router.push("/unread");
      }

      if (item === "Pending") {
        router.push("/pending");
      }

      if (item === "Groups") {
        router.push("/groups");
      }
    }}
    className={`px-[18px] py-[7px] rounded-[18px] border border-[#B37BD8] ${selected === item ? "bg-[#F1C2F7]" : "bg-[#FFF]"}`}
  >
    <Text
      style={{
        color: selected === item ? "#000" : "#444",
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
{/* Displays the contact name. */}
              <Text className="text-[22px] font-bold text-[#222]">
                {item.name}
              </Text>
{/* Displays the latest message. ex: Task Assigned */}
              <Text className="text-[15px] text-[#666] mt-[3px]">
                {item.msg}
              </Text>

            </View>
{/* This container holds the time and notification badge.

alignItems:"flex-end" moves the content to the right side. */}
            <View
              className="items-end"
            >
{/* Displays the message time. */}
              <Text className="text-[13px] text-[#666] mb-[8px]">
                {item.time}
              </Text>

              <View
                className="w-[22px] h-[22px] rounded-[11px] justify-center items-center"
                style={{ backgroundColor: item.color }}
              >
{/* Displays the notification count. ex: 1 */}
                <Text className="text-white font-bold text-[12px]">
                  {item.count}
                </Text>

              </View>

            </View>

          </TouchableOpacity>


        )}
      />
      <TouchableOpacity 
        className="absolute right-[20px] bottom-[80px] w-[60px] h-[60px] rounded-[30px] justify-center items-center"
        style={{ elevation: 8 }}
      >
  <LinearGradient
    colors={["#F553E7", "#6B63FF"]}
    style={{
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <Ionicons name="add" size={34} color="#fff" />
  </LinearGradient>
</TouchableOpacity>
      {/* Bottom Navigation */}
<View className="absolute left-0 right-0 bottom-0 h-[60px] flex-row justify-around items-center bg-white rounded-t-[25px]">
  <TouchableOpacity>
    <Ionicons name="document-text-outline"
     size={28} color="#777" />
  </TouchableOpacity>
{/* this is for clicking status page */}
 <TouchableOpacity
  onPress={() => router.push("/status")}
>
  <Zocial
    name="statusnet"
    size={28}
    color="#777"
  />
</TouchableOpacity>

  <TouchableOpacity
  onPress={() => router.push("/rewards")}
>
  <Ionicons
    name="gift-outline"
    size={28}
    color="#777"
  />
</TouchableOpacity>

  <TouchableOpacity>
    <Ionicons name="person-outline" size={28} color="#777" />
  </TouchableOpacity>
</View>
          </LinearGradient>
          </SafeAreaView>
  );
}
