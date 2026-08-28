import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { Ionicons, Zocial } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { getSession } from "../services/session";

import {
  fetchMyStatus,
  fetchStatusFeed,
  postStatus,
  StatusItem,
} from "../services/api";

export default function Status() {
  // =========================================================
  // USER
  // =========================================================

  const [username, setUsername] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [profileImage, setProfileImage] = useState("");

  // =========================================================
  // STATUS DATA
  // =========================================================

  const [myStatuses, setMyStatuses] = useState<StatusItem[]>([]);
  const [feed, setFeed] = useState<StatusItem[]>([]);

  // =========================================================
  // UI
  // =========================================================

  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  // =========================================================
  // LOAD DATA
  // =========================================================

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const session = await getSession();

      if (!session?.username) {
        setError("Please login first");
        setMyStatuses([]);
        setFeed([]);
        return;
      }

      const currentUsername = session.username;
      const currentName = session.name || currentUsername;
      const currentProfileImage = session.profileImage || "";

      setUsername(currentUsername);
      setName(currentName);
      setProfileImage(currentProfileImage);

      const [mine, others] = await Promise.all([
        fetchMyStatus(currentUsername),
        fetchStatusFeed(currentUsername),
      ]);

     // =========================================================
// STATUS ORDER
// Oldest -> Newest
// =========================================================

const myStatusList = [...(mine?.results || [])].sort(
  (a, b) =>
    new Date(a.created_at).getTime() -
    new Date(b.created_at).getTime()
);

const contactStatusList = [...(others?.results || [])].sort(
  (a, b) =>
    new Date(a.created_at).getTime() -
    new Date(b.created_at).getTime()
);
      setMyStatuses(myStatusList);
      setFeed(contactStatusList);
    } catch (e: any) {
      console.log("STATUS LOAD ERROR:", e);

      setError(
        e?.message || "Could not load Moments from the server"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload when screen becomes active
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // =========================================================
  // ADD MOMENT
  // =========================================================

  const handleAddMoment = async () => {
    if (!username) {
      Alert.alert("Login required", "Please login first.");
      return;
    }

    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission required",
          "Gallery permission is required to add a Moment."
        );
        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
        });

      if (result.canceled) {
        return;
      }

      const selectedImage = result.assets?.[0]?.uri;

      if (!selectedImage) {
        Alert.alert("Error", "Could not select the image.");
        return;
      }

      setPosting(true);

      await postStatus({
        username,
        name,
        profile_image: profileImage,
        content_image: selectedImage,
      });

      await loadData();
    } catch (e: any) {
      console.log("ADD MOMENT ERROR:", e);

      Alert.alert(
        "Error",
        e?.message || "Could not post your Moment."
      );
    } finally {
      setPosting(false);
    }
  };

  // =========================================================
  // OPEN MY MOMENTS
  // =========================================================

  const openMyMoment = () => {
    // No moments → open gallery
    if (myStatuses.length === 0) {
      handleAddMoment();
      return;
    }

    const firstStatus = myStatuses[0];

    router.push({
      pathname: "/status-view",
      params: {
        id: String(firstStatus.id),
        mine: "true",

        image:
          firstStatus.content_image ||
          profileImage,

        name:
          firstStatus.name ||
          name,

        profileImage:
          firstStatus.profile_image ||
          profileImage,

        createdAt: new Date(
          firstStatus.created_at
        ).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),

        statuses: JSON.stringify(myStatuses),

        currentIndex: "0",
      },
    });
  };

  // =========================================================
  // OPEN CONTACT MOMENT
  // =========================================================

  const openContactMoment = (item: StatusItem) => {
  const contactStatuses = feed
    .filter(
      (status) =>
        status.username === item.username
    )
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() -
        new Date(b.created_at).getTime()
    );

  const tappedIndex = contactStatuses.findIndex(
    (status) => status.id === item.id
  );

  router.push({
    pathname: "/status-view",
    params: {
      id: String(item.id),
      mine: "false",

      image:
        item.content_image ||
        item.profile_image ||
        "",

      name:
        item.name ||
        item.username ||
        "Unknown",

      profileImage:
        item.profile_image ||
        "",

      createdAt: new Date(
        item.created_at
      ).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),

      statuses: JSON.stringify(
        contactStatuses
      ),

      currentIndex: String(
        tappedIndex >= 0 ? tappedIndex : 0
      ),
    },
  });
};
  // =========================================================
  // UNIQUE CONTACTS
  // =========================================================

  const recentContacts: StatusItem[] = [];

  const contactMap = new Map<
    string,
    StatusItem
  >();

  feed.forEach((item) => {
    const key =
      item.username ||
      item.name ||
      String(item.id);

    // Because feed is newest-first,
    // first item is the newest status.
    if (!contactMap.has(key)) {
      contactMap.set(key, item);
    }
  });

  contactMap.forEach((item) => {
    recentContacts.push(item);
  });

  // =========================================================
  // TIME FORMAT
  // =========================================================

  const formatTime = (date: string) => {
    try {
      return new Date(date).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  // =========================================================
  // MY IMAGE
  // =========================================================

 const myMomentImage =
  myStatuses.length > 0
    ? myStatuses[myStatuses.length - 1].content_image ||
      profileImage
    : profileImage;

  // =========================================================
  // UI
  // =========================================================

  return (
    <LinearGradient
      colors={[
        "#ffe7f5",
        "#ffffff",
        "#f6e5ff",
      ]}
      style={{
        flex: 1,
        paddingTop: 55,
        paddingHorizontal: 16,
      }}
    >
      {/* =====================================================
          TITLE
      ===================================================== */}

      <Text className="text-[30px] font-bold text-[#b03dd7] mb-[20px]">
        Moments
      </Text>

      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator
            size="large"
            color="#b03dd7"
          />

          <Text className="mt-[10px] text-[#777]">
            Loading Moments...
          </Text>
        </View>
      ) : (
        <>
          {/* =================================================
              ERROR
          ================================================= */}

          {error ? (
            <View className="items-center mt-[20px]">
              <Text className="text-[15px] text-[#B00020] text-center">
                {error}
              </Text>

              <TouchableOpacity
                onPress={loadData}
                className="mt-[15px] px-[20px] py-[10px] rounded-[20px] bg-[#b03dd7]"
              >
                <Text className="text-white font-bold">
                  Try Again
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* =============================================
                  TODAY
              ============================================= */}

              <Text className="text-[20px] font-semibold text-[#444] mb-[15px] mt-[10px]">
                Today
              </Text>

              {/* =============================================
                  MY MOMENT
              ============================================= */}

              <View className="flex-row items-center mb-[20px]">
                {/* Profile / status image */}

                <TouchableOpacity
                  onPress={openMyMoment}
                  disabled={posting}
                >
                  <View>
                    {myMomentImage ? (
                      <Image
                        source={{
                          uri: myMomentImage,
                        }}
                        className="w-[60px] h-[60px] rounded-[30px] border-[3px] border-[#00d26a]"
                      />
                    ) : (
                      <View className="w-[60px] h-[60px] rounded-[30px] border-[3px] border-[#ccc] bg-white items-center justify-center">
                        <Ionicons
                          name="person"
                          size={28}
                          color="#999"
                        />
                      </View>
                    )}

                    {/* Add button */}

                    <TouchableOpacity
                      onPress={handleAddMoment}
                      disabled={posting}
                      className="absolute bottom-0 right-0 w-[23px] h-[23px] rounded-[12px] bg-[#b03dd7] items-center justify-center border-[2px] border-white"
                    >
                      {posting ? (
                        <ActivityIndicator
                          size="small"
                          color="#fff"
                        />
                      ) : (
                        <Ionicons
                          name="add"
                          size={15}
                          color="#fff"
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>

                {/* My moment text */}

                <TouchableOpacity
                  onPress={openMyMoment}
                  disabled={posting}
                  className="ml-[15px] flex-1"
                >
                  <Text className="text-[18px] font-bold text-[#222]">
                    My Moment
                  </Text>

                  <Text className="text-[14px] text-[#666] mt-[4px]">
                    {myStatuses.length > 0
                      ? `Viewed by ${
                          myStatuses[0]
                            .viewer_count || 0
                        } ${
                          (myStatuses[0]
                            .viewer_count || 0) === 1
                            ? "member"
                            : "members"
                        }`
                      : "Tap to add a status update"}
                  </Text>

                  {myStatuses.length > 1 && (
                    <Text className="text-[12px] text-[#999] mt-[2px]">
                      {myStatuses.length} Moments
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* =============================================
                  RECENT UPDATES
              ============================================= */}

              <Text className="text-[20px] font-semibold text-[#444] mb-[15px] mt-[10px]">
                Recent Updates
              </Text>

              <FlatList
                data={recentContacts}
                keyExtractor={(item) =>
                  item.username ||
                  String(item.id)
                }
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  paddingBottom: 80,
                }}
                ListEmptyComponent={
                  <Text className="text-[14px] text-[#777] mt-[10px]">
                    No recent Moments from your
                    contacts yet.
                  </Text>
                }
                renderItem={({ item }) => {
                  const image =
                    item.content_image ||
                    item.profile_image ||
                    "";

                  return (
                    <TouchableOpacity
                      onPress={() =>
                        openContactMoment(item)
                      }
                      className="flex-row items-center mb-[20px]"
                    >
                      {/* Contact image */}

                      {image ? (
                        <Image
                          source={{ uri: image }}
                          className={`w-[60px] h-[60px] rounded-[30px] border-[3px] mr-[15px] ${
                            item.viewed_by_me
                              ? "border-[#ccc]"
                              : "border-[#00d26a]"
                          }`}
                        />
                      ) : (
                        <View className="w-[60px] h-[60px] rounded-[30px] border-[3px] border-[#ccc] mr-[15px] bg-white items-center justify-center">
                          <Ionicons
                            name="person"
                            size={28}
                            color="#999"
                          />
                        </View>
                      )}

                      {/* Contact information */}

                      <View className="flex-1">
                        <Text className="text-[18px] font-bold text-[#222]">
                          {item.name ||
                            item.username ||
                            "Unknown"}
                        </Text>

                        <Text className="text-[14px] text-[#666] mt-[4px]">
                          {formatTime(
                            item.created_at
                          )}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />
            </>
          )}
        </>
      )}

      {/* =====================================================
          BOTTOM NAVIGATION
      ===================================================== */}

      <View className="absolute left-0 right-0 bottom-0 h-[60px] flex-row justify-around items-center bg-white rounded-t-[25px]">
        {/* ALL */}

        <TouchableOpacity
          onPress={() => router.push("/all")}
        >
          <Ionicons
            name="document-text-outline"
            size={28}
            color="#777"
          />
        </TouchableOpacity>

        {/* STATUS */}

        <TouchableOpacity>
          <Zocial
            name="statusnet"
            size={28}
            color="#b03dd7"
          />
        </TouchableOpacity>

        {/* REWARDS */}

        <TouchableOpacity
          onPress={() =>
            router.push("/rewards")
          }
        >
          <Ionicons
            name="gift-outline"
            size={28}
            color="#777"
          />
        </TouchableOpacity>

        {/* PROFILE */}

        <TouchableOpacity
          onPress={() =>
            router.push("/profile")
          }
        >
          <Ionicons
            name="person-outline"
            size={28}
            color="#777"
          />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}