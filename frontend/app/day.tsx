
import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import {
  router,
  useLocalSearchParams,
} from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY =
  "niningo_spark_progress";

const START_DATE_KEY =
  "niningo_spark_start_date";

const taskLogs = [
  {
    title: "Early Wake-up",
  },
  {
    title: "Hydration",
  },
  {
    title: "Physical Activity",
  },
  {
    title: "Study / Work",
  },
  {
    title: "Sleep On Time",
  },
];

type DayProgress = {
  [taskIndex: string]: string;
};

type SparkProgress = {
  [date: string]: DayProgress;
};

const parseDateKey = (
  value: string
) => {
  const [year, month, day] =
    value.split("-").map(Number);

  return new Date(
    year,
    month - 1,
    day
  );
};

const dateKey = (
  date: Date
) => {
  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (
  date: Date
) => {
  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
};

const getProgressSlogan = (
  count: number
) => {
  switch (count) {
    case 0:
      return "Start Your Day";

    case 1:
      return "Nice Start";

    case 2:
      return "Nice Progress";

    case 3:
      return "You're Doing Amazing";

    case 4:
      return "Almost There";

    case 5:
      return "Perfect Day!";

    default:
      return "Perfect Day!";
  }
};

export default function Day() {
  const params =
    useLocalSearchParams<{
      date?: string;
    }>();

  /*
   * Calendar sends:
   *
   * /day1?date=2026-08-20
   */
  const selectedDateKey =
    Array.isArray(params.date)
      ? params.date[0]
      : params.date;

  /*
   * If no date was passed,
   * use today's date.
   */
  const activeDateKey =
    selectedDateKey ||
    dateKey(new Date());
 // const activeDateKey = selectedDateKey || "2026-08-22";

  /*
   * Convert selected date key
   * into Date object.
   */
  const selectedDate = useMemo(
    () => {
      return parseDateKey(
        activeDateKey
      );
    },
    [activeDateKey]
  );

  const [progress, setProgress] =
    useState<SparkProgress>({});

  const [startDate, setStartDate] =
    useState<Date | null>(null);

  /*
   * LOAD DATA EVERY TIME THE
   * SELECTED DATE CHANGES.
   */
  useEffect(() => {
    let mounted = true;

    const loadDayData =
      async () => {
        try {
          const [
            savedProgress,
            savedStartDate,
          ] = await Promise.all([
            AsyncStorage.getItem(
              STORAGE_KEY
            ),

            AsyncStorage.getItem(
              START_DATE_KEY
            ),
          ]);

          let parsedProgress:
            SparkProgress = {};

          /*
           * Read all saved date-wise data.
           */
          if (savedProgress) {
            try {
              parsedProgress =
                JSON.parse(
                  savedProgress
                );
            } catch (error) {
              console.log(
                "❌ Day progress JSON error:",
                error
              );
            }
          }

          if (!mounted) return;

          setProgress(
            parsedProgress
          );

          /*
           * Read Spark start date.
           */
          if (savedStartDate) {
            const parsedStartDate =
              parseDateKey(
                savedStartDate
              );

            setStartDate(
              parsedStartDate
            );
          }

          /*
           * Debug logs.
           */
          console.log(
            "🔥 DAY ALL SAVED DATA:",
            JSON.stringify(
              parsedProgress,
              null,
              2
            )
          );

          console.log(
            "🔥 DAY SELECTED DATE:",
            activeDateKey
          );

          console.log(
            "🔥 DAY SELECTED DATA:",
            JSON.stringify(
              parsedProgress[
                activeDateKey
              ] || {},
              null,
              2
            )
          );

          console.log(
            "🔥 DAY START DATE:",
            savedStartDate ||
              "NO START DATE"
          );
        } catch (error) {
          console.log(
            "❌ Day details load error:",
            error
          );
        }
      };

    loadDayData();

    return () => {
      mounted = false;
    };
  }, [activeDateKey]);

  /*
   * EXACTLY THIS DATE'S DATA.
   *
   * Example:
   *
   * 20 Aug:
   * progress["2026-08-20"]
   *
   * 21 Aug:
   * progress["2026-08-21"]
   */
  const selectedProgress =
    progress[
      activeDateKey
    ] || {};

  /*
   * Convert saved task data
   * into displayable logs.
   */
  const completedLogs =
    taskLogs
      .map(
        (task, index) => ({
          ...task,
          index,
          imageUri:
            selectedProgress[
              String(index)
            ],
        })
      )
      .filter(
        (task) =>
          Boolean(
            task.imageUri
          )
      );

  const completedCount =
    completedLogs.length;

  /*
   * Calculate Day number.
   */
  const dayNumber = useMemo(
    () => {
      if (!startDate) {
        return selectedDate.getDate();
      }

      const start =
        new Date(
          startDate.getFullYear(),
          startDate.getMonth(),
          startDate.getDate()
        );

      const current =
        new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate()
        );

      const difference =
        current.getTime() -
        start.getTime();

      const days =
        Math.floor(
          difference /
            (1000 *
              60 *
              60 *
              24)
        ) + 1;

      return Math.max(
        1,
        days
      );
    },
    [
      selectedDate,
      startDate,
    ]
  );

  const progressMessage =
    getProgressSlogan(
      completedCount
    );

  return (
    <View
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* HEADER */}
        <View
          style={styles.header}
        >
          <TouchableOpacity
            onPress={() =>
              router.back()
            }
            style={
              styles.backButton
            }
          >
            <Ionicons
              name="arrow-back"
              size={30}
              color="#C13BE0"
            />
          </TouchableOpacity>

          <Text
            style={
              styles.headerTitle
            }
          >
            Day {dayNumber}
          </Text>
        </View>

        {/* STREAK */}
        <View
          style={
            styles.streakContainer
          }
        >
          <View
            style={styles.fireRow}
          >
            {[0, 1, 2, 3, 4].map(
              (index) => (
                <Text
                  key={index}
                  style={[
                    styles.fire,
                    index >=
                      completedCount &&
                      styles.lastFire,
                  ]}
                >
                  🔥
                </Text>
              )
            )}
          </View>


          <Text
            style={
              styles.progressText
            }
          >
            “{progressMessage}”
          </Text>

          <Text
            style={
              styles.dateText
            }
          >
            {formatDisplayDate(
              selectedDate
            )}
          </Text>
        </View>

        {/* DAILY LOGS */}
        <Text
          style={
            styles.dailyLogsTitle
          }
        >
          Daily Logs
        </Text>

        {completedLogs.length >
        0 ? (
          <View
            style={
              styles.logsGrid
            }
          >
            {completedLogs.map(
              (log) => (
                <View
                  key={
                    log.index
                  }
                  style={
                    styles.logItem
                  }
                >
                  <Image
                    source={{
                      uri: log.imageUri,
                    }}
                    style={
                      styles.logImage
                    }
                  />

                  <Text
                    style={
                      styles.logTitle
                    }
                  >
                    {log.title}
                  </Text>
                </View>
              )
            )}
          </View>
        ) : (
          <View
            style={
              styles.emptyBox
            }
          >
            <Text
              style={
                styles.emptyText
              }
            >
              No task photos added
              for this date yet.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF3FA",
  },

  scrollContent: {
    paddingBottom: 30,
  },

  header: {
    height: 65,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 30,
  },

  backButton: {
    padding: 2,
  },

  headerTitle: {
    fontSize: 25,
    fontWeight: "800",
    color: "#C13BE0",
    marginLeft: 7,
  },

  streakContainer: {
    alignItems: "center",
    marginTop: 32,
  },

  fireRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  fire: {
    fontSize: 38,
    marginHorizontal: 5,
  },

  lastFire: {
    opacity: 0.35,
  },

  progressText: {
    fontSize: 24,
    fontWeight: "500",
    color: "#C13BE0",
    marginTop: 18,
  },

  dateText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#C13BE0",
    marginTop: 8,
  },

  dailyLogsTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#C13BE0",
    marginTop: 20,
    marginLeft: 14,
    marginBottom: 30,
  },

  logsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent:
      "space-between",
    paddingHorizontal: 24,
  },

  logItem: {
    width: "46%",
    marginBottom: 30,
    alignItems: "center",
  },

  logImage: {
    width: 158,
    height: 193,
    borderRadius: 35,
    resizeMode: "cover",
  },

  logTitle: {
    width: 165,
    fontSize: 15,
    fontWeight: "800",
    color: "#002C68",
    textAlign: "center",
    marginTop: 10,
  },

  emptyBox: {
    marginHorizontal: 24,
    marginTop: 10,
    paddingVertical: 35,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },

  emptyText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#7B5A83",
    textAlign: "center",
  },
});