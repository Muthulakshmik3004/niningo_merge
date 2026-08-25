import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Alert,
    Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";

import BACKEND_URL from "../config";
import { getUsername } from "../services/session";
import { createContact, fetchContacts } from "../services/api";

// Safely load expo-contacts (not available in standard Expo Go)
let Contacts: any = null;
try {
    Contacts = require("expo-contacts");
} catch {
    console.warn("expo-contacts native module is not available in this environment.");
}

type Friend = {
    name: string;
    phone_number: string;
    username?: string;
    profile_image?: string;
};

export default function FindFriendsScreen() {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [connectedMap, setConnectedMap] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const loadExistingContacts = async () => {
        try {
            const owner = await getUsername();
            if (!owner) return;
            const res = await fetchContacts(owner, "all");
            const map: Record<string, boolean> = {};
            (res.results || []).forEach((c) => {
                if (c.name) map[c.name.toLowerCase()] = true;
            });
            setConnectedMap(map);
        } catch (e) {
            console.warn("Could not load existing contacts:", e);
        }
    };

    const findFriends = async () => {
        // Guard: expo-contacts not available (standard Expo Go)
        if (!Contacts || typeof Contacts.getPermissionsAsync !== "function") {
            Alert.alert(
                "Not Supported",
                "Live contacts matching requires an Expo development build. This feature is not available in standard Expo Go."
            );
            return;
        }

        try {
            setLoading(true);
            setSearched(false);

            // Fetch existing contacts list so we know who is already connected
            await loadExistingContacts();

            // ── 1. CHECK PERMISSION (don't ask again if already granted) ──
            const { status: existingStatus } = await Contacts.getPermissionsAsync();
            let status = existingStatus;

            // ── 2. ASK ONLY IF NOT ALREADY GRANTED ──
            if (status !== "granted") {
                const { status: requestedStatus } =
                    await Contacts.requestPermissionsAsync();
                status = requestedStatus;
            }

            // ── 3. USER DENIED ──
            if (status !== "granted") {
                Alert.alert(
                    "Contacts Permission",
                    "Please allow contacts permission in your phone Settings to find friends on Niningo."
                );
                return;
            }

            // ── 4. READ CONTACTS ──
            const fields = Contacts.Fields
                ? [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers]
                : undefined;

            const { data } = await Contacts.getContactsAsync({ fields });

            // ── 5. EXTRACT PHONE NUMBERS ──
            const phoneNumbers: string[] = [];
            if (data && data.length > 0) {
                data.forEach((contact: any) => {
                    if (contact.phoneNumbers) {
                        contact.phoneNumbers.forEach((p: any) => {
                            if (p.number) phoneNumbers.push(p.number);
                        });
                    }
                });
            }

            if (phoneNumbers.length === 0) {
                Alert.alert("No Contacts", "No phone numbers found in your contacts.");
                return;
            }

            // ── 6. SEND TO DJANGO ──
            const loggedUser = await getUsername();
            const response = await fetch(`${BACKEND_URL}/app/contacts/match/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    phone_numbers: phoneNumbers,
                    username: loggedUser || "",
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                Alert.alert("Error", result.error || "Could not fetch friends.");
                return;
            }

            // ── 7. SHOW RESULTS (EXCLUDE SELF) ──
            const allMatched = result.friends || result.contacts || [];
            const filteredMatched = allMatched.filter(
                (f: any) =>
                    (f.username || "").trim().toLowerCase() !==
                    (loggedUser || "").trim().toLowerCase()
            );
            setFriends(filteredMatched);
            setSearched(true);
        } catch (err: any) {
            console.error("Find friends error:", err);
            Alert.alert("Error", "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async (friend: Friend) => {
        const displayName = friend.name || friend.username || "Niningo User";
        const key = displayName.toLowerCase();

        // Optimistically change button to [Message] immediately
        setConnectedMap((prev) => ({ ...prev, [key]: true }));

        try {
            const owner = await getUsername();
            if (!owner) {
                Alert.alert("Login Required", "Please log in first to connect with friends.");
                setConnectedMap((prev) => ({ ...prev, [key]: false }));
                return;
            }

            await createContact({
                owner_username: owner,
                name: displayName,
                target_username: friend.username || "",
                image: friend.profile_image || "",
                msg: "Connected on Niningo",
                time: "Just now",
            });
        } catch (err: any) {
            console.error("Connect error:", err);
            setConnectedMap((prev) => ({ ...prev, [key]: false }));
            Alert.alert("Error", "Could not connect with user. Please try again.");
        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <LinearGradient
                colors={["#FFD7F8", "#FFF7FD"]}
                style={{ flex: 1 }}
            >
                {/* ── HEADER ── */}
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingHorizontal: 20,
                        paddingTop: 16,
                        paddingBottom: 12,
                    }}
                >
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={{ marginRight: 14 }}
                    >
                        <Ionicons name="arrow-back" size={26} color="#7A2BE2" />
                    </TouchableOpacity>
                    <Text
                        style={{ fontSize: 24, fontWeight: "bold", color: "#B84CE8", flex: 1 }}
                    >
                        Find Friends
                    </Text>
                </View>

                {/* ── BODY ── */}
                <View style={{ flex: 1, paddingHorizontal: 20 }}>
                    {/* Illustration / description */}
                    {!searched && !loading && (
                        <View style={{ alignItems: "center", marginTop: 60, marginBottom: 40 }}>
                            <View
                                style={{
                                    width: 120,
                                    height: 120,
                                    borderRadius: 60,
                                    backgroundColor: "#F1C2F7",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    marginBottom: 24,
                                }}
                            >
                                <Ionicons name="people" size={60} color="#B84CE8" />
                            </View>
                            <Text
                                style={{
                                    fontSize: 20,
                                    fontWeight: "bold",
                                    color: "#222",
                                    textAlign: "center",
                                    marginBottom: 10,
                                }}
                            >
                                Discover people you know
                            </Text>
                            <Text
                                style={{
                                    fontSize: 14,
                                    color: "#666",
                                    textAlign: "center",
                                    lineHeight: 22,
                                    paddingHorizontal: 10,
                                }}
                            >
                                Tap the button below to scan your contacts.{"\n"}
                                We only check who's already on Niningo — your full contact list
                                is never stored.
                            </Text>
                        </View>
                    )}

                    {/* Loading */}
                    {loading && (
                        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                            <ActivityIndicator size="large" color="#B84CE8" />
                            <Text style={{ marginTop: 16, color: "#7A2BE2", fontWeight: "600", fontSize: 15 }}>
                                Finding your friends on Niningo...
                            </Text>
                        </View>
                    )}

                    {/* Results */}
                    {searched && !loading && (
                        <>
                            <Text
                                style={{
                                    fontSize: 15,
                                    color: "#7A2BE2",
                                    fontWeight: "700",
                                    marginBottom: 12,
                                }}
                            >
                                {friends.length > 0
                                    ? `${friends.length} friend${friends.length > 1 ? "s" : ""} found on Niningo 🎉`
                                    : "No friends found on Niningo yet"}
                            </Text>

                            {friends.length === 0 ? (
                                <View style={{ alignItems: "center", marginTop: 30 }}>
                                    <Ionicons name="person-add-outline" size={60} color="#D348F7" />
                                    <Text
                                        style={{
                                            fontSize: 16,
                                            fontWeight: "bold",
                                            color: "#333",
                                            marginTop: 14,
                                            textAlign: "center",
                                        }}
                                    >
                                        None of your contacts are on Niningo yet
                                    </Text>
                                    <Text
                                        style={{
                                            fontSize: 13,
                                            color: "#888",
                                            textAlign: "center",
                                            marginTop: 8,
                                        }}
                                    >
                                        Invite them to join and connect!
                                    </Text>
                                </View>
                            ) : (
                                <FlatList
                                    data={friends}
                                    keyExtractor={(item, index) => `${item.phone_number}_${index}`}
                                    showsVerticalScrollIndicator={false}
                                    renderItem={({ item }) => (
                                        <View
                                            style={{
                                                flexDirection: "row",
                                                alignItems: "center",
                                                backgroundColor: "#fff",
                                                borderRadius: 20,
                                                padding: 14,
                                                marginBottom: 10,
                                                borderWidth: 1,
                                                borderColor: "#F1C2F7",
                                                shadowColor: "#D36AF0",
                                                shadowOpacity: 0.1,
                                                shadowOffset: { width: 0, height: 4 },
                                                shadowRadius: 8,
                                                elevation: 3,
                                            }}
                                        >
                                            {/* Avatar */}
                                            <View
                                                style={{
                                                    width: 50,
                                                    height: 50,
                                                    borderRadius: 25,
                                                    backgroundColor: "#F1C2F7",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <FontAwesome name="user" size={24} color="#7A2BE2" />
                                            </View>

                                            {/* Info */}
                                            <View style={{ flex: 1, marginLeft: 14 }}>
                                                <Text style={{ fontSize: 17, fontWeight: "bold", color: "#222" }}>
                                                    {item.name || "Niningo User"}
                                                </Text>
                                                <Text style={{ fontSize: 13, color: "#B84CE8", marginTop: 2 }}>
                                                    {item.username ? `@${item.username}` : item.phone_number}
                                                </Text>
                                            </View>

                                            {/* Connect / Message Button */}
                                            {connectedMap[(item.name || item.username || "").toLowerCase()] ||
                                                (item.username && connectedMap[item.username.toLowerCase()]) ? (
                                                <TouchableOpacity
                                                    onPress={() => router.push({
                                                        pathname: "/chat",
                                                        params: {
                                                            username: item.username || item.name,
                                                            name: item.name || item.username,
                                                            image: item.profile_image || "",
                                                        }
                                                    })}
                                                    style={{
                                                        backgroundColor: "#25D366",
                                                        paddingHorizontal: 14,
                                                        paddingVertical: 8,
                                                        borderRadius: 15,
                                                        flexDirection: "row",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    <Ionicons name="chatbubble-ellipses" size={14} color="#fff" style={{ marginRight: 5 }} />
                                                    <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 13 }}>
                                                        Message
                                                    </Text>
                                                </TouchableOpacity>
                                            ) : (
                                                <TouchableOpacity
                                                    onPress={() => handleConnect(item)}
                                                    style={{
                                                        backgroundColor: "#7A2BE2",
                                                        paddingHorizontal: 16,
                                                        paddingVertical: 8,
                                                        borderRadius: 15,
                                                    }}
                                                >
                                                    <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 13 }}>
                                                        Connect
                                                    </Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    )}
                                />
                            )}
                        </>
                    )}
                </View>

                {/* ── FIND FRIENDS BUTTON ── */}
                {!loading && (
                    <View style={{ paddingHorizontal: 20, paddingBottom: 30, paddingTop: 10 }}>
                        <TouchableOpacity onPress={findFriends} activeOpacity={0.85}>
                            <LinearGradient
                                colors={["#F553E7", "#7B67FF"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{
                                    height: 56,
                                    borderRadius: 18,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    flexDirection: "row",
                                }}
                            >
                                <Ionicons name="people" size={22} color="#fff" style={{ marginRight: 10 }} />
                                <Text style={{ fontSize: 17, fontWeight: "bold", color: "#fff" }}>
                                    {searched ? "Scan Again" : "Find Friends from Contacts"}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}
            </LinearGradient>
        </SafeAreaView>
    );
}
