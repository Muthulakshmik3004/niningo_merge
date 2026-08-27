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


// ============================================================
// MAIN REWARDS SCREEN
// ============================================================

export default function RewardsScreen() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();

  /*
   * Calculate the scratch-card size according to screen width.
   *
   * 26 px left
   * 26 px right
   * 20 px gap between cards
   *
   * Whatever space is left is divided equally between
   * the two cards.
   */
  const cardSize = (width - 52 - 20) / 2;

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
              HEADER
          ================================================== */}

          <View style={[styles.header, { backgroundColor: "transparent" }]}>
            <Text style={[styles.headerTitle, { color: theme.primary }]}>
              Rewards
            </Text>
          </View>


          {/* ==================================================
              PAGE CONTENT
          ================================================== */}

          <ScrollView
            style={[styles.scrollView, { backgroundColor: "transparent" }]}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >

            {/* ==================================================
                COUPONS / STORES TABS
            ================================================== */}

            <View style={styles.tabsContainer}>

              {/* Coupons */}
              <TouchableOpacity
                style={styles.tab}
                activeOpacity={0.8}
              >
                <Text style={[styles.activeTabText, { color: theme.primary }]}>
                  Coupons
                </Text>

                <View style={[styles.activeTabLine, { backgroundColor: theme.primary }]} />
              </TouchableOpacity>


              {/* Stores */}
              <TouchableOpacity
                style={styles.tab}
                activeOpacity={0.8}
              >
                <Text style={styles.inactiveTabText}>
                  Stores
                </Text>
              </TouchableOpacity>

            </View>


            {/* ==================================================
                COUPON 1
            ================================================== */}

            <TouchableOpacity
              style={[
                styles.couponCard,
                { backgroundColor: theme.primary },
              ]}
              activeOpacity={0.9}
            >

              {/* Decorative large circle */}
              <View style={[styles.couponCirclePink, { backgroundColor: "#FFFFFF", opacity: 0.2 }]} />

              {/* Decorative dots */}
              <View style={[styles.couponDot, styles.couponDotPink1, { backgroundColor: "#FFFFFF", opacity: 0.4 }]} />
              <View style={[styles.couponDot, styles.couponDotPink2, { backgroundColor: "#FFFFFF", opacity: 0.4 }]} />
              <View style={[styles.couponDotSmall, styles.couponDotPink3, { backgroundColor: "#FFFFFF", opacity: 0.4 }]} />


              {/* Left coupon text */}
              <View style={styles.couponLeft}>

                <View style={styles.amountRow}>

                  <Text style={[styles.amountText, { color: "#FFFFFF" }]}>
                    ₹100
                  </Text>

                  <Text style={[styles.offText, { color: "#FFFFFF" }]}>
                    OFF
                  </Text>

                </View>

                <Text style={[styles.couponSubtitle, { color: "#FFFFFF" }]}>
                  for Grocery
                </Text>

              </View>


              {/* Right coupon section */}
              <View style={styles.couponRight}>

                <TouchableOpacity
                  style={[styles.useNowButton, { backgroundColor: "#FFFFFF" }]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.useNowText, { color: theme.primary }]}>
                    Use Now
                  </Text>
                </TouchableOpacity>

                <Text style={[styles.expiryText, { color: "#FFFFFF" }]}>
                  Expires on May 05
                </Text>

              </View>

            </TouchableOpacity>


            {/* ==================================================
                COUPON 2
            ================================================== */}

            <TouchableOpacity
              style={[
                styles.couponCard,
                { backgroundColor: theme.primary + "CC", marginTop: 18 },
              ]}
              activeOpacity={0.9}
            >

              {/* Decorative large circle */}
              <View style={[styles.couponCircleYellow, { backgroundColor: "#FFFFFF", opacity: 0.2 }]} />

              {/* Decorative dots */}
              <View style={[styles.couponDot, styles.couponDotYellow1, { backgroundColor: "#FFFFFF", opacity: 0.4 }]} />
              <View style={[styles.couponDot, styles.couponDotYellow2, { backgroundColor: "#FFFFFF", opacity: 0.4 }]} />
              <View style={[styles.couponDotSmall, styles.couponDotYellow3, { backgroundColor: "#FFFFFF", opacity: 0.4 }]} />


              {/* Left text */}
              <View style={styles.couponLeft}>

                <View style={styles.amountRow}>

                  <Text style={[styles.amountText, { color: "#FFFFFF" }]}>
                    20%
                  </Text>

                  <Text style={[styles.offText, { color: "#FFFFFF" }]}>
                    OFF
                  </Text>

                </View>

                <Text style={[styles.couponSubtitle, { color: "#FFFFFF" }]}>
                  for Bookings
                </Text>

              </View>


              {/* Right section */}
              <View style={styles.couponRight}>

                <TouchableOpacity
                  style={[styles.useNowButton, { backgroundColor: "#FFFFFF" }]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.useNowText, { color: theme.primary }]}>
                    Use Now
                  </Text>
                </TouchableOpacity>

                <Text style={[styles.expiryText, { color: "#FFFFFF" }]}>
                  Expires on May 05
                </Text>

              </View>

            </TouchableOpacity>


            {/* ==================================================
                SCRATCH CARD HEADER
            ================================================== */}

            <View style={styles.scratchHeader}>

              <Text style={[styles.scratchTitle, { color: theme.primary }]}>
                Scratch Card
              </Text>

              <TouchableOpacity
                onPress={() => router.push("/all-scratch-cards")}
                activeOpacity={0.7}
              >
                <Text style={[styles.viewAllText, { color: theme.primary }]}>
                  View all
                </Text>
              </TouchableOpacity>

            </View>


            {/* ==================================================
                SCRATCH CARDS
            ================================================== */}

            <View style={styles.cardsContainer}>

              {[1, 2, 3, 4, 5, 6].map((cardId) => (
                <TouchableOpacity
                  key={cardId}
                  style={[
                    styles.scratchCard,
                    {
                      width: cardSize,
                      height: cardSize,
                      backgroundColor: theme.primary,
                    },
                  ]}
                  onPress={() => router.push("/scratch-success")}
                  activeOpacity={0.9}
                >
                  <ScratchCardDesign size={cardSize} theme={theme} />
                </TouchableOpacity>
              ))}

            </View>


            {/* Extra bottom space */}
            <View style={styles.bottomSpace} />

          </ScrollView>


          {/* ==================================================
              BOTTOM NAVIGATION
          ================================================== */}

          <BottomFooter activeTab="rewards" />

        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}


