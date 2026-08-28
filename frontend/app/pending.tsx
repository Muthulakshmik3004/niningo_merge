// 7

import { SafeAreaView } from "react-native-safe-area-context";
import { Zocial, FontAwesome } from "@expo/vector-icons";

import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";

import { getUsername } from "../services/session";
import { fetchContacts, ContactItem } from "../services/api";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../constants/ThemeContext";
import BottomFooter from "../components/BottomFooter";

export default function PendingScreen() {
  const { theme } = useTheme();
  const [selected, setSelected] = useState("Pending");
  const [search, setSearch] = useState("");

  const [data, setData] = useState<ContactItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [completedDaysCount, setCompletedDaysCount] = useState(0);

  // --------------------------------
  // LOAD COMPLETED DAYS
  // --------------------------------

  const loadCompletedDays = useCallback(async () => {
    try {
      const savedProgress = await AsyncStorage.getItem(
        "niningo_spark_progress"
      );

      if (!savedProgress) {
        setCompletedDaysCount(0);
        return;
      }

      const progress = JSON.parse(savedProgress);

      const completedDays = Object.keys(progress).filter((date) => {
        return Object.keys(progress[date] || {}).length > 0;
      });

      setCompletedDaysCount(completedDays.length);
    } catch (error) {
      console.log("Completed days load error:", error);
      setCompletedDaysCount(0);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCompletedDays();
    }, [loadCompletedDays])
  );

  // --------------------------------
  // LOAD PENDING CONTACTS
  // --------------------------------

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const username = await getUsername();

      if (!username) {
        setError("Please login first");
        setData([]);
        return;
      }

      const res = await fetchContacts(username, "pending");

      setData(res.results);
    } catch (e: any) {
      setError(
        e?.message || "Could not load pending tasks from the server"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // --------------------------------
  // FILTER SEARCH RESULTS
  // --------------------------------

  const filteredData = data.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  // --------------------------------
  // SCREEN
  // --------------------------------

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.gradient[0] }}
      edges={["top", "left", "right", "bottom"]}
    >
      <LinearGradient
        colors={theme.gradient}
        style={{
          flex: 1,
          paddingHorizontal: 15,
        }}
      >
        {/* HEADER */}

        <View className="flex-row justify-between items-center mb-[15px]">
          <Text className="text-[34px] font-bold" style={{ color: theme.primary }}>
            Task
          </Text>

          <TouchableOpacity
            className="items-center"
            onPress={() => router.push("/spark")}
          >
            {/* <Text className="text-[24px]">❤️‍🔥</Text> */}
            <Image
  source={require("../assets/images/ninigo_burning.gif")}
  className="w-[30px] h-[30px]"
  resizeMode="contain"
/>

            <Text className="text-[13px] font-bold text-[#FF7B00]">
              {completedDaysCount}{" "}
              {completedDaysCount === 1 ? "Day" : "Days"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* SEARCH */}

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

        {/* FILTER BUTTONS */}

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
              style={{
                backgroundColor: selected === item ? theme.primary : "#FFFFFF",
                borderColor: theme.primary,
              }}
              className="px-[18px] py-[7px] rounded-[18px] border"
            >
              <Text
                style={{
                  color: selected === item ? "#FFF" : theme.primary,
                  fontWeight: "600",
                }}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* CONTACT / TASK LIST */}

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator
              size="large"
              color="#B84CE8"
            />
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center px-[20px]">
            <Text className="text-[15px] text-[#B00020] text-center">
              {error}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text className="text-center text-[15px] text-[#777] mt-[30px]">
                No pending tasks
              </Text>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                className="flex-row items-center py-[12px]"
                onPress={() =>
                  router.push({
                    pathname: "/chat",
                    params: {
                      username: item.username || item.name,
                      name: item.name,
                      image: item.image || "",
                    },
                  })
                }
              >
                {/* PROFILE IMAGE */}

                {item.image ? (
                  <Image
                    source={{ uri: item.image }}
                    className="w-[60px] h-[60px] rounded-[30px]"
                  />
                ) : (
                  <View className="w-[60px] h-[60px] rounded-[30px] bg-[#F1C2F7] justify-center items-center">
                    <FontAwesome name="user" size={28} color="#7A2BE2" />
                  </View>
                )}

                {/* NAME + MESSAGE */}

                <View className="flex-1 ml-[12px]">
                  <Text className="text-[22px] font-bold text-[#222]">
                    {item.name}
                  </Text>

                  <Text className="text-[15px] text-[#666] mt-[3px]">
                    {item.msg}
                  </Text>
                </View>

                {/* TIME + COUNT */}

                <View className="items-end">
                  <Text className="text-[13px] text-[#666] mb-[8px]">
                    {item.time}
                  </Text>

                  <View
                    className="w-[22px] h-[22px] rounded-[11px] justify-center items-center"
                    style={{
                      backgroundColor: item.color || "#FF8A00",
                    }}
                  >
                    <Text className="text-white font-bold text-[12px]">
                      {item.count || 0}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}

        {/* FLOATING ADD BUTTON */}

        <TouchableOpacity
          className="absolute right-[20px] bottom-[80px]"
          style={{ elevation: 8 }}
          onPress={() => router.push("/find-friends")}
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
            <Ionicons
              name="add"
              size={34}
              color="#fff"
            />
          </LinearGradient>
        </TouchableOpacity>

        {/* BOTTOM NAVIGATION */}

        <BottomFooter activeTab="all" />
      </LinearGradient>
    </SafeAreaView>
  );
}