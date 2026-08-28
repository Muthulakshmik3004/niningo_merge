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
import { useTheme } from "../constants/ThemeContext";

import BACKEND_URL from "../config";
import { getUsername } from "../services/session";
import { createContact, fetchContacts } from "../services/api";

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
    const { theme } = useTheme();
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

            await loadExistingContacts();

            const { status: existingStatus } = await Contacts.getPermissionsAsync();
            let status = existingStatus;

            if (status !== "granted") {
                const { status: requestedStatus } =
                    await Contacts.requestPermissionsAsync();
                status = requestedStatus;
            }

            if (status !== "granted") {
                Alert.alert(
                    "Contacts Permission",
                    "Please allow contacts permission in your phone Settings to find friends on Niningo."
                );
                return;
            }

            const fields = Contacts.Fields
                ? [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers]
                : undefined;

            const { data } = await Contacts.getContactsAsync({ fields });

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
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.gradient[0] }}>
            <LinearGradient
                colors={theme.gradient}
                style={{ flex: 1 }}
            >
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
                        <Ionicons name="arrow-back" size={26} color={theme.primary} />
                    </TouchableOpacity>
                    <Text
                        style={{ fontSize: 24, fontWeight: "bold", color: theme.primary, flex: 1 }}
                    >
                        Find Friends
                    </Text>
                </View>

                <View style={{ flex: 1, paddingHorizontal: 20 }}>
                    {!searched && !loading && (
                        <View style={{ alignItems: "center", marginTop: 60, marginBottom: 40 }}>
                            <View
                                style={{
                                    width: 120,
                                    height: 120,
                                    borderRadius: 60,
                                    backgroundColor: theme.primary + "20",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    marginBottom: 24,
                                }}
                            >
                                <Ionicons name="people" size={60} color={theme.primary} />
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

                    {loading && (
                        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                            <ActivityIndicator size="large" color={theme.primary} />
                            <Text style={{ marginTop: 16, color: theme.primary, fontWeight: "600", fontSize: 15 }}>
                                Finding your friends on Niningo...
                            </Text>
                        </View>
                    )}

                    {searched && !loading && (
                        <>
                            <Text
                                style={{
                                    fontSize: 15,
                                    color: theme.primary,
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
                                    <Ionicons name="person-add-outline" size={60} color={theme.primary} />
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
                                                borderColor: theme.primary + "40",
                                                shadowColor: theme.primary,
                                                shadowOpacity: 0.1,
                                                shadowOffset: { width: 0, height: 4 },
                                                shadowRadius: 8,
                                                elevation: 3,
                                            }}
                                        >
                                            <View
                                                style={{
                                                    width: 50,
                                                    height: 50,
                                                    borderRadius: 25,
                                                    backgroundColor: theme.primary + "20",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <FontAwesome name="user" size={24} color={theme.primary} />
                                            </View>

                                            <View style={{ flex: 1, marginLeft: 14 }}>
                                                <Text style={{ fontSize: 17, fontWeight: "bold", color: "#222" }}>
                                                    {item.name || "Niningo User"}
                                                </Text>
                                                <Text style={{ fontSize: 13, color: theme.primary, marginTop: 2 }}>
                                                    {item.username ? `@${item.username}` : item.phone_number}
                                                </Text>
                                            </View>

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
                                                        backgroundColor: theme.primary,
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

                {!loading && (
                    <View style={{ paddingHorizontal: 20, paddingBottom: 30, paddingTop: 10 }}>
                        <TouchableOpacity onPress={findFriends} activeOpacity={0.85}>
                            <View
                                style={{
                                    height: 56,
                                    borderRadius: 18,
                                    backgroundColor: theme.primary,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    flexDirection: "row",
                                }}
                            >
                                <Ionicons name="people" size={22} color="#fff" style={{ marginRight: 10 }} />
                                <Text style={{ fontSize: 17, fontWeight: "bold", color: "#fff" }}>
                                    {searched ? "Scan Again" : "Find Friends from Contacts"}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                )}
            </LinearGradient>
        </SafeAreaView>
    );
}
