import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Zocial, FontAwesome } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import BACKEND_URL from "../config";

let Contacts: any = null;
try {
  Contacts = require("expo-contacts");
} catch (err) {
  console.warn("expo-contacts native module is not available in current environment", err);
}

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

interface RegisteredContact {
  name: string;
  username: string;
  phone_number: string;
}

export default function TaskScreen() {
  const [selected, setSelected] = useState("All");
  const [search, setSearch] = useState("");
  const [contacts, setContacts] = useState<RegisteredContact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [registeredContacts, setRegisteredContacts] = useState<RegisteredContact[]>([]);

  // ── Auto-load matched contacts when screen mounts ──
  useEffect(() => {
    loadMatchedContacts();
  }, []);

  const loadMatchedContacts = async () => {
    try {
      if (!Contacts || typeof Contacts.getPermissionsAsync !== "function") {
        // In standard Expo Go — skip silently, show empty list
        return;
      }

      setLoadingContacts(true);

      // Check permission first (don't ask yet)
      const { status: existingStatus } = await Contacts.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (finalStatus !== "granted") {
        const { status: requested } = await Contacts.requestPermissionsAsync();
        finalStatus = requested;
      }

      if (finalStatus !== "granted") return;

      const { data } = await Contacts.getContactsAsync({
        fields: Contacts.Fields
          ? [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers]
          : undefined,
      });

      const phoneNumbers: string[] = [];
      (data || []).forEach((c: any) => {
        (c.phoneNumbers || []).forEach((p: any) => {
          if (p.number) phoneNumbers.push(p.number);
        });
      });

      if (phoneNumbers.length === 0) return;

      const response = await fetch(`${BACKEND_URL}/app/contacts/match/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_numbers: phoneNumbers }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setContacts(result.friends || []);
      }
    } catch (err) {
      console.error("Auto-load contacts error:", err);
    } finally {
      setLoadingContacts(false);
    }
  };

  const handleFindFriends = async () => {
    try {
      if (!Contacts || typeof Contacts.requestPermissionsAsync !== "function") {
        Alert.alert(
          "Feature Notice",
          "Expo Contacts native module is not supported in standard Expo Go app. To use full live device contacts sync, run an Expo development build."
        );
        return;
      }

      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Contacts permission is required to find friends registered on Niningo."
        );
        return;
      }

      setFriendsLoading(true);
      setShowFriendsModal(true);

      const fieldsToGet = Contacts.Fields
        ? [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers]
        : undefined;

      const { data } = await Contacts.getContactsAsync({
        fields: fieldsToGet,
      });

      const extractedNumbers: string[] = [];
      if (data && data.length > 0) {
        data.forEach((c: any) => {
          if (c.phoneNumbers) {
            c.phoneNumbers.forEach((p: any) => {
              if (p.number) {
                extractedNumbers.push(p.number);
              }
            });
          }
        });
      }

      if (extractedNumbers.length === 0) {
        setRegisteredContacts([]);
        setFriendsLoading(false);
        return;
      }

      const response = await fetch(`${BACKEND_URL}/app/match-contacts/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_numbers: extractedNumbers,
        }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setRegisteredContacts(result.contacts || []);
      } else {
        Alert.alert("Error", result.error || "Could not match contacts.");
      }
    } catch (err: any) {
      console.error("Contacts matching error:", err);
      Alert.alert("Error", "An error occurred while loading contacts.");
    } finally {
      setFriendsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["left", "right", "bottom"]}>
      <LinearGradient
        colors={["#FFD7F8", "#FFF7FD"]}
        style={{ flex: 1, paddingTop: 38, paddingHorizontal: 15 }}
      >
        {/* Header */}
        <View className="flex-row justify-between items-center mb-[15px]">
          <Text className="text-[34px] font-bold text-[#B84CE8]">
            Task
          </Text>

          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={handleFindFriends}
              className="bg-[#F1C2F7] border border-[#B37BD8] px-[12px] py-[6px] rounded-[18px] flex-row items-center"
            >
              <Ionicons name="people" size={18} color="#7A2BE2" />
              <Text className="ml-[6px] text-[13px] font-bold text-[#7A2BE2]">
                Find Friends
              </Text>
            </TouchableOpacity>

            <View className="items-center">
              <Text className="text-[24px]">❤️‍🔥</Text>
              <Text className="text-[13px] font-bold text-[#FF7B00]">
                26 Days
              </Text>
            </View>
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
              className={`px-[18px] py-[7px] rounded-[18px] border border-[#B37BD8] ${selected === item ? "bg-[#F1C2F7]" : "bg-[#FFF]"
                }`}
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
        {loadingContacts ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", marginTop: 40 }}>
            <ActivityIndicator size="large" color="#B84CE8" />
            <Text style={{ marginTop: 12, color: "#7A2BE2", fontWeight: "600" }}>
              Finding your friends on Niningo...
            </Text>
          </View>
        ) : contacts.length === 0 ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 30 }}>
            <Ionicons name="people-outline" size={64} color="#D9A0F0" />
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#555", marginTop: 16, textAlign: "center" }}>
              No friends on Niningo yet
            </Text>
            <Text style={{ fontSize: 14, color: "#999", textAlign: "center", marginTop: 8 }}>
              Invite your contacts to join Niningo!
            </Text>
            <TouchableOpacity
              onPress={loadMatchedContacts}
              style={{ marginTop: 20, backgroundColor: "#F1C2F7", paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 }}
            >
              <Text style={{ color: "#7A2BE2", fontWeight: "bold" }}>Refresh</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={contacts.filter((item) =>
              (item.name || item.username || "").toLowerCase().includes(search.toLowerCase())
            )}
            keyExtractor={(item, index) => `${item.phone_number}_${index}`}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity className="flex-row items-center py-[12px]">
                {/* Avatar */}
                <View className="w-[60px] h-[60px] rounded-[30px] bg-[#F1C2F7] justify-center items-center">
                  <FontAwesome name="user" size={28} color="#7A2BE2" />
                </View>

                <View className="flex-1 ml-[12px]">
                  <Text className="text-[22px] font-bold text-[#222]">
                    {item.name || "Niningo User"}
                  </Text>
                  <Text className="text-[15px] text-[#B84CE8] mt-[3px]">
                    {item.username ? `@${item.username}` : item.phone_number}
                  </Text>
                </View>

                <TouchableOpacity
                  className="bg-[#7A2BE2] px-[14px] py-[7px] rounded-[14px]"
                >
                  <Text className="text-white font-bold text-[13px]">Connect</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
        )}

        {/* Floating Add Action Button */}
        <TouchableOpacity
          className="absolute right-[20px] bottom-[80px] w-[60px] h-[60px] rounded-[30px] justify-center items-center"
          style={{ elevation: 8 }}
          onPress={handleFindFriends}
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
            <Ionicons name="document-text-outline" size={28} color="#777" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/status")}>
            <Zocial name="statusnet" size={28} color="#777" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/rewards")}>
            <Ionicons name="gift-outline" size={28} color="#777" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="person-outline" size={28} color="#777" />
          </TouchableOpacity>
        </View>

        {/* Registered Friends Modal */}
        <Modal
          visible={showFriendsModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowFriendsModal(false)}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-[#FFF7FD] rounded-t-[30px] h-[75%] p-[20px]">
              <View className="flex-row justify-between items-center mb-[15px]">
                <View className="flex-row items-center">
                  <Ionicons name="people" size={26} color="#B84CE8" />
                  <Text className="text-[22px] font-bold text-[#111] ml-[10px]">
                    Registered Friends
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setShowFriendsModal(false)}>
                  <Ionicons name="close-circle" size={30} color="#888" />
                </TouchableOpacity>
              </View>

              {friendsLoading ? (
                <View className="flex-1 justify-center items-center">
                  <ActivityIndicator size="large" color="#B84CE8" />
                  <Text className="mt-[12px] text-[#7A2BE2] font-semibold">
                    Matching contacts with Niningo users...
                  </Text>
                </View>
              ) : registeredContacts.length === 0 ? (
                <View className="flex-1 justify-center items-center px-[20px]">
                  <Ionicons name="person-add-outline" size={60} color="#D348F7" />
                  <Text className="text-[18px] font-bold text-[#333] mt-[15px] text-center">
                    No Registered Contacts Found
                  </Text>
                  <Text className="text-[14px] text-[#777] text-center mt-[8px]">
                    None of your phone contacts have signed up on Niningo yet. Invite them to get started!
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={registeredContacts}
                  keyExtractor={(item, index) => `${item.phone_number}_${index}`}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <View className="flex-row items-center bg-white p-[14px] rounded-[20px] mb-[10px] border border-[#F1C2F7]">
                      <View className="w-[50px] h-[50px] rounded-[25px] bg-[#F1C2F7] justify-center items-center">
                        <FontAwesome name="user" size={24} color="#7A2BE2" />
                      </View>

                      <View className="flex-1 ml-[12px]">
                        <Text className="text-[18px] font-bold text-[#222]">
                          {item.name}
                        </Text>
                        <Text className="text-[13px] text-[#B84CE8]">
                          @{item.username || item.phone_number}
                        </Text>
                      </View>

                      <TouchableOpacity className="bg-[#7A2BE2] px-[16px] py-[8px] rounded-[15px]">
                        <Text className="text-white font-bold text-[13px]">
                          Connect
                        </Text>
                      </TouchableOpacity>
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
