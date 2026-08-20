import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const dailyLogs = [
  {
    title: "I Woke up early today",
    image: require("../assets/images/earlywalkup.jpg"),
  },
  {
    title: "I Stayed Hydrated",
    image: require("../assets/images/hydrations.jpg"),
  },
  {
    title: "I focus on my studies",
    image: require("../assets/images/study-work.jpg"),
  },
  {
    title: "Sleep on Time",
    image: require("../assets/images/sleep-on-time.jpg"),
  },
  {
    title: "Stay Active",
    image: require("../assets/images/physical-activity.webp"),
  },
];

export default function Day2() {
  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* Background Stars */}
        <Text style={[styles.star, styles.star1]}>☆</Text>
        <Text style={[styles.star, styles.star2]}>☆</Text>
        <Text style={[styles.star, styles.star3]}>☆</Text>
        <Text style={[styles.star, styles.star4]}>☆</Text>
        <Text style={[styles.star, styles.star5]}>☆</Text>
        <Text style={[styles.star, styles.star6]}>☆</Text>
        <Text style={[styles.star, styles.star7]}>☆</Text>
        <Text style={[styles.star, styles.star8]}>☆</Text>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={28}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Day 2</Text>
        </View>

        {/* Fire Streak */}
        <View style={styles.streakContainer}>
          <View style={styles.fireRow}>
            <Text style={styles.fire}>🔥</Text>
            <Text style={styles.fire}>🔥</Text>
            <Text style={styles.fire}>🔥</Text>
            <Text style={styles.fire}>🔥</Text>
            <Text style={styles.fire}>🔥</Text>
          </View>

          <Text style={styles.progressText}>
            "You Crushed It"
          </Text>

          <Text style={styles.dateText}>
            Apr 14, 2026
          </Text>
        </View>

        {/* Daily Logs */}
        <Text style={styles.dailyLogsTitle}>
          Daily Logs
        </Text>

        {/* Logs Grid */}
        <View style={styles.logsGrid}>
          {dailyLogs.map((log, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.logItem,
                index === 4 && styles.lastItem,
              ]}
              activeOpacity={0.9}
            >
              <Image
                source={log.image}
                style={styles.logImage}
              />

              <Text style={styles.logTitle}>
                {log.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFD84D",
  },

  scrollContent: {
    paddingBottom: 30,
    position: "relative",
  },

  /* Background Stars */

  star: {
    position: "absolute",
    fontSize: 110,
    color: "#F2C83D",
    opacity: 0.55,
    fontWeight: "300",
  },

  star1: {
    top: 45,
    left: 5,
  },

  star2: {
    top: 30,
    right: -8,
  },

  star3: {
    top: 185,
    left: 35,
  },

  star4: {
    top: 165,
    right: -10,
  },

  star5: {
    top: 360,
    left: -25,
  },

  star6: {
    top: 390,
    right: -18,
  },

  star7: {
    top: 555,
    left: 20,
  },

  star8: {
    top: 620,
    right: -15,
  },

  /* Header */

  header: {
    height: 65,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    zIndex: 2,
  },

  backButton: {
    padding: 4,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    marginLeft: 5,
  },

  /* Streak */

  streakContainer: {
    alignItems: "center",
    marginTop: 25,
    zIndex: 2,
  },

  fireRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  fire: {
    fontSize: 31,
    marginHorizontal: 4,
  },

  progressText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#B76A00",
    marginTop: 12,
  },

  dateText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#B76A00",
    marginTop: 5,
  },

  /* Daily Logs */

  dailyLogsTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#E87800",
    marginTop: 32,
    marginLeft: 16,
    marginBottom: 25,
    zIndex: 2,
  },

  /* Grid */

  logsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 17,
    zIndex: 2,
  },

  logItem: {
    width: "46%",
    marginBottom: 26,
    alignItems: "center",
  },

  lastItem: {
    width: "46%",
    marginLeft: "27%",
  },

  logImage: {
    width: 122,
    height: 140,
    borderRadius: 28,
    resizeMode: "cover",
  },

  logTitle: {
    width: 150,
    fontSize: 12,
    fontWeight: "800",
    color: "#A96400",
    textAlign: "center",
    marginTop: 8,
  },
});