import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Animated,
  Alert,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

const { width } = Dimensions.get("window");

const STORAGE_KEY = "niningo_spark_progress";
const START_DATE_KEY = "niningo_spark_start_date";

const missions = [
  {
    title: "Early\nWake-up",
    image: require("../assets/images/earlywalkup.jpg"),
  },
  {
    title: "Hydration",
    image: require("../assets/images/hydrations.jpg"),
  },
  {
    title: "Physical\nActivity",
    image: require("../assets/images/physical-activity.webp"),
  },
  {
    title: "Study /\nWork",
    image: require("../assets/images/study-work.jpg"),
  },
  {
    title: "Sleep On\nTime",
    image: require("../assets/images/sleep-on-time.jpg"),
  },
];

const taskNames = [
  "Early Wake-up",
  "Hydration",
  "Physical Activity",
  "Study / Work",
  "Sleep On Time",
];

const slogans = [
  "Start Your Day",
  "Nice Start",
  "Nice Progress",
  "You're Doing Amazing",
  "Almost There",
  "Perfect Day!",
];

const getSlogan = (sparkCount: number) => {
  const safeCount = Math.max(0, Math.min(sparkCount, 5));
  return slogans[safeCount];
};

const taskImages = [
  require("../assets/images/earlywalkup.jpg"),
  require("../assets/images/hydrations.jpg"),
  require("../assets/images/physical-activity.webp"),
  require("../assets/images/study-work.jpg"),
  require("../assets/images/sleep-on-time.jpg"),
];

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const weekNames = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

type TaskProgress = {
  [taskIndex: string]: string;
};

type SparkProgress = {
  [date: string]: TaskProgress;
};

const normalizeDate = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const dateKey = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
};