// ============================================================
// OPTIMIZED SCRATCH CARD DESIGN
// ============================================================

const ScratchCardDesign = React.memo(function ScratchCardDesign({
  size,
  theme,
}: {
  size: number;
  theme: any;
}) {
  const center = size / 2;

  // Light, elegant scattered particles to ensure clean UI
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
      style={[
        styles.cardContent,
        {
          width: size,
          height: size,
        },
      ]}
    >

      {/* ==================================================
          CARD BACKGROUND
      ================================================== */}

      <View
        style={[
          styles.cardBackground,
          {
            width: size,
            height: size,
            backgroundColor: theme.primary,
          },
        ]}
      />


      {/* ==================================================
          SOFT CIRCULAR BACKGROUND
      ================================================== */}

      <View
        style={[
          styles.softCircleOuter,
          {
            width: size * 0.88,
            height: size * 0.88,
            borderRadius: size * 0.44,
            left: size * 0.06,
            top: size * 0.06,
            backgroundColor: "#FFFFFF",
            opacity: 0.2,
          },
        ]}
      />

      <View
        style={[
          styles.softCircleMiddle,
          {
            width: size * 0.68,
            height: size * 0.68,
            borderRadius: size * 0.34,
            left: size * 0.16,
            top: size * 0.16,
            backgroundColor: "#FFFFFF",
            opacity: 0.25,
          },
        ]}
      />

      <View
        style={[
          styles.softCircleInner,
          {
            width: size * 0.45,
            height: size * 0.45,
            borderRadius: size * 0.225,
            left: size * 0.275,
            top: size * 0.275,
            backgroundColor: "#FFFFFF",
            opacity: 0.3,
          },
        ]}
      />


      {/* ==================================================
          MANY SMALL SQUARES
      ================================================== */}

      <View
        style={[
          styles.squarePattern,
          {
            width: size,
            height: size,
          },
        ]}
        pointerEvents="none"
      >
        {squares}
      </View>


      {/* ==================================================
          SMALL DOTS
      ================================================== */}

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
          style={[
            styles.smallDot,
            {
              left: size * x,
              top: size * y,
              backgroundColor: "#FFFFFF",
              opacity: 0.6,
            },
          ]}
        />
      ))}


      {/* ==================================================
          GIFT
      ================================================== */}

      <View
        style={[
          styles.giftContainer,
          {
            width: size * 0.55,
            height: size * 0.55,
            left: size * 0.225,
            top: size * 0.225,
          },
        ]}
      >

        <Ionicons
          name="gift"
          size={size * 0.43}
          color="#FFFFFF"
        />

      </View>

    </View>
  );
});


// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({

  // ==========================================================
  // SCREEN
  // ==========================================================

  safeArea: {
    flex: 1,

    backgroundColor: "#FFF7FB",
  },

  container: {
    flex: 1,

    backgroundColor: "#FFF7FB",
  },


  // ==========================================================
  // HEADER
  // ==========================================================

  header: {
    height: 68,

    backgroundColor: "#F6D5F3",

    justifyContent: "center",

    paddingHorizontal: 21,
  },

  headerTitle: {
    fontSize: 25,

    fontWeight: "700",

    color: "#B63CC4",
  },


  // ==========================================================
  // SCROLL
  // ==========================================================

  scrollView: {
    flex: 1,

    backgroundColor: "#FFF7FB",
  },

  scrollContent: {
    paddingBottom: 25,
  },


  // ==========================================================
  // TABS
  // ==========================================================

  tabsContainer: {
    height: 53,

    backgroundColor: "#FFFFFF",

    flexDirection: "row",

    borderBottomWidth: 1,

    borderBottomColor: "#E5E5E5",
  },

  tab: {
    flex: 1,

    alignItems: "center",

    justifyContent: "center",

    position: "relative",
  },

  activeTabText: {
    fontSize: 20,

    fontWeight: "700",

    color: "#C02291",
  },

  inactiveTabText: {
    fontSize: 20,

    fontWeight: "500",

    color: "#111111",
  },

  activeTabLine: {
    position: "absolute",

    bottom: 0,

    height: 3,

    width: 122,

    backgroundColor: "#C02291",
  },


  // ==========================================================
  // COUPON
  // ==========================================================

  couponCard: {
    height: 101,

    marginHorizontal: 20,

    marginTop: 18,

    borderRadius: 12,

    overflow: "hidden",

    flexDirection: "row",

    alignItems: "center",

    position: "relative",
  },

  pinkCoupon: {
    backgroundColor: "#E890DF",
  },

  yellowCoupon: {
    backgroundColor: "#FFD83D",

    marginTop: 18,
  },


  // ==========================================================
  // COUPON DECORATION
  // ==========================================================

  couponCirclePink: {
    position: "absolute",

    width: 145,

    height: 145,

    borderRadius: 72.5,

    backgroundColor: "#F3B7ED",

    left: -52,

    top: -22,
  },

  couponCircleYellow: {
    position: "absolute",

    width: 145,

    height: 145,

    borderRadius: 72.5,

    backgroundColor: "#FFE997",

    left: -52,

    top: -22,
  },

  couponDot: {
    position: "absolute",

    width: 16,

    height: 16,

    borderRadius: 8,

    opacity: 0.45,
  },

  couponDotSmall: {
    position: "absolute",

    width: 10,

    height: 10,

    borderRadius: 5,

    opacity: 0.4,
  },

  couponDotPink1: {
    backgroundColor: "#C94FC2",

    right: 42,

    top: 12,
  },

  couponDotPink2: {
    backgroundColor: "#D754C8",

    right: 72,

    bottom: 24,
  },

  couponDotPink3: {
    backgroundColor: "#C94FC2",

    right: 122,

    bottom: 38,
  },

  couponDotYellow1: {
    backgroundColor: "#E5A27B",

    right: 42,

    top: 12,
  },

  couponDotYellow2: {
    backgroundColor: "#E9A47A",

    right: 72,

    bottom: 24,
  },

  couponDotYellow3: {
    backgroundColor: "#E59A74",

    right: 122,

    bottom: 38,
  },


  // ==========================================================
  // COUPON TEXT
  // ==========================================================

  couponLeft: {
    zIndex: 5,

    marginLeft: 25,

    justifyContent: "center",
  },

  amountRow: {
    flexDirection: "row",

    alignItems: "baseline",
  },

  amountText: {
    fontSize: 27,

    fontWeight: "800",

    color: "#111111",
  },

  offText: {
    fontSize: 16,

    fontWeight: "500",

    color: "#111111",

    marginLeft: 5,
  },

  couponSubtitle: {
    fontSize: 17,

    color: "#111111",

    marginTop: 2,
  },


  // ==========================================================
  // COUPON RIGHT
  // ==========================================================

  couponRight: {
    position: "absolute",

    right: 15,

    top: 22,

    alignItems: "center",

    zIndex: 10,
  },

  useNowButton: {
    minWidth: 103,

    height: 38,

    paddingHorizontal: 17,

    borderRadius: 20,

    backgroundColor: "#52D800",

    alignItems: "center",

    justifyContent: "center",
  },

  useNowText: {
    fontSize: 17,

    fontWeight: "700",

    color: "#111111",
  },

  expiryText: {
    fontSize: 13,

    color: "#222222",

    marginTop: 5,
  },


  // ==========================================================
  // SCRATCH HEADER
  // ==========================================================

  scratchHeader: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    paddingHorizontal: 20,

    marginTop: 18,

    marginBottom: 8,
  },

  scratchTitle: {
    fontSize: 18,

    fontWeight: "500",

    color: "#444444",
  },

  viewAllText: {
    fontSize: 16,

    fontWeight: "500",

    color: "#444444",
  },


  // ==========================================================
  // CARDS
  // ==========================================================

  cardsContainer: {
    flexDirection: "row",

    flexWrap: "wrap",

    justifyContent: "space-between",

    paddingHorizontal: 26,

    rowGap: 20,
  },

  scratchCard: {
    borderRadius: 10,

    overflow: "hidden",

    backgroundColor: "#E58AB0",

    alignItems: "center",

    justifyContent: "center",
  },


  // ==========================================================
  // CARD CONTENT
  // ==========================================================

  cardContent: {
    position: "relative",

    alignItems: "center",

    justifyContent: "center",

    overflow: "hidden",
  },

  cardBackground: {
    position: "absolute",

    backgroundColor: "#E48AB1",
  },


  // ==========================================================
  // SOFT CIRCLES
  // ==========================================================

  softCircleOuter: {
    position: "absolute",

    backgroundColor: "#EEA1C2",

    opacity: 0.35,
  },

  softCircleMiddle: {
    position: "absolute",

    backgroundColor: "#F2A9C9",

    opacity: 0.35,
  },

  softCircleInner: {
    position: "absolute",

    backgroundColor: "#F7B7D1",

    opacity: 0.3,
  },


  // ==========================================================
  // SQUARE PATTERN
  // ==========================================================

  squarePattern: {
    position: "absolute",

    left: 0,

    top: 0,
  },


  // ==========================================================
  // SMALL DOTS
  // ==========================================================

  smallDot: {
    position: "absolute",

    width: 5,

    height: 5,

    borderRadius: 2.5,

    backgroundColor: "#C73D76",

    opacity: 0.55,
  },


  // ==========================================================
  // GIFT
  // ==========================================================

  giftContainer: {
    position: "absolute",

    alignItems: "center",

    justifyContent: "center",

    zIndex: 20,
  },


  // ==========================================================
  // BOTTOM NAVIGATION
  // ==========================================================

  bottomNavigation: {
    height: 70,

    backgroundColor: "#FFFFFF",

    borderTopWidth: 1,

    borderTopColor: "#EEEEEE",

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-around",
  },

  navItem: {
    width: "25%",

    height: "100%",

    alignItems: "center",

    justifyContent: "center",
  },


  // ==========================================================
  // EXTRA SPACE
  // ==========================================================

  bottomSpace: {
    height: 30,
  },
});