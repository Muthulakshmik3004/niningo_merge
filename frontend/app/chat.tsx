import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
    Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

import { getUsername } from "../services/session";
import {
    fetchChatMessages,
    sendChatMessage,
    ChatMessageItem,
} from "../services/api";
import { useTheme } from "../constants/ThemeContext";

export default function ChatScreen() {
    const { theme } = useTheme();
    const params = useLocalSearchParams<{
        username?: string;
        name?: string;
        image?: string;
    }>();

    const friendUsername = params.username || "";
    const friendName = params.name || friendUsername || "Friend";
    const friendImage = params.image || "";

    const [currentUsername, setCurrentUsername] = useState<string>("");
    const [messages, setMessages] = useState<ChatMessageItem[]>([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    const flatListRef = useRef<FlatList>(null);

    // 1. Load current user identity
    useEffect(() => {
        async function initUser() {
            const uname = await getUsername();
            if (uname) {
                setCurrentUsername(uname);
            } else {
                Alert.alert("Login Required", "Please log in to start chatting.");
                router.back();
            }
        }
        initUser();
    }, []);

    // 2. Fetch messages & setup 2-second polling for local testing
    useEffect(() => {
        if (!currentUsername || !friendUsername) return;

        let isMounted = true;

        // Reset chat state when switching to a different friend
        setMessages([]);
        setLoading(true);

        async function loadMessages(showLoading = false) {
            if (showLoading) setLoading(true);
            try {
                const res = await fetchChatMessages(currentUsername, friendUsername);
                if (isMounted && res.success) {
                    setMessages(res.messages || []);
                }
            } catch (err) {
                console.error("Fetch chat messages error:", err);
            } finally {
                if (showLoading && isMounted) setLoading(false);
            }
        }

        // Initial load
        loadMessages(true);

        // Poll every 2 seconds
        const intervalId = setInterval(() => {
            loadMessages(false);
        }, 2000);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, [currentUsername, friendUsername]);

    // 3. Send Message
    const handleSend = async () => {
        const trimmed = text.trim();
        if (!trimmed || !currentUsername || !friendUsername || sending) return;

        const tempId = `temp_${Date.now()}`;
        const newMsg: ChatMessageItem = {
            id: tempId,
            sender_username: currentUsername,
            receiver_username: friendUsername,
            text: trimmed,
            created_at: new Date().toISOString(),
        };

        // Optimistic UI update
        setMessages((prev) => [...prev, newMsg]);
        setText("");
        setSending(true);

        try {
            const res = await sendChatMessage({
                sender_username: currentUsername,
                receiver_username: friendUsername,
                text: trimmed,
            });
            if (!res.success) {
                Alert.alert("Error", res.error || "Could not send message.");
                // Remove failed message
                setMessages((prev) => prev.filter((m) => m.id !== tempId));
            } else {
                // Replace optimistic temp item with actual server item
                setMessages((prev) =>
                    prev.map((m) => (m.id === tempId ? res.message : m))
                );
            }
        } catch (err: any) {
            console.error("Send message error:", err);
            setMessages((prev) => prev.filter((m) => m.id !== tempId));
            Alert.alert("Error", "Could not send message. Please try again.");
        } finally {
            setSending(false);
        }
    };

    const formatTime = (isoString: string) => {
        if (!isoString) return "";
        try {
            const date = new Date(isoString);
            return date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return "";
        }
    };

    return (
        <SafeAreaView
            style={{ flex: 1, backgroundColor: theme.gradient[0] }}
            edges={["top", "left", "right", "bottom"]}
        >
            <LinearGradient colors={theme.gradient} style={{ flex: 1 }}>
                {/* ── HEADER ── */}
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        backgroundColor: "#ffffffcc",
                        borderBottomWidth: 1,
                        borderBottomColor: theme.primary + "30",
                    }}
                >
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={{ padding: 4, marginRight: 10 }}
                    >
                        <Ionicons name="arrow-back" size={24} color={theme.primary} />
                    </TouchableOpacity>

                    {/* Friend Avatar */}
                    <View style={{ position: "relative" }}>
                        {friendImage ? (
                            <Image
                                source={{ uri: friendImage }}
                                style={{ width: 42, height: 42, borderRadius: 21 }}
                            />
                        ) : (
                            <View
                                style={{
                                    width: 42,
                                    height: 42,
                                    borderRadius: 21,
                                    backgroundColor: theme.primary + "20",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <FontAwesome name="user" size={20} color={theme.primary} />
                            </View>
                        )}
                        <View
                            style={{
                                width: 10,
                                height: 10,
                                borderRadius: 5,
                                backgroundColor: "#25D366",
                                position: "absolute",
                                bottom: 0,
                                right: 0,
                                borderWidth: 2,
                                borderColor: "#fff",
                            }}
                        />
                    </View>

                    {/* Friend Name & Username */}
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text
                            style={{ fontSize: 17, fontWeight: "bold", color: "#222" }}
                            numberOfLines={1}
                        >
                            {friendName}
                        </Text>
                        <Text style={{ fontSize: 12, color: "#25D366", fontWeight: "600" }}>
                            @{friendUsername} • online
                        </Text>
                    </View>
                </View>

                {/* ── MESSAGES LIST ── */}
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
                >
                    {loading ? (
                        <View
                            style={{
                                flex: 1,
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <ActivityIndicator size="large" color={theme.primary} />
                            <Text
                                style={{
                                    marginTop: 12,
                                    color: theme.primary,
                                    fontWeight: "600",
                                    fontSize: 14,
                                }}
                            >
                                Loading messages...
                            </Text>
                        </View>
                    ) : messages.length === 0 ? (
                        <View
                            style={{
                                flex: 1,
                                justifyContent: "center",
                                alignItems: "center",
                                paddingHorizontal: 40,
                            }}
                        >
                            <View
                                style={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: 40,
                                    backgroundColor: theme.primary + "20",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    marginBottom: 16,
                                }}
                            >
                                <Ionicons
                                    name="chatbubbles-outline"
                                    size={40}
                                    color={theme.primary}
                                />
                            </View>
                            <Text
                                style={{
                                    fontSize: 18,
                                    fontWeight: "bold",
                                    color: "#333",
                                    textAlign: "center",
                                }}
                            >
                                Say Hello to {friendName}! 👋
                            </Text>
                            <Text
                                style={{
                                    fontSize: 13,
                                    color: "#888",
                                    textAlign: "center",
                                    marginTop: 6,
                                    lineHeight: 18,
                                }}
                            >
                                Send your first message below to start your conversation.
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            ref={flatListRef}
                            data={messages}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={{
                                paddingHorizontal: 16,
                                paddingVertical: 16,
                            }}
                            onContentSizeChange={() =>
                                flatListRef.current?.scrollToEnd({ animated: true })
                            }
                            onLayout={() => 
                                flatListRef.current?.scrollToEnd({ animated: false })
                            }
                            renderItem={({ item }) => {
                                const isMe =
                                    (item.sender_username || "").trim().toLowerCase() ===
                                    (currentUsername || "").trim().toLowerCase();
                                return (
                                    <View
                                        style={{
                                            alignSelf: isMe ? "flex-end" : "flex-start",
                                            maxWidth: "78%",
                                            marginBottom: 12,
                                        }}
                                    >
                                        <View
                                            style={{
                                                backgroundColor: isMe ? theme.primary : "#FFFFFF",
                                                paddingHorizontal: 16,
                                                paddingVertical: 10,
                                                borderRadius: 20,
                                                borderBottomRightRadius: isMe ? 4 : 20,
                                                borderBottomLeftRadius: isMe ? 20 : 4,
                                                borderWidth: isMe ? 0 : 1,
                                                borderColor: theme.primary + "30",
                                                shadowColor: "#000",
                                                shadowOpacity: 0.05,
                                                shadowRadius: 4,
                                                shadowOffset: { width: 0, height: 2 },
                                                elevation: 2,
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    fontSize: 15,
                                                    color: isMe ? "#FFFFFF" : "#222222",
                                                    lineHeight: 21,
                                                }}
                                            >
                                                {item.text}
                                            </Text>
                                            <Text
                                                style={{
                                                    fontSize: 10,
                                                    color: isMe ? "#FFFFFFCC" : "#999999",
                                                    alignSelf: "flex-end",
                                                    marginTop: 4,
                                                }}
                                            >
                                                {formatTime(item.created_at)}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            }}
                        />
                    )}

                    {/* ── INPUT BAR ── */}
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            paddingHorizontal: 14,
                            paddingVertical: 10,
                            backgroundColor: "#ffffff",
                            borderTopWidth: 1,
                            borderTopColor: theme.primary + "30",
                        }}
                    >
                        <TextInput
                            value={text}
                            onChangeText={setText}
                            placeholder={`Message ${friendName}...`}
                            placeholderTextColor="#999"
                            multiline
                            style={{
                                flex: 1,
                                backgroundColor: theme.gradient[0] + "25",
                                borderRadius: 24,
                                paddingHorizontal: 18,
                                paddingVertical: 10,
                                fontSize: 15,
                                color: "#222",
                                maxHeight: 100,
                                borderWidth: 1,
                                borderColor: theme.primary + "30",
                            }}
                        />

                        <TouchableOpacity
                            onPress={handleSend}
                            disabled={!text.trim() || sending}
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: 22,
                                backgroundColor: text.trim() ? theme.primary : theme.primary + "50",
                                justifyContent: "center",
                                alignItems: "center",
                                marginLeft: 10,
                            }}
                        >
                            <Ionicons
                                name="send"
                                size={20}
                                color="#fff"
                                style={{ marginLeft: 2 }}
                            />
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </LinearGradient>
        </SafeAreaView>
    );
}
