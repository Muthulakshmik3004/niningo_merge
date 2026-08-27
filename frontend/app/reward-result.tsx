import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTheme } from "../constants/ThemeContext";

const { width, height } = Dimensions.get("window");


// ============================================================
// CONFETTI DATA
// ============================================================

const CONFETTI_COUNT = 90;

const colors = [
  "#FF4D91",
  "#FFD93D",
  "#6BCB77",
  "#4D96FF",
  "#A66CFF",
  "#FF7A45",
  "#00D4FF",
];


// ============================================================
// CONFETTI COMPONENT
// ============================================================

function ConfettiPiece({
  index,
}: {
  index: number;
}) {

  const translateY =
    useRef(
      new Animated.Value(
        -Math.random() * height
      )
    ).current;

  const translateX =
    useRef(
      new Animated.Value(
        Math.random() * width
      )
    ).current;

  const rotate =
    useRef(
      new Animated.Value(
        Math.random() * 360
      )
    ).current;

  const scale =
    useRef(
      new Animated.Value(
        0.6 +
          Math.random() * 0.8
      )
    ).current;


  useEffect(() => {

    const startX =
      Math.random() * width;

    const delay =
      Math.random() * 1800;

    translateX.setValue(startX);

    translateY.setValue(
      -50 -
        Math.random() *
          height *
          0.8
    );


    Animated.parallel([

      Animated.timing(
        translateY,
        {
          toValue:
            height + 100,

          duration:
            4000 +
            Math.random() * 2500,

          delay,

          useNativeDriver: true,
        }
      ),

      Animated.timing(
        translateX,
        {
          toValue:
            startX +
            (Math.random() * 160 - 80),

          duration:
            4000 +
            Math.random() * 2500,

          delay,

          useNativeDriver: true,
        }
      ),

      Animated.loop(

        Animated.timing(
          rotate,
          {
            toValue: 360,

            duration:
              700 +
              Math.random() *
                1000,

            useNativeDriver: true,
          }
        )

      ),

    ]).start();

  }, []);


  const rotateValue =
    rotate.interpolate({
      inputRange: [0, 360],
      outputRange: [
        "0deg",
        "360deg",
      ],
    });


  const randomWidth =
    5 +
    Math.random() * 8;

  const randomHeight =
    8 +
    Math.random() * 10;


  return (

    <Animated.View
      pointerEvents="none"
      style={[
        styles.confetti,

        {
          width:
            randomWidth,

          height:
            randomHeight,

          backgroundColor:
            colors[
              index %
                colors.length
            ],

          transform: [
            {
              translateX,
            },

            {
              translateY,
            },

            {
              rotate:
                rotateValue,
            },

            {
              scale,
            },
          ],
        },
      ]}
    />

  );
}


// ============================================================
// REWARD RESULT PAGE
// ============================================================

export default function RewardResultScreen() {
  const { theme } = useTheme();

  return (

    <SafeAreaView
      style={styles.safeArea}
    >

      <StatusBar
        barStyle="light-content"
        backgroundColor="#000000"
      />


      <View
        style={styles.container}
      >


        {/* ==================================================
            BLACK BACKGROUND
        ================================================== */}

        <View
          style={styles.background}
        />


        {/* ==================================================
            CONFETTI
        ================================================== */}

        {Array.from({
          length: CONFETTI_COUNT,
        }).map((_, index) => (

          <ConfettiPiece
            key={index}
            index={index}
          />

        ))}


        {/* ==================================================
            CLOSE BUTTON
        ================================================== */}

        <TouchableOpacity
          style={styles.closeButton}
          onPress={() =>
            router.back()
          }
          activeOpacity={0.8}
        >

          <Ionicons
            name="close"
            size={34}
            color="#FFFFFF"
          />

        </TouchableOpacity>


        {/* ==================================================
            REWARD POPUP
        ================================================== */}

        <View
          style={[styles.rewardPopup, { backgroundColor: theme.primary }]}
        >


          {/* ==================================================
              GREEN CHECK
          ================================================== */}

          <View
            style={styles.checkCircle}
          >

            <Ionicons
              name="checkmark"
              size={48}
              color="#FFFFFF"
            />

          </View>


          {/* ==================================================
              TITLE
          ================================================== */}

          <Text
            style={styles.rewardTitle}
          >
            Your Reward
          </Text>


          {/* ==================================================
              COUPON
          ================================================== */}

          <View
            style={styles.coupon}
          >

            {/* Store */}

            <Text
              style={styles.storeName}
            >
              Grocery Store
            </Text>


            {/* Discount */}

            <Text
              style={styles.discount}
            >
              30%
              <Text
                style={styles.off}
              >
                OFF
              </Text>
            </Text>


            {/* Minimum purchase */}

            <Text
              style={styles.minimum}
            >
              On Min. Purchase of ₹500
            </Text>


            {/* Coupon code */}

            <Text
              style={styles.codeText}
            >
              Code{" "}
              <Text
                style={styles.code}
              >
                SAVED26
              </Text>
            </Text>

          </View>


        </View>

      </View>

    </SafeAreaView>
  );
}


// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({

  safeArea: {
    flex: 1,

    backgroundColor:
      "#000000",
  },


  container: {
    flex: 1,

    backgroundColor:
      "#000000",

    alignItems:
      "center",

    justifyContent:
      "center",

    overflow:
      "hidden",
  },


  background: {
    position:
      "absolute",

    left: 0,
    right: 0,
    top: 0,
    bottom: 0,

    backgroundColor:
      "#000000",
  },


  // ==========================================================
  // CONFETTI
  // ==========================================================

  confetti: {
    position:
      "absolute",

    top: 0,

    left: 0,

    borderRadius: 2,

    zIndex: 1,
  },


  // ==========================================================
  // CLOSE BUTTON
  // ==========================================================

  closeButton: {
    position:
      "absolute",

    top: 22,

    right: 22,

    width: 45,

    height: 45,

    borderRadius: 23,

    alignItems:
      "center",

    justifyContent:
      "center",

    zIndex: 20,
  },


  // ==========================================================
  // POPUP
  // ==========================================================

  rewardPopup: {
    width:
      width * 0.73,

    minHeight:
      395,

    borderRadius:
      30,

    backgroundColor:
      "#062442",

    alignItems:
      "center",

    paddingTop: 42,

    paddingHorizontal: 20,

    zIndex: 10,

    elevation: 10,

    shadowColor:
      "#000000",

    shadowOffset: {
      width: 0,
      height: 8,
    },

    shadowOpacity:
      0.4,

    shadowRadius:
      15,
  },


  // ==========================================================
  // CHECK
  // ==========================================================

  checkCircle: {
    width: 70,

    height: 70,

    borderRadius: 35,

    backgroundColor:
      "#00B928",

    alignItems:
      "center",

    justifyContent:
      "center",

    marginBottom: 15,
  },


  // ==========================================================
  // TITLE
  // ==========================================================

  rewardTitle: {
    fontSize: 27,

    fontWeight:
      "800",

    color:
      "#FFFFFF",

    marginBottom: 30,
  },


  // ==========================================================
  // COUPON
  // ==========================================================

  coupon: {
    width:
      "100%",

    minHeight:
      185,

    borderRadius:
      28,

    backgroundColor:
      "#FFE13B",

    alignItems:
      "center",

    justifyContent:
      "center",

    paddingVertical:
      20,

    paddingHorizontal:
      12,
  },


  // ==========================================================
  // STORE
  // ==========================================================

  storeName: {
    fontSize: 17,

    fontWeight:
      "700",

    color:
      "#111111",

    marginBottom: 7,
  },


  // ==========================================================
  // DISCOUNT
  // ==========================================================

  discount: {
    fontSize: 43,

    fontWeight:
      "900",

    color:
      "#000000",

    lineHeight: 48,
  },

  off: {
    fontSize: 28,

    fontWeight:
      "900",

    color:
      "#000000",
  },


  // ==========================================================
  // MINIMUM
  // ==========================================================

  minimum: {
    fontSize: 14,

    fontWeight:
      "500",

    color:
      "#111111",

    marginTop: 4,
  },


  // ==========================================================
  // CODE
  // ==========================================================

  codeText: {
    fontSize: 16,

    color:
      "#111111",

    marginTop: 12,
  },

  code: {
    fontWeight:
      "900",
  },

});