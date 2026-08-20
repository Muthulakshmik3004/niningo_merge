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

import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Zocial } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { getUsername } from "../services/session";
import { fetchContacts, ContactItem } from "../services/api";

export default function UnreadScreen() {
  const [selected, setSelected] = useState("Unread");
  const [search, setSearch] = useState("");

  const [data, setData] = useState<ContactItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [completedDaysCount, setCompletedDaysCount] = useState(0);

  // ==========================================
  // LOAD SPARK / COMPLETED DAYS
  // ==========================================

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

  // ==========================================
  // LOAD UNREAD CONTACTS
  // ==========================================

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

      const res = await fetchContacts(username, "unread");

      setData(res.results);
    } catch (e: any) {
      setError(
        e?.message || "Could not load contacts from the server"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================
  // RELOAD WHEN SCREEN GETS FOCUS
  // ==========================================

  useFocusEffect(
    useCallback(() => {
      loadData();
      loadCompletedDays();
    }, [loadData, loadCompletedDays])
  );

  // ==========================================
  // FILTER SEARCH RESULTS
  // ==========================================

  const filteredData = data.filter((item) =>
    (item.name || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // ==========================================
  // UI
  // ==========================================

  return (
    <SafeAreaView
      style={{ flex: 1 }}
      edges={["left", "right", "bottom"]}
    >
      <LinearGradient
        colors={["#FFD7F8", "#FFF7FD"]}
        style={{
          flex: 1,
          paddingTop: 38,
          paddingHorizontal: 15,
        }}
      >
        {/* ================= HEADER ================= */}

        <View className="flex-row justify-between items-center mb-[15px]">
          <Text className="text-[34px] font-bold text-[#B84CE8]">
            Task
          </Text>

          {/* Spark */}

          <TouchableOpacity
            className="items-center"
            onPress={() => router.push("/spark")}
          >
            <Text className="text-[24px]">
              ❤️‍🔥
            </Text>

            <Text className="text-[13px] font-bold text-[#FF7B00]">
              {completedDaysCount}{" "}
              {completedDaysCount === 1 ? "Day" : "Days"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ================= SEARCH ================= */}

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

        {/* ================= FILTER ================= */}

        <View className="flex-row justify-between mt-[12px] mb-[15px]">
          {["All", "Unread", "Pending", "Groups"].map(
            (item) => (
              <TouchableOpacity
                key={item}
                onPress={() => {
                  setSelected(item);

                  if (item === "All") {
                    router.push("/all");
                  }

                  if (item === "Pending") {
                    router.push("/pending");
                  }

                  if (item === "Groups") {
                    router.push("/groups");
                  }
                }}
                className={`px-[18px] py-[7px] rounded-[18px] border border-[#B37BD8] ${
                  selected === item
                    ? "bg-[#F1C2F7]"
                    : "bg-[#FFF]"
                }`}
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
            )
          )}
        </View>

        {/* ================= CONTACT LIST ================= */}

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator
              size="large"
              color="#B84CE8"
            />

            <Text className="mt-[12px] text-[#7A2BE2]">
              Loading unread chats...
            </Text>
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
                No unread chats
              </Text>
            }
            renderItem={({ item }) => (
              <TouchableOpacity className="flex-row items-center py-[12px]">
                {/* Avatar */}

                <Image
                  source={{ uri: item.image }}
                  className="w-[60px] h-[60px] rounded-[30px]"
                />

                {/* Name + Message */}

                <View className="flex-1 ml-[12px]">
                  <Text className="text-[22px] font-bold text-[#222]">
                    {item.name}
                  </Text>

                  <Text className="text-[15px] text-[#666] mt-[3px]">
                    {item.msg}
                  </Text>
                </View>

                {/* Time + Count */}

                <View className="items-end">
                  <Text className="text-[13px] text-[#666] mb-[8px]">
                    {item.time}
                  </Text>

                  {item.count > 0 && (
                    <View
                      className="w-[22px] h-[22px] rounded-[11px] justify-center items-center"
                      style={{
                        backgroundColor: item.color,
                      }}
                    >
                      <Text className="text-white font-bold text-[12px]">
                        {item.count}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            )}
          />
        )}

        {/* ================= FLOATING ADD BUTTON ================= */}

        <TouchableOpacity
          className="absolute right-[20px] bottom-[80px]"
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
            <Ionicons
              name="add"
              size={34}
              color="#fff"
            />
          </LinearGradient>
        </TouchableOpacity>

        {/* ================= BOTTOM NAVIGATION ================= */}

        <View className="absolute left-0 right-0 bottom-0 h-[60px] flex-row justify-around items-center bg-white rounded-t-[25px]">
          
          {/* Task */}

          <TouchableOpacity
            onPress={() => router.push("/all")}
          >
            <Ionicons
              name="document-text-outline"
              size={28}
              color="#777"
            />
          </TouchableOpacity>

          {/* Status */}

          <TouchableOpacity
            onPress={() => router.push("/status")}
          >
            <Zocial
              name="statusnet"
              size={28}
              color="#777"
            />
          </TouchableOpacity>

          {/* Rewards */}

          <TouchableOpacity
            onPress={() => router.push("/rewards")}
          >
            <Ionicons
              name="gift-outline"
              size={28}
              color="#777"
            />
          </TouchableOpacity>

          {/* Profile */}

          <TouchableOpacity
            onPress={() => router.push("/profile")}
          >
            <Ionicons
              name="person-outline"
              size={28}
              color="#777"
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}