const formatDisplayDate = (date: Date) =>
  date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export default function Spark() {
 //const today = normalizeDate(new Date());
  const today = normalizeDate(new Date(2026, 7, 21));

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const [progress, setProgress] = useState<SparkProgress>({});

  const [monthModal, setMonthModal] = useState(false);
  const [yearModal, setYearModal] = useState(false);


  const [sparkAnimation, setSparkAnimation] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  /*
   * First time the user opens Spark,
   * current date becomes the starting date.
   *
   * If you already have the user's actual registration/download date
   * from backend, replace this logic with that date.
   */
  useEffect(() => {
    loadSparkData();
  }, []);

  const parseDateKey = (value: string) => {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

 

  const loadSparkData = async () => {
    try {
      const savedProgress = await AsyncStorage.getItem(STORAGE_KEY);

      let parsedProgress: SparkProgress = {};

      if (savedProgress) {
        try {
          parsedProgress = JSON.parse(savedProgress);
        } catch (error) {
          console.log("Progress JSON parse error:", error);
        }
      }

      setProgress(parsedProgress);

      // The first saved activity date is the beginning of the current
      // Spark cycle. This also recovers old activity if START_DATE_KEY
      // was accidentally moved to a later date.
      const savedDates = Object.keys(parsedProgress)
        .filter((key) => Object.keys(parsedProgress[key] || {}).length > 0)
        .sort();

      let savedStartDate = await AsyncStorage.getItem(START_DATE_KEY);

      if (savedDates.length > 0) {
        const earliestSavedDate = savedDates[0];

        // if (!savedStartDate || earliestSavedDate < savedStartDate) {
        //   savedStartDate = earliestSavedDate;
        //   await AsyncStorage.setItem(START_DATE_KEY, savedStartDate);
        // }
        const currentMonthStart = new Date(
  today.getFullYear(),
  today.getMonth(),
  1
);

const currentMonthStartKey = dateKey(currentMonthStart);

if (
  !savedStartDate ||
  savedStartDate.substring(0, 7) !== dateKey(today).substring(0, 7)
) {
  savedStartDate = currentMonthStartKey;

  await AsyncStorage.setItem(
    START_DATE_KEY,
    savedStartDate
  );
}
      }

      if (!savedStartDate) {
        savedStartDate = dateKey(today);
        await AsyncStorage.setItem(START_DATE_KEY, savedStartDate);
      }

      const parsed = parseDateKey(savedStartDate);

      setStartDate(normalizeDate(parsed));
      setSelectedMonth(parsed.getMonth());
      setSelectedYear(parsed.getFullYear());
    } catch (error) {
      console.log("Spark load error:", error);
    }
  };

  const saveProgress = async (newProgress: SparkProgress) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(newProgress)
      );
    } catch (error) {
      console.log("Spark save error:", error);
    }
  };

  const isBeforeStart = (date: Date) => {
    if (!startDate) return false;

    return normalizeDate(date) < normalizeDate(startDate);
  };

  const isFuture = (date: Date) => {
    return normalizeDate(date) > today;
  };

  const getTaskCount = (date: Date) => {
    const key = dateKey(date);

    return Object.keys(progress[key] || {}).length;
  };

  const openDate = (date: Date) => {
    const selectedDateKey = dateKey(date);
    const hasSavedActivity =
      Object.keys(progress[selectedDateKey] || {}).length > 0;

    if (isFuture(date)) {
      Alert.alert(
        "Not Available Yet",
        "Tasks for future dates are not available yet. Come back on that day.",
        [{ text: "OK" }]
      );
      return;
    }

    // A past date with saved activity must always remain accessible.
    // A past date without activity can show No Spark Activity.
    if (isBeforeStart(date) && !hasSavedActivity) {
      Alert.alert(
        "No Spark Activity",
        `Your Spark journey started on ${formatDisplayDate(
          startDate || today
        )}. There are no task details available before that date.`,
        [{ text: "OK" }]
      );
      return;
    }

    router.push({
      pathname: "/day1",
      params: {
        date: selectedDateKey,
      },
    });
  };

  const updateTodayTaskPhoto = async (taskIndex: number, uri: string) => {
    const todayKey = dateKey(today);
    const newProgress: SparkProgress = {
      ...progress,
      [todayKey]: {
        ...(progress[todayKey] || {}),
        [String(taskIndex)]: uri,
      },
    };

    setProgress(newProgress);
    await saveProgress(newProgress);
  };

  const openCamera = async (taskIndex: number) => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Camera Permission",
          "Please allow camera permission in your phone settings to take a task photo."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.85,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        await updateTodayTaskPhoto(taskIndex, result.assets[0].uri);
      }
    } catch (error) {
      console.log("Camera upload error:", error);
      Alert.alert("Camera Error", "Could not open the camera.");
    }
  };

  const openGallery = async (taskIndex: number) => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Gallery Permission",
          "Please allow photo library permission to choose a task photo."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.85,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        await updateTodayTaskPhoto(taskIndex, result.assets[0].uri);
      }
    } catch (error) {
      console.log("Gallery upload error:", error);
      Alert.alert("Gallery Error", "Could not open the gallery.");
    }
  };

  // Remove one task photo from today's progress.
  // This immediately updates the Spark count and calendar because
  // both are calculated from the same `progress` state.
  const removePhoto = async (taskIndex: number) => {
    try {
      const todayKey = dateKey(today);
      const todayProgress = {
        ...(progress[todayKey] || {}),
      };

      delete todayProgress[String(taskIndex)];

      const newProgress: SparkProgress = {
        ...progress,
      };

      if (Object.keys(todayProgress).length === 0) {
        delete newProgress[todayKey];
      } else {
        newProgress[todayKey] = todayProgress;
      }

      setProgress(newProgress);
      await saveProgress(newProgress);
    } catch (error) {
      console.log("Remove photo error:", error);
      Alert.alert("Error", "Could not remove the photo.");
    }
  };

  // Show Camera / Gallery / Remove / Cancel options for a mission.
  const chooseTaskPhoto = (taskIndex: number) => {
    const taskName = taskNames[taskIndex];
    const hasPhoto = Boolean(
      progress[dateKey(today)]?.[String(taskIndex)]
    );

    const buttons: any[] = [
      {
        text: "CAMERA",
        onPress: () => openCamera(taskIndex),
      },
      {
        text: "GALLERY",
        onPress: () => openGallery(taskIndex),
      },
    ];

    if (hasPhoto) {
      buttons.push({
        text: "REMOVE",
        style: "destructive",
        onPress: () => removePhoto(taskIndex),
      });
    }

    buttons.push({
      text: "CANCEL",
      style: "cancel",
    });

    Alert.alert(
      taskName,
      "Add a photo for this mission",
      buttons
    );
  };

  const playSparkAnimation = () => {
    setSparkAnimation(true);

    scaleAnim.setValue(0.5);
    opacityAnim.setValue(0);

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1.15,
        friction: 5,
        tension: 90,
        useNativeDriver: true,
      }),

      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
          }),

          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setSparkAnimation(false);
        });
      }, 900);
    });
  };

  const calendarDays = useMemo(() => {
    const firstDay = new Date(
      selectedYear,
      selectedMonth,
      1
    );

    const lastDay = new Date(
      selectedYear,
      selectedMonth + 1,
      0
    );

    /*
     * JS Sunday = 0.
     * Convert to Monday-first calendar.
     */
    const firstWeekDay =
      firstDay.getDay() === 0
        ? 6
        : firstDay.getDay() - 1;

    const totalDays = lastDay.getDate();

    const cells: (number | null)[] = [];

    for (let i = 0; i < firstWeekDay; i++) {
      cells.push(null);
    }

    for (let day = 1; day <= totalDays; day++) {
      cells.push(day);
    }

    while (cells.length % 7 !== 0) {
      cells.push(null);
    }

    return cells;
  }, [selectedMonth, selectedYear]);

  const years = useMemo(() => {
    const currentYear = today.getFullYear();

    const values: number[] = [];

    for (
      let year = currentYear - 5;
      year <= currentYear + 2;
      year++
    ) {
      values.push(year);
    }

    return values;
  }, []);

  // Number of calendar days in the selected month on which the user
  // completed at least one task. This replaces the old hard-coded "26 Days".
  const completedDaysInSelectedMonth = useMemo(() => {
    return Object.entries(progress).filter(([key, tasks]) => {
      const date = new Date(`${key}T00:00:00`);
      const hasTask = Object.keys(tasks || {}).length > 0;

      return (
        hasTask &&
        date.getFullYear() === selectedYear &&
        date.getMonth() === selectedMonth &&
        date <= today &&
        (!startDate || date >= startDate)
      );
    }).length;
  }, [progress, selectedMonth, selectedYear, startDate, today]);

  const totalTodaySparks = useMemo(() => {
    const key = dateKey(today);

    return Object.keys(progress[key] || {}).length;
  }, [progress, today]);

  const renderSparkIcons = (
    completedCount: number,
    small = false
  ) => {
    return (
      <View style={styles.sparkRow}>
        {[0, 1, 2, 3, 4].map((index) => {
          const active = index < completedCount;

          return (
            <Text
              key={index}
              style={[
                small
                  ? styles.smallSpark
                  : styles.sparkIcon,
                !active && styles.dimSpark,
              ]}
            >
              ✨
            </Text>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={28}
              color="#222"
            />
          </TouchableOpacity>

          <Text style={styles.title}>Spark</Text>
        </View>

        {/* Main streak */}
        <View style={styles.streakContainer}>
          <Text style={styles.fire}>❤️‍🔥</Text>

          <Text style={styles.daysText}>
            {completedDaysInSelectedMonth} {completedDaysInSelectedMonth === 1 ? "Day" : "Days"}
          </Text>

         
        </View>

        {/* Missions */}
        <Text style={styles.missionsTitle}>
          Missions
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.missionsContainer}
        >
          {missions.map((mission, index) => {
            const todayPhoto = progress[dateKey(today)]?.[String(index)];

            return (
              <View
                key={index}
                style={styles.missionItem}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.missionCircle}
                  onPress={() => chooseTaskPhoto(index)}
                >
                  {todayPhoto ? (
                    <Image
                      source={{ uri: todayPhoto }}
                      style={styles.missionImage}
                    />
                  ) : (
                    <Ionicons
                      name="camera-outline"
                      size={31}
                      color="#C13BE0"
                    />
                  )}

                  {/* {todayPhoto && (
                    <View style={styles.photoCheck}>
                      <Ionicons
                        name="checkmark"
                        size={13}
                        color="#FFFFFF"
                      />
                    </View>
                  )} */}
                </TouchableOpacity>

                <Text style={styles.missionText}>
                  {mission.title}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        {/* Calendar */}
        <View style={styles.calendarContainer}>
          {/* Calendar Header */}
          <View style={styles.calendarHeader}>
            <TouchableOpacity
              style={styles.selectorButton}
              onPress={() => setMonthModal(true)}
            >
              <Text style={styles.monthText}>
                {monthNames[selectedMonth]}
              </Text>

              <Ionicons
                name="chevron-down"
                size={17}
                color="#1265C9"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.selectorButton}
              onPress={() => setYearModal(true)}
            >
              <Text style={styles.yearText}>
                {selectedYear}
              </Text>

              <Ionicons
                name="chevron-down"
                size={17}
                color="#1265C9"
              />
            </TouchableOpacity>
          </View>

          {/* Week */}
          <View style={styles.weekRow}>
            {weekNames.map((day, index) => (
              <Text
                key={day}
                style={[
                  styles.weekText,
                  index >= 5 && styles.weekendText,
                ]}
              >
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar */}
          {Array.from({
            length: calendarDays.length / 7,
          }).map((_, weekIndex) => (
            <View
              style={styles.dateRow}
              key={weekIndex}
            >
              {calendarDays
                .slice(
                  weekIndex * 7,
                  weekIndex * 7 + 7
                )
                .map((day, index) => {
                  if (!day) {
                    return (
                      <View
                        style={styles.dateCell}
                        key={`empty-${index}`}
                      />
                    );
                  }

                  const date = new Date(
                    selectedYear,
                    selectedMonth,
                    day
                  );

                  const key = dateKey(date);

                  const completed =
                    Object.keys(
                      progress[key] || {}
                    ).length;

                  const beforeStart =
                    isBeforeStart(date);

                  const future = isFuture(date);

                  const disabled =
                    future || (beforeStart && completed === 0);

                  const isToday =
                    dateKey(date) ===
                    dateKey(today);

                  return (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.dateCell,
                        isToday &&
                          styles.todayCell,
                        disabled &&
                          styles.disabledCell,
                      ]}
                      activeOpacity={0.75}
                      onPress={() => openDate(date)}
                    >
                      <Text
                        style={[
                          styles.dateText,
                          index >= 5 &&
                            styles.weekendDate,
                          disabled &&
                            styles.disabledDate,
                          isToday &&
                            styles.todayDate,
                        ]}
                      >
                        {day}
                      </Text>

                      {completed > 0 && (
                        <View style={styles.calendarSpark}>
                          {renderSparkIcons(
                            completed,
                            true
                          )}
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Month Selector */}
      <Modal
        visible={monthModal}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setMonthModal(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.selectorModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Select Month
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setMonthModal(false)
                }
              >
                <Ionicons
                  name="close"
                  size={25}
                  color="#333"
                />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {monthNames.map((month, index) => {
                const active =
                  index === selectedMonth;

                return (
                  <TouchableOpacity
                    key={month}
                    style={[
                      styles.listItem,
                      active &&
                        styles.selectedListItem,
                    ]}
                    onPress={() => {
                      setSelectedMonth(index);
                      setMonthModal(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.listText,
                        active &&
                          styles.selectedListText,
                      ]}
                    >
                      {month}
                    </Text>

                    {active && (
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color="#C13BE0"
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Year Selector */}
      <Modal
        visible={yearModal}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setYearModal(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.selectorModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Select Year
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setYearModal(false)
                }
              >
                <Ionicons
                  name="close"
                  size={25}
                  color="#333"
                />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {years.map((year) => {
                const active =
                  year === selectedYear;

                return (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.listItem,
                      active &&
                        styles.selectedListItem,
                    ]}
                    onPress={() => {
                      setSelectedYear(year);
                      setYearModal(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.listText,
                        active &&
                          styles.selectedListText,
                      ]}
                    >
                      {year}
                    </Text>

                    {active && (
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color="#C13BE0"
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 5 Spark Celebration */}
      {sparkAnimation && (
        <View
          pointerEvents="none"
          style={styles.celebrationContainer}
        >
          <Animated.View
            style={[
              styles.celebrationBox,
              {
                opacity: opacityAnim,
                transform: [
                  {
                    scale: scaleAnim,
                  },
                ],
              },
            ]}
          >
            <Text style={styles.celebrationSpark}>
              ✨✨✨✨✨
            </Text>

            <Text style={styles.celebrationTitle}>
              5 Sparks!
            </Text>

            <Text style={styles.celebrationText}>
              You completed every task today!
            </Text>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF4FC",
  },

  scrollContent: {
    paddingBottom: 40,
  },

  header: {
    height: 145,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },

  backButton: {
    padding: 4,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#C83DE0",
    marginLeft: 8,
  },

  streakContainer: {
    alignItems: "center",
    marginTop: -49,
  },

  fire: {
    fontSize: 78,
    marginBottom: 2,
  },

  daysText: {
    fontSize: 19,
    fontWeight: "600",
    color: "#FF6A00",
  },

  sparkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  sparkIcon: {
    fontSize: 24,
    marginHorizontal: 2,
  },

  smallSpark: {
    fontSize: 11,
    marginHorizontal: 1,
  },

  dimSpark: {
    opacity: 0.2,
  },

  mainSlogan: {
    marginTop: 8,
    fontSize: 17,
    fontWeight: "800",
    color: "#B83CCF",
    textAlign: "center",
  },

  missionsTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#C33FD5",
    marginTop: 29,
    marginLeft: 16,
    marginBottom: 12,
  },

  missionsContainer: {
    paddingHorizontal: 21,
    gap: 16,
    marginTop: 9,
  },

  missionItem: {
    width: 62,
    alignItems: "center",
  },

  missionCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#E9E9E9",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  missionImage: {
    width: 62,
    height: 62,
    borderRadius: 31,
  },

  photoCheck: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 21,
    height: 21,
    borderRadius: 11,
    backgroundColor: "#54A957",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFF4FC",
  },

  missionText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#222",
    textAlign: "center",
    lineHeight: 11,
    marginTop: 7,
  },

  calendarContainer: {
    marginHorizontal: 9,
    marginTop: 30,
    backgroundColor: "#FFF7C9",
    borderRadius: 17,
    paddingHorizontal: 10,
    paddingTop: 13,
    paddingBottom: 35,
  },

  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 5,
    marginBottom: 12,
  },

  selectorButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderRadius: 10,
  },

  monthText: {
    fontSize: 21,
    fontWeight: "800",
    color: "#1265C9",
  },

  yearText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1265C9",
  },

  weekRow: {
    flexDirection: "row",
    marginBottom: 9,
  },

  weekText: {
    width: "14.285%",
    textAlign: "center",
    fontSize: 15,
    fontWeight: "700",
    color: "#5C98D6",
  },

  weekendText: {
    color: "#5C98D6",
  },

  dateRow: {
    flexDirection: "row",
    height: 53,
    alignItems: "center",
  },

  dateCell: {
    width: "14.285%",
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
  },

  todayCell: {
    backgroundColor: "#E8D7FF",
  },

  disabledCell: {
    opacity: 0.35,
  },

  dateText: {
    fontSize: 17,
    fontWeight: "900",
    color: "#444",
  },

  weekendDate: {
    color: "#444",
  },

  disabledDate: {
    color: "#999",
  },

  todayDate: {
    color: "#8B3DCC",
  },

  calendarSpark: {
    position: "absolute",
    bottom: 0,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.38)",
    justifyContent: "center",
    paddingHorizontal: 25,
  },

  selectorModal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    maxHeight: "70%",
    padding: 18,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  modalTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: "#252525",
  },

  listItem: {
    minHeight: 55,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    borderRadius: 14,
    marginVertical: 3,
  },

  selectedListItem: {
    backgroundColor: "#F5E7FF",
  },

  listText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
  },

  selectedListText: {
    color: "#C13BE0",
    fontWeight: "800",
  },

  celebrationContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
  },

  celebrationBox: {
    width: width * 0.78,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },

  celebrationSpark: {
    fontSize: 29,
    marginBottom: 10,
  },

  celebrationTitle: {
    fontSize: 30,
    fontWeight: "900",
    color: "#C13BE0",
  },

  celebrationText: {
    fontSize: 13,
    color: "#777",
    marginTop: 6,
    textAlign: "center",
  },
});


