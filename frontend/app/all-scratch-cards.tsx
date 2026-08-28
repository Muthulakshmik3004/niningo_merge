import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import BottomFooter from "../components/BottomFooter";
import { useTheme } from "../constants/ThemeContext";

const ScratchCardItem = React.memo(function ScratchCardItem({
  size,
  theme,
}: {
  size: number;
  theme: any;
}) {
  const center = size / 2;

  const rings = [
    { radius: size * 0.22, count: 5, squareSize: 3 },
    { radius: size * 0.40, count: 7, squareSize: 4 },
  ];

  const squares: React.ReactNode[] = [];

  rings.forEach((ring, ringIndex) => {
    for (let i = 0; i < ring.count; i++) {
      const angle = (i / ring.count) * Math.PI * 2 + ringIndex * 0.2;
      const x = center + Math.cos(angle) * ring.radius;
      const y = center + Math.sin(angle) * ring.radius;

      squares.push(
        <View
          key={`${ringIndex}-${i}`}
          style={{
            position: "absolute",
            left: x - ring.squareSize / 2,
            top: y - ring.squareSize / 2,
            width: ring.squareSize,
            height: ring.squareSize,
            backgroundColor: "#FFFFFF",
            opacity: 0.4 + ringIndex * 0.08,
            transform: [{ rotate: `${(i * 17) % 45}deg` }],
          }}
        />
      );
    }
  });

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: 22,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Background */}
      <View
        style={{
          width: size,
          height: size,
          backgroundColor: theme.primary,
        }}
      />

      {/* Halftone concentric circles */}
      <View
        style={{
          position: "absolute",
          width: size * 0.88,
          height: size * 0.88,
          borderRadius: size * 0.44,
          left: size * 0.06,
          top: size * 0.06,
          backgroundColor: "#FFFFFF",
          opacity: 0.2,
        }}
      />
      <View
        style={{
          position: "absolute",
          width: size * 0.68,
          height: size * 0.68,
          borderRadius: size * 0.34,
          left: size * 0.16,
          top: size * 0.16,
          backgroundColor: "#FFFFFF",
          opacity: 0.25,
        }}
      />
      <View
        style={{
          position: "absolute",
          width: size * 0.45,
          height: size * 0.45,
          borderRadius: size * 0.225,
          left: size * 0.275,
          top: size * 0.275,
          backgroundColor: "#FFFFFF",
          opacity: 0.3,
        }}
      />

      {/* Squares */}
      <View
        style={{
          position: "absolute",
          width: size,
          height: size,
        }}
        pointerEvents="none"
      >
        {squares}
      </View>

      {/* Small Dots */}
      {[
        [0.10, 0.09],
        [0.86, 0.15],
        [0.08, 0.48],
        [0.88, 0.52],
        [0.20, 0.82],
        [0.76, 0.82],
      ].map(([x, y], idx) => (
        <View
          key={idx}
          style={{
            position: "absolute",
            width: 4,
            height: 4,
            borderRadius: 2,
            left: size * x,
            top: size * y,
            backgroundColor: "#FFFFFF",
            opacity: 0.6,
          }}
        />
      ))}

      {/* Gift Icon */}
      <View
        style={{
          position: "absolute",
          width: size * 0.55,
          height: size * 0.55,
          left: size * 0.225,
          top: size * 0.225,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Ionicons name="gift" size={size * 0.4} color="#FFFFFF" />
      </View>
    </View>
  );
});

export default function AllScratchCardsScreen() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const cardSize = (width - 52 - 20) / 2;

  const availableCards = [1, 2, 3, 4, 5, 6];

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.gradient[0] }}
      edges={["top", "left", "right", "bottom"]}
    >
      <LinearGradient colors={theme.gradient} style={{ flex: 1 }}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />

        <View style={{ flex: 1 }}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={26} color={theme.primary} />
            </TouchableOpacity>

            <Text style={[styles.headerTitle, { color: theme.primary }]}>
              Scratch Card
            </Text>
          </View>

          {/* Cards Grid */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.cardsContainer}>
              {availableCards.map((cardId) => (
                <TouchableOpacity
                  key={cardId}
                  style={[
                    styles.scratchCardWrapper,
                    {
                      width: cardSize,
                      height: cardSize,
                    },
                  ]}
                  onPress={() => router.push("/scratch-success")}
                  activeOpacity={0.88}
                >
                  <ScratchCardItem size={cardSize} theme={theme} />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Bottom Navigation Footer */}
          <BottomFooter activeTab="rewards" />
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  scrollContent: {
    paddingHorizontal: 26,
    paddingTop: 10,
    paddingBottom: 30,
  },
  cardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 20,
  },
  scratchCardWrapper: {
    borderRadius: 22,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
});
