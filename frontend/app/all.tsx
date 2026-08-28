import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Zocial,
  FontAwesome,
  Ionicons,
} from "@expo/vector-icons";

import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";

import { getUsername } from "../services/session";
import {
  fetchContacts,
  createContact,
  ContactItem,
} from "../services/api";

import BACKEND_URL from "../config";
import { useTheme } from "../constants/ThemeContext";
import BottomFooter from "../components/BottomFooter";

/* =========================================================
   OPTIONAL EXPO CONTACTS MODULE
   ========================================================= */

let Contacts: any = null;

try {
  Contacts = require("expo-contacts");
} catch (err) {
  console.warn(
    "expo-contacts native module is not available in current environment",
    err
  );
}

/* =========================================================
   TYPES
   ========================================================= */

interface RegisteredContact {
  name: string;
  username: string;
  phone_number: string;
  profile_image?: string;
}

/* =========================================================
   SCREEN
   ========================================================= */

export default function TaskScreen() {
  const { theme } = useTheme();
  /* =======================================================
     GENERAL TASK / CONTACT STATE
     ======================================================= */

  const [selected, setSelected] = useState("All");
  const [search, setSearch] = useState("");

  const [data, setData] = useState<ContactItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =======================================================
     SPARK / COMPLETED DAYS
     ======================================================= */

  const [completedDaysCount, setCompletedDaysCount] = useState(0);

  /* =======================================================
     FIND FRIENDS
     ======================================================= */

  const [friendsLoading, setFriendsLoading] = useState(false);
  const [showFriendsModal, setShowFriendsModal] =
    useState(false);

  const [registeredContacts, setRegisteredContacts] =
    useState<RegisteredContact[]>([]);
  const [connectedMap, setConnectedMap] = useState<Record<string, boolean>>({});

  /* =======================================================
     LOAD CONTACT DATA FROM BACKEND
     ======================================================= */

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

      const res = await fetchContacts(username, "all");

      setData(res.results || []);
    } catch (e: any) {
      console.error("Contact loading error:", e);

      setError(
        e?.message ||
        "Could not load contacts from the server"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /* =======================================================
     LOAD COMPLETED DAYS FROM ASYNC STORAGE
     ======================================================= */

  const loadCompletedDays = useCallback(async () => {
    try {
      const savedProgress =
        await AsyncStorage.getItem(
          "niningo_spark_progress"
        );

      if (!savedProgress) {
        setCompletedDaysCount(0);
        return;
      }

      const progress = JSON.parse(savedProgress);

      /*
       Example structure:

       {
         "2026-08-17": {
           "0": "image-uri"
         },

         "2026-08-18": {
           "0": "image-uri",
           "1": "image-uri"
         }
       }

       Every date containing at least one
       completed task counts as one completed day.
      */

      const completedDays = Object.keys(
        progress
      ).filter((date) => {
        return (
          progress[date] &&
          typeof progress[date] === "object" &&
          Object.keys(progress[date]).length > 0
        );
      });

      setCompletedDaysCount(
        completedDays.length
      );
    } catch (err) {
      console.error(
        "Completed days load error:",
        err
      );

      setCompletedDaysCount(0);
    }
  }, []);

  /* =======================================================
     LOAD DEVICE CONTACTS + MATCH REGISTERED USERS
     ======================================================= */

  const loadMatchedContacts = useCallback(
    async () => {
      try {
        /*
         * Expo Go may not contain expo-contacts.
         * In that case we simply don't try to access
         * device contacts automatically.
         */

        if (
          !Contacts ||
          typeof Contacts.getPermissionsAsync !==
          "function"
        ) {
          return;
        }

        const {
          status: existingStatus,
        } =
          await Contacts.getPermissionsAsync();

        let finalStatus = existingStatus;

        if (finalStatus !== "granted") {
          const { status: requested } =
            await Contacts.requestPermissionsAsync();

          finalStatus = requested;
        }

        if (finalStatus !== "granted") {
          return;
        }

        const { data: deviceContacts } =
          await Contacts.getContactsAsync({
            fields: Contacts.Fields
              ? [
                Contacts.Fields.Name,
                Contacts.Fields.PhoneNumbers,
              ]
              : undefined,
          });

        const phoneNumbers: string[] = [];

        (deviceContacts || []).forEach(
          (contact: any) => {
            (contact.phoneNumbers || []).forEach(
              (phone: any) => {
                if (phone.number) {
                  phoneNumbers.push(
                    phone.number
                  );
                }
              }
            );
          }
        );

        if (phoneNumbers.length === 0) {
          return;
        }

        const response = await fetch(
          `${BACKEND_URL}/app/contacts/match/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              phone_numbers: phoneNumbers,
            }),
          }
        );

        const result = await response.json();

        /*
         * This endpoint belongs to the automatic
         * matching functionality from your first version.
         *
         * We don't put these results into the main
         * task contact list because that list is now
         * supplied by fetchContacts().
         */

        if (
          response.ok &&
          result.success
        ) {
          console.log(
            "Matched device contacts:",
            result.friends || []
          );
        }
      } catch (err) {
        console.error(
          "Auto-load contacts error:",
          err
        );
      }
    },
    []
  );

  /* =======================================================
     FIND FRIENDS BUTTON
     ======================================================= */

  const handleFindFriends = async () => {
    try {
      /*
       * Check whether expo-contacts is available.
       */

      if (
        !Contacts ||
        typeof Contacts.requestPermissionsAsync !==
        "function"
      ) {
        Alert.alert(
          "Feature Notice",
          "Expo Contacts is not available in the current Expo Go environment. To use live device contact matching, run an Expo development build."
        );

        return;
      }

      /*
       * Ask for contacts permission.
       */

      const { status } =
        await Contacts.requestPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Contacts permission is required to find friends registered on Niningo."
        );

        return;
      }

      /*
       * Open modal immediately so the user sees
       * the loading state.
       */

      setFriendsLoading(true);
      setRegisteredContacts([]);
      setShowFriendsModal(true);

      /*
       * Read device contacts.
       */

      const fieldsToGet =
        Contacts.Fields
          ? [
            Contacts.Fields.Name,
            Contacts.Fields.PhoneNumbers,
          ]
          : undefined;

      const { data: deviceContacts } =
        await Contacts.getContactsAsync({
          fields: fieldsToGet,
        });

      /*
       * Extract phone numbers.
       */

      const extractedNumbers: string[] = [];

      if (
        deviceContacts &&
        deviceContacts.length > 0
      ) {
        deviceContacts.forEach(
          (contact: any) => {
            if (
              contact.phoneNumbers &&
              contact.phoneNumbers.length > 0
            ) {
              contact.phoneNumbers.forEach(
                (phone: any) => {
                  if (phone.number) {
                    extractedNumbers.push(
                      phone.number
                    );
                  }
                }
              );
            }
          }
        );
      }

      /*
       * No phone numbers.
       */

      if (extractedNumbers.length === 0) {
        setRegisteredContacts([]);
        return;
      }

      /*
       * Remove duplicate phone numbers.
       */

      const uniqueNumbers = Array.from(
        new Set(extractedNumbers)
      );

      /*
       * Send numbers to backend.
       */

      const currentOwner = await getUsername();

      const response = await fetch(
        `${BACKEND_URL}/app/match-contacts/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone_numbers: uniqueNumbers,
            username: currentOwner || "",
          }),
        }
      );

      const result = await response.json();

      if (
        response.ok &&
        result.success
      ) {
        const rawFriends = result.friends || result.contacts || [];
        const filteredFriends = rawFriends.filter(
          (f: any) =>
            (f.username || "").trim().toLowerCase() !==
            (currentOwner || "").trim().toLowerCase()
        );
        setRegisteredContacts(filteredFriends);
      } else {
        Alert.alert(
          "Error",
          result.error ||
          "Could not match contacts."
        );
      }
    } catch (err: any) {
      console.error(
        "Contacts matching error:",
        err
      );

      Alert.alert(
        "Error",
        err?.message ||
        "An error occurred while loading contacts."
      );
    } finally {
      setFriendsLoading(false);
    }
  };

  const handleConnectUser = async (contact: RegisteredContact) => {
    const key = (contact.username || contact.name || "").toLowerCase();

    // Optimistically change button to [Message] instantly in the modal UI
    setConnectedMap((prev) => ({ ...prev, [key]: true }));

    try {
      const owner = await getUsername();
      if (!owner) {
        Alert.alert("Login Required", "Please log in first.");
        setConnectedMap((prev) => ({ ...prev, [key]: false }));
        return;
      }

      const displayName = contact.name || contact.username || "Niningo User";

      const res = await fetch(`${BACKEND_URL}/app/contacts/connect/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner_username: owner,
          friend_username: contact.username || contact.name || "",
        }),
      });

      const resData = await res.json();

      if (!res.ok || !resData.success) {
        // Fallback to createContact if connect endpoint returned error
        await createContact({
          owner_username: owner,
          name: displayName,
          target_username: contact.username || "",
          msg: "Connected on Niningo",
          time: "Just now",
        });
      }

      // Reload contact list in background
      await loadData();
    } catch (err: any) {
      console.error("Connect error:", err);
      setConnectedMap((prev) => ({ ...prev, [key]: false }));
      Alert.alert("Error", "Could not connect with user.");
    }
  };

  /* =======================================================
     LOAD DATA WHEN SCREEN IS FIRST MOUNTED
     ======================================================= */

  useEffect(() => {
    loadMatchedContacts();
  }, [loadMatchedContacts]);

  /* =======================================================
     RELOAD WHEN TASK SCREEN GETS FOCUS
     ======================================================= */

  useFocusEffect(
    useCallback(() => {
      loadData();
      loadCompletedDays();
    }, [loadData, loadCompletedDays])
  );

  /* =======================================================
     SEARCH FILTER
     ======================================================= */

  const filteredData = data.filter(
    (item) =>
      (item.name || "")
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  /* =======================================================
     UI
     ======================================================= */

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
        {/* =================================================
            HEADER
            ================================================= */}

        <View className="flex-row justify-between items-center mb-[15px]">
          <Text className="text-[34px] font-bold" style={{ color: theme.primary }}>
            Task
          </Text>

          <View className="flex-row items-center gap-3">
            {/* FIND FRIENDS */}

            <TouchableOpacity
              onPress={handleFindFriends}
              style={{ backgroundColor: theme.primary + "22", borderColor: theme.primary }}
              className="border px-[12px] py-[6px] rounded-[18px] flex-row items-center"
            >
              <Ionicons
                name="people"
                size={18}
                color={theme.primary}
              />

              <Text className="ml-[6px] text-[13px] font-bold" style={{ color: theme.primary }}>
                Find Friends
              </Text>
            </TouchableOpacity>

            {/* SPARK */}

            <TouchableOpacity
              className="items-center"
              onPress={() =>
                router.push("/spark")
              }
            >
              {/* <Text className="text-[24px]">
                ❤️‍🔥
              </Text> */}
              <Image
  source={require("../assets/images/ninigo_burning.gif")}
  className="w-[30px] h-[30px]"
  resizeMode="contain"
/>

              <Text className="text-[13px] font-bold text-[#FF7B00]">
                {completedDaysCount}{" "}
                {completedDaysCount === 1
                  ? "Day"
                  : "Days"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* =================================================
            SEARCH
            ================================================= */}

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

        {/* =================================================
            FILTER BUTTONS
            ================================================= */}

        <View className="flex-row justify-between mt-[12px] mb-[15px]">
          {[
            "All",
            "Unread",
            "Pending",
            "Groups",
          ].map((item) => (
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

        {/* =================================================
            CONTACT LIST
            ================================================= */}

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator
              size="large"
              color="#B84CE8"
            />

            <Text className="mt-[12px] text-[#7A2BE2] font-semibold">
              Loading contacts...
            </Text>
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center px-[20px]">
            <Text className="text-[15px] text-[#B00020] text-center">
              {error}
            </Text>

            <TouchableOpacity
              onPress={loadData}
              className="mt-[20px] bg-[#F1C2F7] px-[24px] py-[10px] rounded-[20px]"
            >
              <Text className="text-[#7A2BE2] font-bold">
                Retry
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredData}
            keyExtractor={(item) =>
              String(item.id)
            }
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="items-center mt-[40px]">
                <Ionicons
                  name="people-outline"
                  size={55}
                  color={theme.primary}
                />

                <Text className="text-center text-[17px] font-bold text-[#555] mt-[15px]">
                  No contacts yet
                </Text>

                <Text className="text-center text-[14px] text-[#999] mt-[6px] px-[20px]">
                  Try finding friends registered
                  on Niningo.
                </Text>

                <TouchableOpacity
                  onPress={handleFindFriends}
                  style={{ backgroundColor: theme.primary }}
                  className="mt-[18px] px-[24px] py-[10px] rounded-[20px]"
                >
                  <Text className="text-white font-bold">
                    Find Friends
                  </Text>
                </TouchableOpacity>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
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
                className="flex-row items-center py-[12px]"
              >
                {/* AVATAR */}

                {item.image ? (
                  <Image
                    source={{
                      uri: item.image,
                    }}
                    className="w-[60px] h-[60px] rounded-[30px]"
                  />
                ) : (
                  <View className="w-[60px] h-[60px] rounded-[30px] bg-[#F1C2F7] justify-center items-center">
                    <FontAwesome
                      name="user"
                      size={28}
                      color="#7A2BE2"
                    />
                  </View>
                )}

                {/* CONTACT INFO */}

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

                  {item.count > 0 && (
                    <View
                      className="w-[22px] h-[22px] rounded-[11px] justify-center items-center"
                      style={{
                        backgroundColor:
                          item.color,
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

        {/* =================================================
            FLOATING ADD / FIND FRIENDS BUTTON
            ================================================= */}

        <TouchableOpacity
          className="absolute right-[20px] bottom-[80px] w-[60px] h-[60px] rounded-[30px] justify-center items-center"
          style={{ elevation: 8 }}
          onPress={handleFindFriends}
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

        {/* =================================================
            BOTTOM NAVIGATION
            ================================================= */}

        <BottomFooter activeTab="all" />

        {/* =================================================
            REGISTERED FRIENDS MODAL
            ================================================= */}

        <Modal
          visible={showFriendsModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() =>
            setShowFriendsModal(false)
          }
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View style={{ backgroundColor: theme.gradient[1] || "#FFF" }} className="rounded-t-[30px] h-[75%] p-[20px]">
              {/* MODAL HEADER */}

              <View className="flex-row justify-between items-center mb-[15px]">
                <View className="flex-row items-center">
                  <Ionicons
                    name="people"
                    size={26}
                    color={theme.primary}
                  />

                  <Text className="text-[22px] font-bold text-[#111] ml-[10px]">
                    Registered Friends
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() =>
                    setShowFriendsModal(false)
                  }
                >
                  <Ionicons
                    name="close-circle"
                    size={30}
                    color="#888"
                  />
                </TouchableOpacity>
              </View>

              {/* LOADING */}

              {friendsLoading ? (
                <View className="flex-1 justify-center items-center">
                  <ActivityIndicator
                    size="large"
                    color={theme.primary}
                  />

                  <Text style={{ color: theme.primary }} className="mt-[12px] font-semibold text-center">
                    Matching contacts with
                    Niningo users...
                  </Text>
                </View>
              ) : registeredContacts.length ===
                0 ? (
                /* EMPTY */

                <View className="flex-1 justify-center items-center px-[20px]">
                  <Ionicons
                    name="person-add-outline"
                    size={60}
                    color={theme.primary}
                  />

                  <Text className="text-[18px] font-bold text-[#333] mt-[15px] text-center">
                    No Registered Contacts Found
                  </Text>

                  <Text className="text-[14px] text-[#777] text-center mt-[8px]">
                    None of your phone contacts
                    have signed up on Niningo
                    yet. Invite them to get
                    started!
                  </Text>

                  <TouchableOpacity
                    onPress={handleFindFriends}
                    style={{ backgroundColor: theme.primary + "25" }}
                    className="mt-[20px] px-[24px] py-[10px] rounded-[20px]"
                  >
                    <Text style={{ color: theme.primary }} className="font-bold">
                      Try Again
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                /* REGISTERED CONTACTS */

                <FlatList
                  data={registeredContacts}
                  keyExtractor={(
                    item,
                    index
                  ) =>
                    `${item.phone_number}_${index}`
                  }
                  showsVerticalScrollIndicator={
                    false
                  }
                  renderItem={({ item }) => (
                    <View style={{ borderColor: theme.primary + "40" }} className="flex-row items-center bg-white p-[14px] rounded-[20px] mb-[10px] border">
                      {/* AVATAR */}

                      <View style={{ backgroundColor: theme.primary + "20" }} className="w-[50px] h-[50px] rounded-[25px] justify-center items-center">
                        <FontAwesome
                          name="user"
                          size={24}
                          color={theme.primary}
                        />
                      </View>

                      {/* USER INFO */}

                      <View className="flex-1 ml-[12px]">
                        <Text className="text-[18px] font-bold text-[#222]">
                          {item.name ||
                            "Niningo User"}
                        </Text>

                        <Text style={{ color: theme.primary }} className="text-[13px]">
                          {item.username
                            ? `@${item.username}`
                            : item.phone_number}
                        </Text>
                      </View>

                      {/* CONNECT / MESSAGE */}

                      {connectedMap[(item.username || item.name || "").toLowerCase()] ||
                        data.some((c) => {
                          const targetU = (c.username || "").toLowerCase();
                          const itemU = (item.username || "").toLowerCase();
                          const cName = (c.name || "").toLowerCase();
                          const itemName = (item.name || "").toLowerCase();
                          return (
                            (targetU && itemU && targetU === itemU) ||
                            (cName && itemName && cName === itemName) ||
                            (cName && itemU && cName === itemU)
                          );
                        }) ? (
                        <TouchableOpacity
                          onPress={() => {
                            setShowFriendsModal(false);
                            router.push({
                              pathname: "/chat",
                              params: {
                                username:
                                  item.username ||
                                  item.name,
                                name:
                                  item.name ||
                                  item.username,
                                image:
                                  item.profile_image ||
                                  "",
                              },
                            });
                          }}
                          className="bg-[#25D366] px-[14px] py-[8px] rounded-[15px] flex-row items-center"
                        >
                          <Ionicons
                            name="chatbubble-ellipses"
                            size={14}
                            color="#fff"
                            style={{ marginRight: 4 }}
                          />
                          <Text className="text-white font-bold text-[13px]">
                            Message
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          onPress={() =>
                            handleConnectUser(item)
                          }
                          style={{ backgroundColor: theme.primary }}
                          className="px-[16px] py-[8px] rounded-[15px]"
                        >
                          <Text className="text-white font-bold text-[13px]">
                            Connect
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                />
              )}
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
}