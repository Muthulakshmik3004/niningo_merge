import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../constants/ThemeContext";


// ============================================================
// SUCCESS PAGE
// ============================================================

export default function ScratchSuccessScreen() {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.gradient[0] }} edges={["top", "left", "right", "bottom"]}>
      <LinearGradient colors={theme.gradient} style={{ flex: 1 }}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />

        <View style={{ flex: 1 }}>

          {/* ==================================================
            BACK BUTTON
        ================================================== */}

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons
              name="arrow-back"
              size={32}
              color={theme.primary}
            />
          </TouchableOpacity>

          {/* ==================================================
            CONTENT
        ================================================== */}

          <View style={styles.content}>

            {/* ==================================================
              GREEN CHECK
          ================================================== */}

            <View style={styles.successCircle}>
              <Ionicons
                name="checkmark"
                size={70}
                color="#FFFFFF"
              />
            </View>

            {/* ==================================================
              TITLE
          ================================================== */}

            <Text style={[styles.title, { color: theme.primary }]}>
              Task Completed!
            </Text>

            {/* ==================================================
              GREETING
          ================================================== */}

            <Text style={[styles.greeting, { color: "#333333" }]}>
              Great Job, Arisu! 🎉
            </Text>

            {/* ==================================================
              COUPON MESSAGE
          ================================================== */}

            <Text style={[styles.earnedText, { color: "#555555" }]}>
              You earned a coupon
            </Text>

            {/* ==================================================
              COUPON CARD
          ================================================== */}

            <View style={[styles.couponCard, { backgroundColor: theme.primary }]}>

              {/* Background */}
              <View
                style={[styles.couponBackground, { backgroundColor: theme.primary }]}
              />

              {/* Soft circles */}
              <View
                style={[styles.circleOne, { backgroundColor: "#FFFFFF", opacity: 0.2 }]}
              />

              <View
                style={[styles.circleTwo, { backgroundColor: "#FFFFFF", opacity: 0.2 }]}
              />

              {/* Pattern squares */}
              <View style={styles.pattern}>
                {Array.from({
                  length: 30,
                }).map((_, index) => {
                  const positions = [
                    [12, 20],
                    [35, 16],
                    [58, 25],
                    [82, 15],
                    [110, 25],
                    [137, 17],
                    [18, 43],
                    [45, 38],
                    [72, 48],
                    [103, 42],
                    [128, 51],
                    [12, 69],
                    [38, 62],
                    [63, 72],
                    [91, 66],
                    [118, 75],
                    [145, 66],
                    [20, 94],
                    [48, 88],
                    [76, 99],
                    [105, 92],
                    [134, 101],
                    [12, 119],
                    [39, 112],
                    [67, 124],
                    [96, 116],
                    [124, 127],
                    [146, 116],
                    [35, 145],
                    [86, 143],
                  ];

                  const [left, top] = positions[index];

                  return (
                    <View
                      key={index}
                      style={[
                        styles.patternSquare,
                        {
                          left,
                          top,
                          backgroundColor: "#FFFFFF",
                          opacity: 0.3,
                        },
                      ]}
                    />
                  );
                })}
              </View>

              {/* Gift */}
              <View style={styles.gift}>
                <Ionicons
                  name="gift"
                  size={75}
                  color="#FFFFFF"
                />
              </View>

            </View>

            {/* ==================================================
              SCRATCH NOW
          ================================================== */}

            <TouchableOpacity
              style={[styles.scratchButton, { backgroundColor: theme.primary }]}
              onPress={() =>
                router.push("/reward-result")
              }
              activeOpacity={0.85}
            >
              <Text style={styles.buttonText}>
                Scratch Now
              </Text>
            </TouchableOpacity>

            {/* ==================================================
              VIEW COUPONS
          ================================================== */}

            <TouchableOpacity
              style={[styles.viewButton, { backgroundColor: theme.primary }]}
              onPress={() =>
                router.replace("/rewards")
              }
              activeOpacity={0.85}
            >
              <Text style={styles.buttonText}>
                View Coupons
              </Text>
            </TouchableOpacity>

          </View>

        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}


// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({

  // ==========================================================
  // SCREEN
  // ==========================================================

  safeArea: {
    flex: 1,

    backgroundColor: "#C0005B",
  },

  container: {
    flex: 1,

    backgroundColor: "#C0005B",
  },


  // ==========================================================
  // BACK
  // ==========================================================

  backButton: {
    position: "absolute",

    left: 20,

    top: 20,

    width: 50,

    height: 50,

    alignItems: "center",

    justifyContent: "center",

    zIndex: 20,
  },


  // ==========================================================
  // CONTENT
  // ==========================================================

  content: {
    flex: 1,

    alignItems: "center",

    paddingTop: 78,
  },


  // ==========================================================
  // CHECK CIRCLE
  // ==========================================================

  successCircle: {
    width: 100,

    height: 100,

    borderRadius: 50,

    backgroundColor: "#00B91F",

    alignItems: "center",

    justifyContent: "center",

    marginBottom: 23,
  },


  // ==========================================================
  // TITLE
  // ==========================================================

  title: {
    fontSize: 27,

    fontWeight: "800",

    color: "#FFFFFF",

    textAlign: "center",
  },


  // ==========================================================
  // GREETING
  // ==========================================================

  greeting: {
    fontSize: 24,

    fontWeight: "400",

    color: "#FFFFFF",

    marginTop: 7,

    textAlign: "center",
  },


  // ==========================================================
  // EARNED
  // ==========================================================

  earnedText: {
    fontSize: 20,

    fontWeight: "500",

    color: "#FFFFFF",

    marginTop: 48,

    marginBottom: 20,

    textAlign: "center",
  },


  // ==========================================================
  // COUPON
  // ==========================================================

  couponCard: {
    width: 172,

    height: 172,

    borderRadius: 10,

    overflow: "hidden",

    position: "relative",

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: "#C85B89",
  },

  couponBackground: {
    position: "absolute",

    left: 0,
    right: 0,
    top: 0,
    bottom: 0,

    backgroundColor: "#C95B8B",
  },

  circleOne: {
    position: "absolute",

    width: 160,

    height: 160,

    borderRadius: 80,

    backgroundColor: "#E177A4",

    left: -48,

    top: -40,

    opacity: 0.45,
  },

  circleTwo: {
    position: "absolute",

    width: 130,

    height: 130,

    borderRadius: 65,

    backgroundColor: "#E684AD",

    right: -45,

    bottom: -40,

    opacity: 0.35,
  },


  // ==========================================================
  // PATTERN
  // ==========================================================

  pattern: {
    position: "absolute",

    left: 0,
    top: 0,

    width: 172,

    height: 172,
  },

  patternSquare: {
    position: "absolute",

    width: 6,

    height: 6,

    backgroundColor: "#D43E78",

    opacity: 0.5,
  },


  // ==========================================================
  // GIFT
  // ==========================================================

  gift: {
    width: 110,

    height: 110,

    alignItems: "center",

    justifyContent: "center",

    zIndex: 10,
  },


  // ==========================================================
  // BUTTONS
  // ==========================================================

  scratchButton: {
    width: 145,

    height: 45,

    borderRadius: 14,

    backgroundColor: "#FF4D91",

    alignItems: "center",

    justifyContent: "center",

    marginTop: 37,
  },

  viewButton: {
    width: 162,

    height: 45,

    borderRadius: 14,

    backgroundColor: "#FF4D91",

    alignItems: "center",

    justifyContent: "center",

    marginTop: 19,
  },

  buttonText: {
    fontSize: 19,

    fontWeight: "700",

    color: "#FFFFFF",
  },

});