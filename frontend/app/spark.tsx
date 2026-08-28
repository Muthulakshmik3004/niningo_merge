import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

import BACKEND_URL from "../config";
import { useTheme } from "../constants/ThemeContext";

const { width } = Dimensions.get("window");

const STORAGE_KEY = "niningo_spark_progress";
const START_DATE_KEY = "niningo_spark_start_date";

/* =========================================================
 * MISSIONS
 * ========================================================= */

const missions = [
  { title: "Early\nWake-up", image: require("../assets/images/earlywalkup.jpg") },
  { title: "Hydration", image: require("../assets/images/hydrations.jpg") },
  { title: "Physical\nActivity", image: require("../assets/images/physical-activity.webp") },
  { title: "Study /\nWork", image: require("../assets/images/study-work.jpg") },
  { title: "Sleep On\nTime", image: require("../assets/images/sleep-on-time.jpg") },
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

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const weekNames = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

type TaskProgress = { [taskIndex: string]: string };
type SparkProgress = { [date: string]: TaskProgress };

/* =========================================================
 * DATE HELPERS
 * ========================================================= */

const normalizeDate = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const dateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDateKey = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const formatDisplayDate = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

/* =========================================================
 * BACKEND HELPERS
 * ========================================================= */

/*
 * Get username from the existing app session.
 * Different parts of the app may store session data
 * differently, so we check a few common keys.
 */
const getStoredUsername = async (): Promise<string | null> => {
  try {
    const directKeys = ["username", "niningo_username", "user_username"];

    for (const key of directKeys) {
      const value = await AsyncStorage.getItem(key);
      if (value && value.trim().length > 0) {
        return value.trim();
      }
    }

    const sessionKeys = ["session", "niningo_session", "user_session"];

    for (const key of sessionKeys) {
      const value = await AsyncStorage.getItem(key);
      if (!value) continue;

      try {
        const parsed = JSON.parse(value);
        const username =
          parsed?.username || parsed?.user?.username || parsed?.profile?.username;

        if (username && String(username).trim().length > 0) {
          return String(username).trim();
        }
      } catch {
        // Ignore invalid JSON and continue checking other keys.
      }
    }

    return null;
  } catch (error) {
    console.log("Get stored username error:", error);
    return null;
  }
};

/*
 * Backend stores tasks as:
 *   { "Hydration": { completed: true, photo: "..." } }
 * Existing UI uses:
 *   { "0": "photo-uri", "1": "photo-uri" }
 */
const convertBackendTasksToUI = (tasks: any): TaskProgress => {
  const result: TaskProgress = {};

  if (!tasks || typeof tasks !== "object") {
    return result;
  }

  Object.entries(tasks).forEach(([taskName, taskValue]: [string, any]) => {
    const taskIndex = taskNames.indexOf(taskName);
    if (taskIndex === -1) return;

    let photo = "";

    if (typeof taskValue === "string") {
      photo = taskValue;
    } else if (taskValue && typeof taskValue === "object") {
      photo = taskValue.photo || "";
    }

    if (photo) {
      result[String(taskIndex)] = photo;
    }
  });

  return result;
};

const convertBackendResultsToUI = (results: any[]): SparkProgress => {
  const converted: SparkProgress = {};

  if (!Array.isArray(results)) {
    return converted;
  }

  results.forEach((item) => {
    if (!item?.date) return;
    converted[item.date] = convertBackendTasksToUI(item.tasks);
  });

  return converted;
};

/* =========================================================
 * SPARK COMPONENT
 * ========================================================= */

export default function Spark() {
  const { theme } = useTheme();

  // const today = normalizeDate(new Date());
  const today = normalizeDate(new Date(2026, 7, 26));
  const todayKey = dateKey(today);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  // Date whose missions/photos are currently being viewed.
  const [selectedDateKey, setSelectedDateKey] = useState(todayKey);

  // All date-wise Spark progress.
  const [progress, setProgress] = useState<SparkProgress>({});

  // Logged-in username.
  const [username, setUsername] = useState<string | null>(null);

  // Backend loading state.
  const [loadingSpark, setLoadingSpark] = useState(true);

  const [monthModal, setMonthModal] = useState(false);
  const [yearModal, setYearModal] = useState(false);
  const [sparkAnimation, setSparkAnimation] = useState(false);

  // Heart-touch state for a pressed calendar cell.
  const [pressedDateKey, setPressedDateKey] = useState<string | null>(null);

  // Photo preview for past dates.
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  /* =======================================================
   * INITIAL LOAD
   * ======================================================= */

  useEffect(() => {
    initializeSpark();
  }, []);

  const initializeSpark = async () => {
    try {
      setLoadingSpark(true);

      // Get username first.
      const storedUsername = await getStoredUsername();
      setUsername(storedUsername);

      // Load local data first so the UI stays responsive even
      // when the backend is temporarily unavailable.
      let localProgress: SparkProgress = {};

      const savedProgress = await AsyncStorage.getItem(STORAGE_KEY);

      if (savedProgress) {
        try {
          localProgress = JSON.parse(savedProgress);
        } catch (error) {
          console.log("Local Spark JSON parse error:", error);
        }
      }

      setProgress(localProgress);

      // Start date.
      let savedStartDate = await AsyncStorage.getItem(START_DATE_KEY);

      if (!savedStartDate) {
        savedStartDate = todayKey;
        await AsyncStorage.setItem(START_DATE_KEY, savedStartDate);
      }

      const parsedStartDate = parseDateKey(savedStartDate);
      setStartDate(normalizeDate(parsedStartDate));

      setSelectedMonth(today.getMonth());
      setSelectedYear(today.getFullYear());
      setSelectedDateKey(todayKey);

      // Load from MongoDB.
      if (storedUsername) {
        await loadSparkFromBackend(storedUsername);
      } else {
        console.log("Spark: username not found. Using local data.");
      }
    } catch (error) {
      console.log("Spark initialization error:", error);
    } finally {
      setLoadingSpark(false);
    }
  };

  /* =======================================================
   * LOAD SPARK FROM BACKEND / MONGODB
   * ======================================================= */

  const loadSparkFromBackend = async (currentUsername: string) => {
    try {
      const url =
        `${BACKEND_URL}/app/api/spark/` +
        `?username=${encodeURIComponent(currentUsername)}`;

      console.log("🔥 Loading Spark from:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      const data = await response.json();

      console.log("🔥 Spark backend response:", JSON.stringify(data, null, 2));

      if (!response.ok) {
        throw new Error(data?.error || `HTTP ${response.status}`);
      }

      const backendProgress = convertBackendResultsToUI(data?.results || []);

      // Backend is the source of truth, but if it has no records yet,
      // keep the local progress instead of wiping it.
      if (Object.keys(backendProgress).length > 0) {
        setProgress(backendProgress);

        // Keep local cache in sync.
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(backendProgress));
      }

      console.log("✅ Spark loaded from MongoDB");
    } catch (error) {
      // Backend failure should NOT destroy local UI data.
      console.log("❌ Spark backend load error:", error);
      console.log("Using local Spark data as fallback.");
    }
  };

  /* =======================================================
   * SAVE LOCAL CACHE
   * ======================================================= */

  const saveProgressLocal = async (newProgress: SparkProgress) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
      console.log("✅ Local Spark cache saved");
    } catch (error) {
      console.log("Local Spark save error:", error);
    }
  };

  /* =======================================================
   * SAVE / DELETE ONE TASK IN MONGODB
   * ======================================================= */

  const saveTaskToBackend = async (
    targetDateKey: string,
    taskIndex: number,
    uri: string
  ) => {
    if (!username) {
      console.log("Spark backend save skipped: username missing");
      return false;
    }

    try {
      const task = taskNames[taskIndex];

      const response = await fetch(`${BACKEND_URL}/app/api/spark/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          username,
          date: targetDateKey,
          task,
          completed: true,
          photo: uri,
        }),
      });

      const data = await response.json();

      console.log("🔥 Spark save response:", JSON.stringify(data, null, 2));

      if (!response.ok) {
        throw new Error(data?.error || `HTTP ${response.status}`);
      }

      console.log(`✅ ${task} saved to MongoDB for ${targetDateKey}`);
      return true;
    } catch (error) {
      console.log("❌ Spark backend save error:", error);
      return false;
    }
  };

  const deleteTaskFromBackend = async (targetDateKey: string, taskIndex: number) => {
    if (!username) return false;

    try {
      const task = taskNames[taskIndex];

      const url =
        `${BACKEND_URL}/app/api/spark/delete-task/` +
        `?username=${encodeURIComponent(username)}` +
        `&date=${encodeURIComponent(targetDateKey)}` +
        `&task=${encodeURIComponent(task)}`;

      const response = await fetch(url, {
        method: "DELETE",
        headers: { Accept: "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || `HTTP ${response.status}`);
      }

      console.log(`✅ ${task} deleted from MongoDB`);
      return true;
    } catch (error) {
      console.log("❌ Spark backend delete error:", error);
      return false;
    }
  };

  /* =======================================================
   * SAVE PHOTO
   * ======================================================= */

  const updateTaskPhoto = async (taskIndex: number, uri: string) => {
    const targetDateKey = selectedDateKey;
    const targetDate = parseDateKey(targetDateKey);

    if (isFuture(targetDate)) {
      Alert.alert("Not Available Yet", "You cannot add tasks for a future date.");
      return;
    }

    if (targetDateKey !== todayKey) {
      Alert.alert("Not Available", "Missions can only be added on the current date.");
      return;
    }

    // Update UI immediately.
    const newProgress: SparkProgress = {
      ...progress,
      [targetDateKey]: {
        ...(progress[targetDateKey] || {}),
        [String(taskIndex)]: uri,
      },
    };

    setProgress(newProgress);
    await saveProgressLocal(newProgress);

    const saved = await saveTaskToBackend(targetDateKey, taskIndex, uri);

    if (!saved) {
      // Keep the UI/local cache; backend can be retried next launch.
      console.log("⚠️ Saved locally, backend save failed.");
    }

    // 5 tasks completed?
    const updatedCount = Object.keys(newProgress[targetDateKey] || {}).length;

    if (updatedCount === 5) {
      playSparkAnimation();
    }

    console.log(`📸 Photo saved for ${targetDateKey}`);
  };

  /* =======================================================
   * REMOVE PHOTO
   * ======================================================= */

  const removePhoto = async (taskIndex: number) => {
    if (selectedDateKey !== todayKey) {
      Alert.alert("Not Available", "Past mission photos cannot be removed.");
      return;
    }

    try {
      const dateProgress = { ...(progress[selectedDateKey] || {}) };
      delete dateProgress[String(taskIndex)];

      const newProgress: SparkProgress = { ...progress };

      if (Object.keys(dateProgress).length === 0) {
        delete newProgress[selectedDateKey];
      } else {
        newProgress[selectedDateKey] = dateProgress;
      }

      setProgress(newProgress);
      await saveProgressLocal(newProgress);

      const deleted = await deleteTaskFromBackend(selectedDateKey, taskIndex);

      if (!deleted) {
        console.log("⚠️ Local photo removed but backend delete failed.");
      }
    } catch (error) {
      console.log("Remove photo error:", error);
      Alert.alert("Error", "Could not remove the photo.");
    }
  };

  /* =======================================================
   * DATE HELPERS
   * ======================================================= */

  const isBeforeStart = (date: Date) => {
    if (!startDate) return false;
    return normalizeDate(date).getTime() < normalizeDate(startDate).getTime();
  };

  const isFuture = (date: Date) => normalizeDate(date).getTime() > today.getTime();

  const getTaskCount = (date: Date) => {
    const key = dateKey(date);
    return Object.keys(progress[key] || {}).length;
  };

  const selectedDateProgress = progress[selectedDateKey] || {};

  /* =======================================================
   * OPEN CALENDAR DATE
   * ======================================================= */

  const openDate = (date: Date) => {
    const selectedKey = dateKey(date);

    const hasSavedActivity =
      Object.keys(progress[selectedKey] || {}).length > 0;

    // Future date.
    if (isFuture(date)) {
      Alert.alert(
        "Not Available Yet",
        "Tasks for future dates are not available yet. Come back on that day.",
        [{ text: "OK" }]
      );
      return;
    }

    // Before the journey started, with nothing saved there.
    if (isBeforeStart(date) && !hasSavedActivity) {
      Alert.alert(
        "No Spark Activity",
        `Your Spark journey started on ${
          startDate ? formatDisplayDate(startDate) : formatDisplayDate(today)
        }. There are no task details available before that date.`,
        [{ text: "OK" }]
      );
      return;
    }

    // Remember selected date and move the calendar to match.
    setSelectedDateKey(selectedKey);
    setSelectedMonth(date.getMonth());
    setSelectedYear(date.getFullYear());

    router.push({
      pathname: "/day",
      params: { date: selectedKey },
    });
  };

  /* =======================================================
   * CAMERA / GALLERY
   * ======================================================= */

  const openCamera = async (taskIndex: number) => {
    if (selectedDateKey !== todayKey) {
      Alert.alert("Not Available", "You can add mission photos only for today.");
      return;
    }

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
        await updateTaskPhoto(taskIndex, result.assets[0].uri);
      }
    } catch (error) {
      console.log("Camera upload error:", error);
      Alert.alert("Camera Error", "Could not open the camera.");
    }
  };

  const openGallery = async (taskIndex: number) => {
    if (selectedDateKey !== todayKey) {
      Alert.alert("Not Available", "You can add mission photos only for today.");
      return;
    }

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
        await updateTaskPhoto(taskIndex, result.assets[0].uri);
      }
    } catch (error) {
      console.log("Gallery upload error:", error);
      Alert.alert("Gallery Error", "Could not open the gallery.");
    }
  };

  /* =======================================================
   * CHOOSE TASK PHOTO
   * ======================================================= */

  const chooseTaskPhoto = (taskIndex: number) => {
    const taskName = taskNames[taskIndex];

    const hasPhoto = Boolean(progress[selectedDateKey]?.[String(taskIndex)]);
    const selectedDate = parseDateKey(selectedDateKey);

    // Future.
    if (isFuture(selectedDate)) {
      Alert.alert("Not Available Yet", "Future dates cannot be edited.");
      return;
    }

    // Past + existing photo -> preview only.
    if (selectedDateKey !== todayKey && hasPhoto) {
      setPreviewPhoto(progress[selectedDateKey]?.[String(taskIndex)] || null);
      return;
    }

    // Past + no photo.
    if (selectedDateKey !== todayKey && !hasPhoto) {
      Alert.alert("Not Available", "Missions can only be added on the current date.");
      return;
    }

    // Today.
    const buttons: any[] = [
      { text: "CAMERA", onPress: () => openCamera(taskIndex) },
      { text: "GALLERY", onPress: () => openGallery(taskIndex) },
    ];

    if (hasPhoto) {
      buttons.push({
        text: "REMOVE",
        style: "destructive",
        onPress: () => removePhoto(taskIndex),
      });
    }

    buttons.push({ text: "CANCEL", style: "cancel" });

    Alert.alert(taskName, `Add a photo for ${formatDisplayDate(selectedDate)}`, buttons);
  };

  /* =======================================================
   * 5 SPARK ANIMATION
   * ======================================================= */

  const playSparkAnimation = () => {
    setSparkAnimation(true);
    scaleAnim.setValue(0.5);
    opacityAnim.setValue(0);

    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1.15, friction: 5, tension: 90, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start(() => {
      setTimeout(() => {
        Animated.parallel([
          Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
          Animated.timing(opacityAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]).start(() => setSparkAnimation(false));
      }, 900);
    });
  };

  /* =======================================================
   * CALENDAR DAYS
   * ======================================================= */

  const calendarDays = useMemo(() => {
    const firstDay = new Date(selectedYear, selectedMonth, 1);
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0);

    // JS Sunday = 0. Convert to Monday-first calendar.
    const firstWeekDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    const totalDays = lastDay.getDate();

    const cells: (number | null)[] = [];

    for (let i = 0; i < firstWeekDay; i++) cells.push(null);
    for (let day = 1; day <= totalDays; day++) cells.push(day);
    while (cells.length % 7 !== 0) cells.push(null);

    return cells;
  }, [selectedMonth, selectedYear]);

  const years = useMemo(() => {
    const currentYear = today.getFullYear();
    const values: number[] = [];

    for (let year = currentYear - 5; year <= currentYear + 2; year++) {
      values.push(year);
    }

    return values;
  }, []);

  const completedDaysInSelectedMonth = useMemo(() => {
    return Object.entries(progress).filter(([key, tasks]) => {
      const date = parseDateKey(key);
      const hasTask = Object.keys(tasks || {}).length > 0;

      return (
        hasTask &&
        date.getFullYear() === selectedYear &&
        date.getMonth() === selectedMonth &&
        date.getTime() <= today.getTime() &&
        (!startDate || date.getTime() >= startDate.getTime())
      );
    }).length;
  }, [progress, selectedMonth, selectedYear, startDate, today]);

  const selectedJourneyDay = useMemo(() => {
    if (!startDate) return 1;

    const selectedDate = parseDateKey(selectedDateKey);
    const start = normalizeDate(startDate);
    const selected = normalizeDate(selectedDate);

    const difference = selected.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;

    return Math.floor(difference / oneDay) + 1;
  }, [selectedDateKey, startDate]);

  const selectedDateSparkCount = Object.keys(selectedDateProgress).length;
  const totalTodaySparks = Object.keys(progress[todayKey] || {}).length;

  /* =======================================================
   * SPARK ICONS
   * ======================================================= */

  const renderSparkIcons = (completedCount: number, small = false) => {
    return (
      <View style={styles.sparkRow}>
        {[0, 1, 2, 3, 4].map((index) => {
          const active = index < completedCount;

          return (
            <Text
              key={index}
              style={[small ? styles.smallSpark : styles.sparkIcon, !active && styles.dimSpark]}
            >
              ✨
            </Text>
          );
        })}
      </View>
    );
  };

  /* =======================================================
   * UI
   * ======================================================= */

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.gradient[0] }}>
      <LinearGradient colors={theme.gradient} style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <View style={{ flex: 1 }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* HEADER */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={28} color={theme.primary} />
              </TouchableOpacity>

              <Text style={[styles.title, { color: theme.primary }]}>Spark</Text>
            </View>

            {/* STREAK */}
            <View style={styles.streakContainer}>
              <Image
                source={require("../assets/images/ninigo_burning.gif")}
                style={styles.burningHeartImage}
                resizeMode="contain"
              />

              <Text style={[styles.daysText, { color: theme.primary }]}>
                {selectedJourneyDay} {selectedJourneyDay === 1 ? "Day" : "Days"}
              </Text>

              {renderSparkIcons(selectedDateSparkCount)}
            </View>

            {/* MISSIONS */}
            <Text style={[styles.missionsTitle, { color: theme.primary }]}>Missions</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.missionsContainer}
            >
              {missions.map((mission, index) => {
                const selectedPhoto = progress[selectedDateKey]?.[String(index)];

                return (
                  <View key={index} style={styles.missionItem}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.missionCircle}
                      onPress={() => chooseTaskPhoto(index)}
                    >
                      {selectedPhoto ? (
                        <Image source={{ uri: selectedPhoto }} style={styles.missionImage} />
                      ) : (
                        <Ionicons name="camera-outline" size={31} color={theme.primary} />
                      )}
                    </TouchableOpacity>

                    <Text style={styles.missionText}>{mission.title}</Text>
                  </View>
                );
              })}
            </ScrollView>

            {/* CALENDAR */}
            <View
              style={[
                styles.calendarContainer,
                { backgroundColor: "#FFFFFFEE", borderWidth: 1, borderColor: theme.primary + "33" },
              ]}
            >
              <View style={styles.calendarHeader}>
                <TouchableOpacity style={styles.selectorButton} onPress={() => setMonthModal(true)}>
                  <Text style={[styles.monthText, { color: theme.primary }]}>
                    {monthNames[selectedMonth]}
                  </Text>
                  <Ionicons name="chevron-down" size={17} color={theme.primary} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.selectorButton} onPress={() => setYearModal(true)}>
                  <Text style={[styles.yearText, { color: theme.primary }]}>{selectedYear}</Text>
                  <Ionicons name="chevron-down" size={17} color={theme.primary} />
                </TouchableOpacity>
              </View>

              <View style={styles.weekRow}>
                {weekNames.map((day, index) => (
                  <Text key={day} style={[styles.weekText, index >= 5 && styles.weekendText]}>
                    {day}
                  </Text>
                ))}
              </View>

              {Array.from({ length: calendarDays.length / 7 }).map((_, weekIndex) => (
                <View style={styles.dateRow} key={weekIndex}>
                  {calendarDays
                    .slice(weekIndex * 7, weekIndex * 7 + 7)
                    .map((day, index) => {
                      if (!day) {
                        return <View style={styles.dateCell} key={`empty-${index}`} />;
                      }

                      const date = new Date(selectedYear, selectedMonth, day);
                      const key = dateKey(date);
                      const completed = getTaskCount(date);
                      const beforeStart = isBeforeStart(date);
                      const future = isFuture(date);
                      const disabled = future || (beforeStart && completed === 0);
                      const isToday = key === todayKey;
                      const isSelected = key === selectedDateKey;
                      const isPressed = pressedDateKey === key;

                      return (
                        <TouchableOpacity
                          key={day}
                          style={[
                            styles.dateCell,
                            isToday && { backgroundColor: theme.primary + "22" },
                            disabled && styles.disabledCell,
                          ]}
                          activeOpacity={0.75}
                          onPressIn={() => {
                            if (!disabled) setPressedDateKey(key);
                          }}
                          onPressOut={() => setPressedDateKey(null)}
                          onPress={() => openDate(date)}
                        >
                          <Text
                            style={[
                              styles.dateText,
                              index >= 5 && styles.weekendDate,
                              disabled && styles.disabledDate,
                              isToday && { color: theme.primary, fontWeight: "900" },
                              isSelected && { color: theme.primary },
                            ]}
                          >
                            {day}
                          </Text>

                          {isPressed && !disabled && completed > 0 && (
                            <View style={styles.touchHeartRow}>
                              {Array.from({ length: Math.min(completed, 5) }).map((_, heartIndex) => (
                                <Text key={heartIndex} style={styles.touchHeart}>
                                  ❤️
                                </Text>
                              ))}
                            </View>
                          )}

                          {!isPressed && completed > 0 && (
                            <View style={styles.calendarSpark}>
                              {renderSparkIcons(completed, true)}
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                </View>
              ))}
            </View>
          </ScrollView>

          {/* MONTH MODAL */}
          <Modal
            visible={monthModal}
            transparent
            animationType="fade"
            onRequestClose={() => setMonthModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.selectorModal}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Month</Text>
                  <TouchableOpacity onPress={() => setMonthModal(false)}>
                    <Ionicons name="close" size={25} color="#333" />
                  </TouchableOpacity>
                </View>

                <ScrollView>
                  {monthNames.map((month, index) => {
                    const active = index === selectedMonth;

                    return (
                      <TouchableOpacity
                        key={month}
                        style={[styles.listItem, active && { backgroundColor: theme.primary + "22" }]}
                        onPress={() => {
                          setSelectedMonth(index);
                          setMonthModal(false);
                        }}
                      >
                        <Text
                          style={[styles.listText, active && { color: theme.primary, fontWeight: "800" }]}
                        >
                          {month}
                        </Text>

                        {active && <Ionicons name="checkmark-circle" size={22} color={theme.primary} />}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>
          </Modal>

          {/* YEAR MODAL */}
          <Modal
            visible={yearModal}
            transparent
            animationType="fade"
            onRequestClose={() => setYearModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.selectorModal}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Year</Text>
                  <TouchableOpacity onPress={() => setYearModal(false)}>
                    <Ionicons name="close" size={25} color="#333" />
                  </TouchableOpacity>
                </View>

                <ScrollView>
                  {years.map((year) => {
                    const active = year === selectedYear;

                    return (
                      <TouchableOpacity
                        key={year}
                        style={[styles.listItem, active && { backgroundColor: theme.primary + "22" }]}
                        onPress={() => {
                          setSelectedYear(year);
                          setYearModal(false);
                        }}
                      >
                        <Text
                          style={[styles.listText, active && { color: theme.primary, fontWeight: "800" }]}
                        >
                          {year}
                        </Text>

                        {active && <Ionicons name="checkmark-circle" size={22} color={theme.primary} />}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>
          </Modal>

          {/* PHOTO PREVIEW */}
          <Modal
            visible={Boolean(previewPhoto)}
            transparent
            animationType="fade"
            onRequestClose={() => setPreviewPhoto(null)}
          >
            <View style={styles.photoPreviewOverlay}>
              <TouchableOpacity style={styles.photoPreviewClose} onPress={() => setPreviewPhoto(null)}>
                <Ionicons name="close" size={30} color="#FFFFFF" />
              </TouchableOpacity>

              {previewPhoto && (
                <Image
                  source={{ uri: previewPhoto }}
                  style={styles.photoPreviewImage}
                  resizeMode="contain"
                />
              )}
            </View>
          </Modal>

          {/* 5 SPARK CELEBRATION */}
          {sparkAnimation && (
            <View pointerEvents="none" style={styles.celebrationContainer}>
              <Animated.View
                style={[
                  styles.celebrationBox,
                  { opacity: opacityAnim, transform: [{ scale: scaleAnim }] },
                ]}
              >
                <Text style={styles.celebrationSpark}>✨✨✨✨✨</Text>
                <Text style={[styles.celebrationTitle, { color: theme.primary }]}>5 Sparks!</Text>
                <Text style={styles.celebrationText}>You completed every task today!</Text>
              </Animated.View>
            </View>
          )}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

/* =========================================================
 * STYLES
 * ========================================================= */

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 40 },

  header: {
    height: 145,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },

  backButton: { padding: 4 },

  title: {
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 8,
  },

  streakContainer: {
    alignItems: "center",
    marginTop: -49,
  },

  burningHeartImage: {
    width: 92,
    height: 82,
    marginBottom: 2,
    alignSelf: "center",
  },

  daysText: {
    fontSize: 19,
    fontWeight: "600",
  },

  sparkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  sparkIcon: { fontSize: 24, marginHorizontal: 2 },
  smallSpark: { fontSize: 11, marginHorizontal: 1 },
  dimSpark: { opacity: 0.2 },

  missionsTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 29,
    marginLeft: 16,
    marginBottom: 12,
  },

  missionsContainer: {
    paddingHorizontal: 21,
    gap: 16,
    marginTop: 9,
  },

  missionItem: { width: 62, alignItems: "center" },

  missionCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#E9E9E9",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  missionImage: { width: 62, height: 62, borderRadius: 31 },

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

  monthText: { fontSize: 21, fontWeight: "800" },
  yearText: { fontSize: 18, fontWeight: "800" },

  weekRow: { flexDirection: "row", marginBottom: 9 },

  weekText: {
    width: "14.285%",
    textAlign: "center",
    fontSize: 15,
    fontWeight: "700",
    color: "#5C98D6",
  },

  weekendText: { color: "#5C98D6" },

  dateRow: { flexDirection: "row", height: 53, alignItems: "center" },

  dateCell: {
    width: "14.285%",
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
  },

  disabledCell: { opacity: 0.35 },

  dateText: { fontSize: 17, fontWeight: "900", color: "#444" },
  weekendDate: { color: "#444" },
  disabledDate: { color: "#999" },

  touchHeartRow: {
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  touchHeart: { fontSize: 11, marginHorizontal: 1 },

  calendarSpark: { position: "absolute", bottom: 0 },

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

  modalTitle: { fontSize: 21, fontWeight: "800", color: "#252525" },

  listItem: {
    minHeight: 55,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    borderRadius: 14,
    marginVertical: 3,
  },

  listText: { fontSize: 17, fontWeight: "600", color: "#333" },

  photoPreviewOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },

  photoPreviewImage: { width: "92%", height: "75%" },

  photoPreviewClose: {
    position: "absolute",
    top: 55,
    right: 20,
    zIndex: 10,
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
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

  celebrationSpark: { fontSize: 29, marginBottom: 10 },
  celebrationTitle: { fontSize: 30, fontWeight: "900" },
  celebrationText: { fontSize: 13, color: "#777", marginTop: 6, textAlign: "center" },
});