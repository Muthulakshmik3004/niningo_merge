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
import { Ionicons, Zocial } from "@expo/vector-icons";
import { router } from "expo-router";


// ============================================================
// MAIN REWARDS SCREEN
// ============================================================

export default function RewardsScreen() {
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F7D8F5"
      />

      <View style={styles.container}>

        {/* ==================================================
            HEADER
        ================================================== */}

        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Rewards
          </Text>
        </View>


        {/* ==================================================
            PAGE CONTENT
        ================================================== */}

        <ScrollView
          style={styles.scrollView}
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
              <Text style={styles.activeTabText}>
                Coupons
              </Text>

              <View style={styles.activeTabLine} />
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
              styles.pinkCoupon,
            ]}
            activeOpacity={0.9}
          >

            {/* Decorative large circle */}
            <View style={styles.couponCirclePink} />

            {/* Decorative dots */}
            <View
              style={[
                styles.couponDot,
                styles.couponDotPink1,
              ]}
            />

            <View
              style={[
                styles.couponDot,
                styles.couponDotPink2,
              ]}
            />

            <View
              style={[
                styles.couponDotSmall,
                styles.couponDotPink3,
              ]}
            />


            {/* Left coupon text */}
            <View style={styles.couponLeft}>

              <View style={styles.amountRow}>

                <Text style={styles.amountText}>
                  ₹100
                </Text>

                <Text style={styles.offText}>
                  OFF
                </Text>

              </View>

              <Text style={styles.couponSubtitle}>
                for Grocery
              </Text>

            </View>


            {/* Right coupon section */}
            <View style={styles.couponRight}>

              <TouchableOpacity
                style={styles.useNowButton}
                activeOpacity={0.8}
              >
                <Text style={styles.useNowText}>
                  Use Now
                </Text>
              </TouchableOpacity>

              <Text style={styles.expiryText}>
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
              styles.yellowCoupon,
            ]}
            activeOpacity={0.9}
          >

            {/* Decorative large circle */}
            <View style={styles.couponCircleYellow} />

            {/* Decorative dots */}
            <View
              style={[
                styles.couponDot,
                styles.couponDotYellow1,
              ]}
            />

            <View
              style={[
                styles.couponDot,
                styles.couponDotYellow2,
              ]}
            />

            <View
              style={[
                styles.couponDotSmall,
                styles.couponDotYellow3,
              ]}
            />


            {/* Left text */}
            <View style={styles.couponLeft}>

              <View style={styles.amountRow}>

                <Text style={styles.amountText}>
                  20%
                </Text>

                <Text style={styles.offText}>
                  OFF
                </Text>

              </View>

              <Text style={styles.couponSubtitle}>
                for Bookings
              </Text>

            </View>


            {/* Right section */}
            <View style={styles.couponRight}>

              <TouchableOpacity
                style={styles.useNowButton}
                activeOpacity={0.8}
              >
                <Text style={styles.useNowText}>
                  Use Now
                </Text>
              </TouchableOpacity>

              <Text style={styles.expiryText}>
                Expires on May 05
              </Text>

            </View>

          </TouchableOpacity>


          {/* ==================================================
              SCRATCH CARD HEADER
          ================================================== */}

          <View style={styles.scratchHeader}>

            <Text style={styles.scratchTitle}>
              Scratch Card
            </Text>

            <TouchableOpacity
              onPress={() => router.push("/scratch-success")}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllText}>
                View all
              </Text>
            </TouchableOpacity>

          </View>


          {/* ==================================================
              SCRATCH CARDS
          ================================================== */}

          <View style={styles.cardsContainer}>

            {/* CARD 1 */}
            <TouchableOpacity
              style={[
                styles.scratchCard,
                {
                  width: cardSize,
                  height: cardSize,
                },
              ]}
              onPress={() => router.push("/scratch-success")}
              activeOpacity={0.9}
            >
              <ScratchCardDesign size={cardSize} />
            </TouchableOpacity>


            {/* CARD 2 */}
            <TouchableOpacity
              style={[
                styles.scratchCard,
                {
                  width: cardSize,
                  height: cardSize,
                },
              ]}
              onPress={() => router.push("/scratch-success")}
              activeOpacity={0.9}
            >
              <ScratchCardDesign size={cardSize} />
            </TouchableOpacity>


            {/* CARD 3 */}
            <TouchableOpacity
              style={[
                styles.scratchCard,
                {
                  width: cardSize,
                  height: cardSize,
                },
              ]}
              onPress={() => router.push("/scratch-success")}
              activeOpacity={0.9}
            >
              <ScratchCardDesign size={cardSize} />
            </TouchableOpacity>


            {/* CARD 4 */}
            <TouchableOpacity
              style={[
                styles.scratchCard,
                {
                  width: cardSize,
                  height: cardSize,
                },
              ]}
              onPress={() => router.push("/scratch-success")}
              activeOpacity={0.9}
            >
              <ScratchCardDesign size={cardSize} />
            </TouchableOpacity>


            {/* CARD 5 */}
            <TouchableOpacity
              style={[
                styles.scratchCard,
                {
                  width: cardSize,
                  height: cardSize,
                },
              ]}
              onPress={() => router.push("/scratch-success")}
              activeOpacity={0.9}
            >
              <ScratchCardDesign size={cardSize} />
            </TouchableOpacity>


            {/* CARD 6 */}
            <TouchableOpacity
              style={[
                styles.scratchCard,
                {
                  width: cardSize,
                  height: cardSize,
                },
              ]}
              onPress={() => router.push("/scratch-success")}
              activeOpacity={0.9}
            >
              <ScratchCardDesign size={cardSize} />
            </TouchableOpacity>

          </View>


          {/* Extra bottom space */}
          <View style={styles.bottomSpace} />

        </ScrollView>


        {/* ==================================================
            STATIC TASK BOTTOM NAVIGATION FOOTER
        ================================================== */}

        <View className="absolute left-0 right-0 bottom-0 h-[60px] flex-row justify-around items-center bg-white rounded-t-[25px]">
          <TouchableOpacity onPress={() => router.push("/all")}>
            <Ionicons name="document-text-outline" size={28} color="#777" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/status")}>
            <Zocial name="statusnet" size={28} color="#777" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/rewards")}>
            <Ionicons name="gift-outline" size={28} color="#B84CE8" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/profile")}>
            <Ionicons name="person-outline" size={28} color="#777" />
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}


