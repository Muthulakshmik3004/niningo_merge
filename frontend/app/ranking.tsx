import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTheme } from "../constants/ThemeContext";
import { getCurrentProfileAsync } from "../constants/ProfileStore";
import BACKEND_URL from "../config";

type RankingItem = {
  rank: number;
  username: string;
  display_name: string;
  points: number;
  completed_tasks: number;
  family: string;
  location: string;
};

type RankingResponse = {
  success: boolean;
  scope: string;
  current_user: {
    username: string;
    display_name: string;
    points: number;
    completed_tasks: number;
    family: string;
    location: string;
  };
  rankings: RankingItem[];
};

const POINTS_GUIDE = [
  { label: "Priority task", points: "+35 pts" },
  { label: "Medium priority task", points: "+20 pts" },
  { label: "Lower priority task", points: "+10 pts" },
];

export default function RankingScreen() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<"contacts" | "tirunelveli">("contacts");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<RankingResponse | null>(null);
  const [username, setUsername] = useState("");

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-8)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(8)).current;

  const fetchRanking = React.useCallback(async () => {
    if (!username) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `${BACKEND_URL}/app/ranking/?username=${encodeURIComponent(username)}&scope=${activeTab}`
      );
      const json = await response.json();
      if (response.ok) {
        setData(json);
      } else {
        setError(json.error || "Failed to load ranking");
      }
    } catch {
      setError("Could not reach the backend server.");
    } finally {
      setLoading(false);
    }
  }, [username, activeTab]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(headerTranslateY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 250,
        delay: 100,
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslateY, {
        toValue: 0,
        duration: 250,
        delay: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    const init = async () => {
      const cached = await getCurrentProfileAsync();
      if (cached?.username) {
        setUsername(cached.username);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!username) return;
    fetchRanking();
  }, [username, activeTab, fetchRanking]);

  const renderPointsGuide = () => (
    <View className="mt-[20px] mb-[10px]">
      <Text className="text-[18px] font-bold mb-[10px]" style={{ color: theme.primary }}>
        POINTS GUIDE
      </Text>
      <View className="bg-white rounded-[18px] p-[16px]">
        {POINTS_GUIDE.map((item, index) => (
          <View
            key={index}
            className="flex-row justify-between items-center py-[10px] border-b border-[#f0f0f0] last:border-b-0"
          >
            <Text className="text-[15px] text-[#333]">{item.label}</Text>
            <Text className="text-[15px] font-bold" style={{ color: theme.primary }}>
              {item.points}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderContactsView = () => {
    if (!data) return null;
    const maxPoints = Math.max(...data.rankings.map((item) => item.points), 1);

    return (
      <View>
        {/* Featured Card */}
        {data.current_user && (
          <View className="rounded-[18px] p-[20px] mb-[20px]" style={{ backgroundColor: theme.primary }}>
            <View className="flex-row items-center mb-[8px]">
              <MaterialCommunityIcons name="crown" size={22} color="#fff" style={{ marginRight: 8 }} />
              <Text className="text-[18px] font-bold text-white">
                {data.current_user.display_name || data.current_user.username}
              </Text>
            </View>
            <Text className="text-[24px] font-bold text-white mb-[4px]">
              {data.current_user.points} pts
            </Text>
            <Text className="text-[13px] text-white opacity-90">
              {data.current_user.completed_tasks} tasks completed
            </Text>
          </View>
        )}

        {/* Ranking List */}
        <Text className="text-[18px] font-bold mb-[10px]" style={{ color: theme.primary }}>
          Rankings
        </Text>
        {data.rankings.length === 0 ? (
          <Text className="text-[14px] text-[#666] mb-[20px]">No ranking data available yet.</Text>
        ) : (
          <View className="gap-[10px]">
            {data.rankings.map((item) => {
              const progress = maxPoints > 0 ? item.points / maxPoints : 0;
              return (
                <View key={item.rank} className="bg-white rounded-[16px] p-[14px]">
                  <View className="flex-row justify-between items-center mb-[6px]">
                    <View className="flex-row items-center">
                      <View
                        className="w-[28px] h-[28px] rounded-full items-center justify-center mr-[10px]"
                        style={{ backgroundColor: theme.primary }}
                      >
                        <Text className="text-[12px] font-bold text-white">{item.rank}</Text>
                      </View>
                      <Text className="text-[15px] font-bold text-[#222]">{item.display_name}</Text>
                    </View>
                    <Text className="text-[15px] font-bold" style={{ color: theme.primary }}>
                      {item.points}pts
                    </Text>
                  </View>
                  <View className="h-[6px] rounded-full bg-[#f0f0f0] overflow-hidden mb-[4px]">
                    <View
                      className="h-full rounded-full"
                      style={{ width: `${Math.max(progress * 100, 0)}%`, backgroundColor: theme.primary }}
                    />
                  </View>
                  <Text className="text-[12px] text-[#666]">{item.completed_tasks} tasks done</Text>
                </View>
              );
            })}
          </View>
        )}

        {renderPointsGuide()}
      </View>
    );
  };

  const renderTirunelveliView = () => {
    if (!data) return null;

    return (
      <View>
        {/* Community Card */}
        {data.current_user && (
          <View className="rounded-[18px] p-[20px] mb-[20px]" style={{ backgroundColor: theme.primary }}>
            <Text className="text-[18px] font-bold text-white mb-[4px]">Tirunelveli</Text>
            <Text className="text-[13px] text-white opacity-90 mb-[8px]">
              Tirunelveli, Tamilnadu, India
            </Text>
            <View className="flex-row items-center">
              <Ionicons name="people" size={18} color="#fff" style={{ marginRight: 6 }} />
              <Text className="text-[14px] text-white">9 Families</Text>
            </View>
            <View className="flex-row gap-[8px] mt-[10px] flex-wrap">
              {["Nellai City", "Nellai Pride"].map((chip) => (
                <View
                  key={chip}
                  className="rounded-full px-[12px] py-[6px] bg-white/20"
                >
                  <Text className="text-[12px] font-semibold text-white">{chip}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Family Rank */}
        {data.current_user && (
          <View className="bg-white rounded-[18px] p-[16px] mb-[20px] flex-row items-center justify-between">
            <View>
              <Text className="text-[16px] font-bold text-[#222]">Your Family&apos;s Rank</Text>
              <Text className="text-[14px] text-[#666] mt-[4px]">
                {data.current_user.points}pts, {data.current_user.completed_tasks} task done
              </Text>
            </View>
            <Ionicons name="star" size={24} color={theme.primary} />
          </View>
        )}

        {/* Families */}
        <Text className="text-[18px] font-bold mb-[10px]" style={{ color: theme.primary }}>
          Families
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-[20px]">
          <View className="flex-row gap-[12px]">
            {[
              { name: "NGO Colony", points: "11.3k pts", families: "31 families" },
              { name: "Melapalayam", points: "9.4k pts", families: "28 families" },
            ].map((item, index) => (
              <View
                key={index}
                className="bg-white rounded-[16px] p-[14px] w-[160px]"
              >
                <Text className="text-[15px] font-bold text-[#222] mb-[4px]">{item.name}</Text>
                <Text className="text-[14px] font-bold" style={{ color: theme.primary }}>{item.points}</Text>
                <Text className="text-[12px] text-[#666]">{item.families}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Community Rankings */}
        <Text className="text-[18px] font-bold mb-[10px]" style={{ color: theme.primary }}>
          Rankings
        </Text>
        {data.rankings.length === 0 ? (
          <Text className="text-[14px] text-[#666] mb-[20px]">No ranking data available yet.</Text>
        ) : (
          <View className="gap-[10px]">
            {data.rankings.map((item) => (
              <View key={item.rank} className="bg-white rounded-[16px] p-[14px] flex-row justify-between items-center">
                <View>
                  <Text className="text-[15px] font-bold text-[#222]">@{item.username}</Text>
                  <Text className="text-[12px] text-[#666]">{item.completed_tasks} tasks</Text>
                </View>
                <Text className="text-[15px] font-bold" style={{ color: theme.primary }}>
                  {item.points}pts
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.gradient[0] }} edges={["left", "right", "bottom", "top"]}>
      <LinearGradient colors={theme.gradient} style={{ flex: 1 }}>
        <ScrollView
          className="flex-1 px-[25px] pt-[20px]"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Header */}
          <Animated.View
            className="flex-row items-center mb-[20px]"
            style={{
              opacity: headerOpacity,
              transform: [{ translateY: headerTranslateY }],
            }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-[12px]"
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={28} color={theme.primary} />
            </TouchableOpacity>
            <Text className="text-[24px] font-bold flex-1" style={{ color: theme.primary }}>
              Ranking
            </Text>
            <View
              className="rounded-full px-[14px] py-[6px]"
              style={{ backgroundColor: theme.primary }}
            >
              <Text className="text-[14px] font-bold text-white">
                {data?.current_user?.points ?? 0}pts
              </Text>
            </View>
          </Animated.View>

          {/* Tabs */}
          <View className="flex-row mb-[20px]">
            {(["contacts", "tirunelveli"] as const).map((tab) => {
              const label = tab === "contacts" ? "My Contacts" : "Tirunelveli";
              const isActive = activeTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  className="flex-1 items-center pb-[10px]"
                  onPress={() => setActiveTab(tab)}
                  activeOpacity={0.7}
                >
                  <Text
                    className="text-[16px] font-semibold"
                    style={{ color: isActive ? theme.primary : "#999" }}
                  >
                    {label}
                  </Text>
                  {isActive && (
                    <View className="mt-[6px] h-[3px] rounded-full" style={{ backgroundColor: theme.primary, width: "60%" }} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Content */}
          <Animated.View
            style={{
              opacity: contentOpacity,
              transform: [{ translateY: contentTranslateY }],
            }}
          >
            {loading && (
              <View className="items-center py-[40px]">
                <ActivityIndicator size="large" color={theme.primary} />
              </View>
            )}

            {error && !loading && (
              <View className="items-center py-[40px]">
                <Text className="text-[14px] text-[#666] mb-[10px]">{error}</Text>
                <TouchableOpacity
                  className="rounded-full px-[20px] py-[10px]"
                  style={{ backgroundColor: theme.primary }}
                  onPress={fetchRanking}
                >
                  <Text className="text-[14px] font-bold text-white">Retry</Text>
                </TouchableOpacity>
              </View>
            )}

            {!loading && !error && activeTab === "contacts" && renderContactsView()}
            {!loading && !error && activeTab === "tirunelveli" && renderTirunelveliView()}
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}