// ============================================================
// SCRATCH CARD DESIGN
// ============================================================

const ScratchCardDesign = React.memo(function ScratchCardDesign({
  size,
}: {
  size: number;
}) {
  const center = size / 2;

  const squares = React.useMemo(() => {
    const items: React.ReactNode[] = [];

    const rings = [
      { radius: size * 0.16, count: 10, squareSize: 3 },
      { radius: size * 0.28, count: 14, squareSize: 4 },
      { radius: size * 0.42, count: 18, squareSize: 5 },
    ];

    rings.forEach((ring, ringIndex) => {
      for (let i = 0; i < ring.count; i++) {
        const angle = (i / ring.count) * Math.PI * 2 + ringIndex * 0.2;
        const x = center + Math.cos(angle) * ring.radius;
        const y = center + Math.sin(angle) * ring.radius;

        items.push(
          <View
            key={`r-${ringIndex}-${i}`}
            style={{
              position: "absolute",
              left: x - ring.squareSize / 2,
              top: y - ring.squareSize / 2,
              width: ring.squareSize,
              height: ring.squareSize,
              backgroundColor: "#D13C77",
              opacity: 0.35 + ringIndex * 0.08,
              transform: [{ rotate: `${(i * 17) % 45}deg` }],
            }}
          />
        );
      }
    });

    const extraSquares = [
      [0.1, 0.2, 5],
      [0.18, 0.36, 4],
      [0.82, 0.25, 5],
      [0.9, 0.46, 6],
      [0.74, 0.84, 4],
      [0.12, 0.75, 4],
    ];

    extraSquares.forEach(([x, y, squareSize], index) => {
      items.push(
        <View
          key={`ex-${index}`}
          style={{
            position: "absolute",
            left: size * x - squareSize / 2,
            top: size * y - squareSize / 2,
            width: squareSize,
            height: squareSize,
            backgroundColor: "#D13C77",
            opacity: 0.55,
          }}
        />
      );
    });

    return items;
  }, [size, center]);

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
      {/* CARD BACKGROUND */}
      <View
        style={[
          styles.cardBackground,
          {
            width: size,
            height: size,
          },
        ]}
      />

      {/* SOFT CIRCULAR BACKGROUND */}
      <View
        style={[
          styles.softCircleOuter,
          {
            width: size * 0.88,
            height: size * 0.88,
            borderRadius: size * 0.44,
            left: size * 0.06,
            top: size * 0.06,
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
          },
        ]}
      />

      {/* SMALL SQUARES PATTERN */}
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

      {/* SMALL DOTS */}
      <View
        style={[
          styles.smallDot,
          {
            left: size * 0.1,
            top: size * 0.09,
          },
        ]}
      />
      <View
        style={[
          styles.smallDot,
          {
            left: size * 0.86,
            top: size * 0.15,
          },
        ]}
      />
      <View
        style={[
          styles.smallDot,
          {
            left: size * 0.08,
            top: size * 0.48,
          },
        ]}
      />
      <View
        style={[
          styles.smallDot,
          {
            left: size * 0.88,
            top: size * 0.52,
          },
        ]}
      />
      <View
        style={[
          styles.smallDot,
          {
            left: size * 0.2,
            top: size * 0.82,
          },
        ]}
      />
      <View
        style={[
          styles.smallDot,
          {
            left: size * 0.76,
            top: size * 0.82,
          },
        ]}
      />

      {/* GIFT */}
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
        <Ionicons name="gift" size={size * 0.43} color="#D42670" />
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