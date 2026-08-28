import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Alert,
  Dimensions,
  Modal,
  FlatList,
  SafeAreaView,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import { Ionicons } from "@expo/vector-icons";

import { getSession } from "../services/session";

import {
  fetchStatusViewers,
  markStatusViewed,
  deleteStatus,
  StatusItem,
} from "../services/api";


// ======================================================
// VIEWER TYPE
// ======================================================

type StatusViewer = {
  id?: number | string;

  username?: string;
  viewer_username?: string;

  name?: string;
  viewer_name?: string;

  phone?: string;
  email?: string;

  about?: string;

  image?: string;
  profile_image?: string;
  viewer_image?: string;
  profileImage?: string;

  viewed_at?: string;
};


// ======================================================
// STATUS VIEW
// ======================================================

export default function StatusView() {

  // ====================================================
  // ROUTER PARAMETERS
  // ====================================================

  const {
    id,
    mine,
    image,
    name,
    profileImage,
    createdAt,
    statuses,
    currentIndex,
  } = useLocalSearchParams<{
    id?: string;
    mine?: string;
    image?: string;
    name?: string;
    profileImage?: string;
    createdAt?: string;
    statuses?: string;
    currentIndex?: string;
  }>();


  // ====================================================
  // BASIC VALUES
  // ====================================================

  const isMine = mine === "true";


  // ====================================================
  // PARSE ALL STATUSES
  // ====================================================

  // ====================================================
// PARSE ALL STATUSES
// ====================================================

const allStatuses = React.useMemo(() => {
  if (!statuses) {
    return [];
  }

  try {
    const parsed = JSON.parse(statuses) as StatusItem[];

    if (!Array.isArray(parsed)) {
      return [];
    }

    // status.tsx already sends statuses
    // in OLD -> NEW order.
    // Keep that exact order here.
    return parsed;
  } catch (error) {
    console.warn(
      "STATUS PARSE ERROR:",
      error
    );

    return [];
  }
}, [statuses]);


// ====================================================
// START INDEX
// ====================================================

const startIndex = Number(
  currentIndex || 0
);


// ====================================================
// STATES
// ====================================================

const [loading, setLoading] =
  useState(true);

const [viewerCount, setViewerCount] =
  useState(0);

const [viewers, setViewers] =
  useState<StatusViewer[]>([]);

const [viewersVisible, setViewersVisible] =
  useState(false);

const [viewersLoading, setViewersLoading] =
  useState(false);

const [selectedViewer, setSelectedViewer] =
  useState<StatusViewer | null>(null);

const [profileVisible, setProfileVisible] =
  useState(false);

const [myProfileImage, setMyProfileImage] =
  useState("");

const [menuVisible, setMenuVisible] =
  useState(false);

const [currentStatusIndex, setCurrentStatusIndex] =
  useState(startIndex);


// ====================================================
// CURRENT STATUS
// ====================================================

const currentStatus =
  isMine &&
  allStatuses.length > 0
    ? allStatuses[
        Math.min(
          currentStatusIndex,
          allStatuses.length - 1
        )
      ]
    : null;

  // ====================================================
  // CURRENT IMAGE
  // ====================================================

  const currentImage =
    currentStatus?.content_image ||
    image ||
    "";


  // ====================================================
  // PROGRESS
  // ====================================================

  const progress =
    useRef(
      new Animated.Value(0)
    ).current;


  const {
    width: screenWidth,
  } = Dimensions.get("window");


  // ====================================================
  // NEXT STATUS
  // ====================================================

  const goToNextStatus = () => {

    if (
      currentStatusIndex <
      allStatuses.length - 1
    ) {

      setCurrentStatusIndex(
        (prev) => prev + 1
      );

    } else {

      router.back();

    }
  };


  // ====================================================
  // PREVIOUS STATUS
  // ====================================================

  const goToPreviousStatus = () => {

    if (currentStatusIndex > 0) {

      setCurrentStatusIndex(
        (prev) => prev - 1
      );

    }

  };


 


  // ====================================================
  // LOAD STATUS
  // ====================================================

  useEffect(() => {

    const run = async () => {

      try {

        const session =
          await getSession();


        


        // ------------------------------------------------
        // MY OWN STATUS
        // ------------------------------------------------

        if (isMine) {

          const res =
            await fetchStatusViewers(
              id as string
            );


          console.log(
            "STATUS VIEWERS RESPONSE:",
            res
          );


          // ----------------------------------------------
          // VIEWER COUNT
          // ----------------------------------------------

          const count = res?.viewer_count ?? 0;


          setViewerCount(
            Number(count)
          );


          // ----------------------------------------------
          // VIEWER LIST
          // ----------------------------------------------

          const viewerList = res?.viewers ?? [];


          if (
            Array.isArray(viewerList)
          ) {

            setViewers(
              viewerList
            );

          }

        }


        // ------------------------------------------------
        // OTHER PERSON'S STATUS
        // ------------------------------------------------

        else if (
          session.username
        ) {

          const res =
            await markStatusViewed({

              status_id:
                id as string,

              viewer_username:
                session.username,

              viewer_name:
                session.name ||
                session.username,

              viewer_image:
                session.profileImage ||
                "",

            });


          setViewerCount(
            res?.status?.viewer_count ||
            0
          );

        }

      } catch (error) {

        console.warn(
          "STATUS VIEW ERROR:",
          error
        );

      } finally {

        setLoading(false);

      }

    };


    if (id) {

      run();

    }

  }, [
    id,
    isMine,
    profileImage,
  ]);


  // ====================================================
  // 30 SECOND PROGRESS
  // ====================================================

  useEffect(() => {

    if (loading) {
      return;
    }


    progress.stopAnimation();

    progress.setValue(0);


    const animation =
      Animated.timing(
        progress,
        {
          toValue: 1,

          duration: 30000,

          useNativeDriver: false,
        }
      );


    animation.start(
      ({ finished }) => {

        if (finished) {

          goToNextStatus();

        }

      }
    );


    return () => {

      animation.stop();

    };

  }, [
    loading,
    currentStatusIndex,
    allStatuses.length,
  ]);


  // ====================================================
  // LOAD VIEWERS
  // ====================================================

  const handleViewers = async () => {

    try {

      if (!id) {
        return;
      }


      setViewersVisible(true);

      setViewersLoading(true);


      const res =
        await fetchStatusViewers(
          id as string
        );


      console.log(
        "VIEWERS RESPONSE:",
        res
      );


      // ----------------------------------------------
      // COUNT
      // ----------------------------------------------

      const count = res?.viewer_count ?? 0;


      setViewerCount(
        Number(count)
      );


      // ----------------------------------------------
      // LIST
      // ----------------------------------------------

      const viewerList = res?.viewers ?? [];


      if (
        Array.isArray(viewerList)
      ) {

        setViewers(
          viewerList
        );

      } else {

        setViewers([]);

      }

    } catch (error) {

      console.warn(
        "VIEWERS LOAD ERROR:",
        error
      );


      Alert.alert(
        "Error",
        "Unable to load viewers."
      );

    } finally {

      setViewersLoading(false);

    }

  };


  // ====================================================
  // OPEN VIEWER PROFILE
  // ====================================================

  const openViewerProfile = (
    viewer: StatusViewer
  ) => {

    setSelectedViewer(
      viewer
    );

    setProfileVisible(
      true
    );

  };


  // ====================================================
  // CLOSE PROFILE
  // ====================================================

  const closeViewerProfile = () => {

    setProfileVisible(false);

    setSelectedViewer(null);

  };


  // ====================================================
  // DELETE STATUS
  // ====================================================

  const handleDelete = async () => {

    setMenuVisible(false);


    const session =
      await getSession();


    Alert.alert(
      "Delete My Moment",

      "Are you sure you want to delete this status?",

      [

        {
          text: "Cancel",

          style: "cancel",
        },

        {

          text: "Delete",

          style: "destructive",

          onPress: async () => {

            try {

              if (
                !id ||
                !session.username
              ) {

                return;

              }


              await deleteStatus(
                id,
                session.username
              );


              Alert.alert(
                "Deleted",

                "Your Moment has been deleted.",

                [

                  {

                    text: "OK",

                    onPress: () => {

                      router.back();

                    },

                  },

                ]
              );


            } catch (error) {

              console.warn(
                "DELETE STATUS ERROR:",
                error
              );


              Alert.alert(
                "Error",

                "Unable to delete the status."
              );

            }

          },

        },

      ]

    );

  };


  // ====================================================
  // GET VIEWER NAME
  // ====================================================

  const getViewerName = (
    viewer: StatusViewer
  ) => {

    return (
      viewer?.name ||
      viewer?.viewer_name ||
      viewer?.username ||
      viewer?.viewer_username ||
      "Unknown"
    );

  };


  // ====================================================
  // GET VIEWER USERNAME
  // ====================================================

  const getViewerUsername = (
    viewer: StatusViewer
  ) => {

    return (
      viewer?.username ||
      viewer?.viewer_username ||
      ""
    );

  };


  // ====================================================
  // GET VIEWER IMAGE
  // ====================================================

  const getViewerImage = (
  viewer: StatusViewer
) => {
  return (
    viewer?.profile_image ||
    viewer?.viewer_image ||
    viewer?.profileImage ||
    viewer?.image ||
    ""
  );
};


  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {

    return (

      <View
        style={{
          flex: 1,

          backgroundColor: "#000",

          justifyContent: "center",

          alignItems: "center",
        }}
      >

        <ActivityIndicator
          size="large"
          color="#fff"
        />

      </View>

    );

  }


  // ====================================================
  // MAIN UI
  // ====================================================

  return (

    <View
      style={{
        flex: 1,

        backgroundColor: "#000",
      }}
    >


      {/* ================================================= */}
      {/* WHATSAPP STYLE STATUS PROGRESS BARS */}
      {/* ================================================= */}

      <View
        style={{
          position: "absolute",

          top: 8,

          left: 8,

          right: 8,

          height: 4,

          flexDirection: "row",

          gap: 4,

          zIndex: 50,
        }}
      >

        {allStatuses.map(
          (_, index) => {

            let barWidth: any =
              "0%";


            if (
              index <
              currentStatusIndex
            ) {

              barWidth =
                "100%";

            } else if (
              index ===
              currentStatusIndex
            ) {

              barWidth =
                progress.interpolate({

                  inputRange: [
                    0,
                    1,
                  ],

                  outputRange: [
                    "0%",
                    "100%",
                  ],

                });

            }


            return (

              <View
                key={index}
                style={{
                  flex: 1,

                  height: 3,

                  backgroundColor:
                    "rgba(255,255,255,0.35)",

                  borderRadius: 5,

                  overflow: "hidden",
                }}
              >

                <Animated.View
                  style={{
                    width: barWidth,

                    height: "100%",

                    backgroundColor:
                      "#fff",
                  }}
                />

              </View>

            );

          }
        )}

      </View>


      {/* ================================================= */}
      {/* TOP HEADER */}
      {/* ================================================= */}

      <View
        style={{
          position: "absolute",

          top: 20,

          left: 0,

          right: 0,

          zIndex: 40,

          flexDirection: "row",

          alignItems: "center",

          paddingHorizontal: 14,

          paddingVertical: 10,
        }}
      >


        {/* BACK */}

        <TouchableOpacity
          onPress={() =>
            router.back()
          }
          style={{
            width: 35,

            height: 40,

            justifyContent:
              "center",

            alignItems:
              "center",
          }}
        >

          <Ionicons
            name="arrow-back"
            size={26}
            color="#fff"
          />

        </TouchableOpacity>


        {/* PROFILE IMAGE */}

        <View
          style={{
            width: 42,

            height: 42,

            borderRadius: 21,

            marginLeft: 5,

            borderWidth: 2,

            borderColor: "#fff",

            overflow: "hidden",
          }}
        >

          {myProfileImage ||
          profileImage ? (

            <Image
              source={{
                uri:
                  myProfileImage ||
                  profileImage ||
                  "https://i.pravatar.cc/150",
              }}

              style={{
                width: "100%",

                height: "100%",
              }}
            />

          ) : (

            <View
              style={{
                flex: 1,

                backgroundColor:
                  "#555",

                justifyContent:
                  "center",

                alignItems:
                  "center",
              }}
            >

              <Ionicons
                name="person"
                size={24}
                color="#fff"
              />

            </View>

          )}

        </View>


        {/* NAME + TIME */}

        <View
          style={{
            marginLeft: 10,

            flex: 1,
          }}
        >

          <Text
            style={{
              color: "#fff",

              fontSize: 16,

              fontWeight: "700",
            }}

            numberOfLines={1}
          >

            {isMine
              ? "My Moment"
              : name || "Moment"}

          </Text>


          <Text
            style={{
              color: "#ddd",

              fontSize: 11,

              marginTop: 2,
            }}
          >

            {createdAt ||
              "Just now"}

          </Text>

        </View>


        {/* ================================================= */}
        {/* THREE DOTS */}
        {/* ================================================= */}

        <TouchableOpacity
          onPress={() =>
            setMenuVisible(
              !menuVisible
            )
          }

          style={{
            width: 40,

            height: 40,

            justifyContent:
              "center",

            alignItems:
              "center",
          }}
        >

          <Ionicons
            name="ellipsis-vertical"
            size={22}
            color="#fff"
          />

        </TouchableOpacity>

      </View>


      {/* ================================================= */}
      {/* THREE DOT MENU */}
      {/* ================================================= */}

      {menuVisible && (

        <View
          style={{
            position: "absolute",

            top: 65,

            right: 12,

            zIndex: 100,

            width: 180,

            backgroundColor: "#fff",

            borderRadius: 10,

            paddingVertical: 6,

            elevation: 8,

            shadowColor: "#000",

            shadowOpacity: 0.3,

            shadowRadius: 8,

            shadowOffset: {
              width: 0,

              height: 3,
            },
          }}
        >


          {/* SHARE */}

          <TouchableOpacity
            style={{
              paddingHorizontal: 18,

              paddingVertical: 14,
            }}

            onPress={() => {

              setMenuVisible(
                false
              );

              Alert.alert(
                "Share",

                "Share option can be added here."
              );

            }}
          >

            <Text
              style={{
                color: "#222",

                fontSize: 15,
              }}
            >
              Share
            </Text>

          </TouchableOpacity>


          {/* DELETE */}

          {isMine && (

            <TouchableOpacity
              style={{
                paddingHorizontal: 18,

                paddingVertical: 14,
              }}

              onPress={
                handleDelete
              }
            >

              <Text
                style={{
                  color: "#e53935",

                  fontSize: 15,

                  fontWeight: "600",
                }}
              >
                Delete
              </Text>

            </TouchableOpacity>

          )}

        </View>

      )}


      {/* ================================================= */}
      {/* LEFT TAP = PREVIOUS */}
      {/* ================================================= */}

      <TouchableOpacity
        activeOpacity={1}

        onPress={
          goToPreviousStatus
        }

        style={{
          position: "absolute",

          left: 0,

          top: 80,

          bottom: 80,

          width:
            screenWidth * 0.35,

          zIndex: 10,
        }}
      />


      {/* ================================================= */}
      {/* RIGHT TAP = NEXT */}
      {/* ================================================= */}

      <TouchableOpacity
        activeOpacity={1}

        onPress={
          goToNextStatus
        }

        style={{
          position: "absolute",

          right: 0,

          top: 80,

          bottom: 80,

          width:
            screenWidth * 0.35,

          zIndex: 10,
        }}
      />


      {/* ================================================= */}
      {/* STATUS IMAGE */}
      {/* ================================================= */}

      <View
        style={{
          flex: 1,

          justifyContent:
            "center",

          alignItems:
            "center",

          backgroundColor:
            "#000",
        }}
      >

        {currentImage ? (

          <Image
            source={{
              uri: currentImage,
            }}

            style={{
              width: "100%",

              height: "100%",
            }}

            resizeMode="contain"
          />

        ) : (

          <Ionicons
            name="image-outline"
            size={80}
            color="#555"
          />

        )}

      </View>


      {/* ================================================= */}
      {/* VIEWER COUNT BUTTON */}
      {/* ================================================= */}

      {isMine && (

        <TouchableOpacity
          activeOpacity={0.7}

          onPress={
            handleViewers
          }

          style={{
            position: "absolute",

            bottom: 55,

            left: 0,

            right: 0,

            zIndex: 30,

            flexDirection: "row",

            justifyContent:
              "center",

            alignItems:
              "center",

            paddingVertical: 10,
          }}
        >

          <Ionicons
            name="eye-outline"
            size={21}
            color="#fff"
          />


          <Text
            style={{
              color: "#fff",

              fontSize: 15,

              fontWeight: "600",

              marginLeft: 6,
            }}
          >
            {viewerCount}
          </Text>

        </TouchableOpacity>

      )}


      {/* ================================================= */}
      {/* VIEWERS MODAL */}
      {/* ================================================= */}

      <Modal
        visible={
          viewersVisible
        }

        transparent={true}

        animationType="slide"

        onRequestClose={() =>
          setViewersVisible(
            false
          )
        }
      >

        <SafeAreaView
          style={{
            flex: 1,

            backgroundColor:
              "rgba(0,0,0,0.55)",

            justifyContent:
              "flex-end",
          }}
        >

          <View
            style={{
              backgroundColor:
                "#fff",

              borderTopLeftRadius:
                25,

              borderTopRightRadius:
                25,

              maxHeight: "75%",

              paddingBottom: 20,
            }}
          >


            {/* =========================================== */}
            {/* VIEWERS HEADER */}
            {/* =========================================== */}

            <View
              style={{
                flexDirection:
                  "row",

                alignItems:
                  "center",

                justifyContent:
                  "space-between",

                paddingHorizontal:
                  20,

                paddingVertical:
                  18,

                borderBottomWidth:
                  1,

                borderBottomColor:
                  "#eee",
              }}
            >

              <View>

                <Text
                  style={{
                    fontSize: 19,

                    fontWeight: "700",

                    color: "#222",
                  }}
                >
                  Viewed by
                </Text>


                <Text
                  style={{
                    fontSize: 13,

                    color: "#777",

                    marginTop: 3,
                  }}
                >

                  {viewerCount}{" "}

                  {viewerCount === 1
                    ? "member"
                    : "members"}

                </Text>

              </View>


              {/* CLOSE */}

              <TouchableOpacity
                onPress={() =>
                  setViewersVisible(
                    false
                  )
                }

                style={{
                  width: 38,

                  height: 38,

                  borderRadius: 19,

                  backgroundColor:
                    "#f2f2f2",

                  justifyContent:
                    "center",

                  alignItems:
                    "center",
                }}
              >

                <Ionicons
                  name="close"
                  size={22}
                  color="#333"
                />

              </TouchableOpacity>

            </View>


            {/* =========================================== */}
            {/* LOADING */}
            {/* =========================================== */}

            {viewersLoading ? (

              <View
                style={{
                  height: 220,

                  justifyContent:
                    "center",

                  alignItems:
                    "center",
                }}
              >

                <ActivityIndicator
                  size="large"
                  color="#8e24aa"
                />


                <Text
                  style={{
                    marginTop: 10,

                    color: "#777",
                  }}
                >
                  Loading viewers...
                </Text>

              </View>

            ) : viewers.length === 0 ? (


              /* ========================================= */
              /* EMPTY VIEW */
              /* ========================================= */

              <View
                style={{
                  height: 220,

                  justifyContent:
                    "center",

                  alignItems:
                    "center",
                }}
              >

                <Ionicons
                  name="eye-off-outline"
                  size={50}
                  color="#aaa"
                />


                <Text
                  style={{
                    marginTop: 12,

                    fontSize: 15,

                    color: "#777",
                  }}
                >
                  No viewers yet
                </Text>

              </View>

            ) : (


              /* ========================================= */
              /* VIEWER LIST */
              /* ========================================= */

              <FlatList
                data={viewers}

                keyExtractor={(
                  item,
                  index
                ) =>
                  String(
                    item?.id ||
                    item?.username ||
                    item?.viewer_username ||
                    index
                  )
                }

                showsVerticalScrollIndicator={
                  false
                }

                contentContainerStyle={{
                  paddingVertical: 8,
                }}

                renderItem={({
                  item,
                }) => {

                  const viewerName =
                    getViewerName(
                      item
                    );


                  const username =
                    getViewerUsername(
                      item
                    );


                  const viewerImage =
                    getViewerImage(
                      item
                    );


                  return (

                    <TouchableOpacity
                      activeOpacity={0.7}

                      onPress={() =>
                        openViewerProfile(
                          item
                        )
                      }

                      style={{
                        flexDirection:
                          "row",

                        alignItems:
                          "center",

                        paddingHorizontal:
                          20,

                        paddingVertical:
                          12,
                      }}
                    >


                      {/* PROFILE IMAGE */}

                      <View
                        style={{
                          width: 52,

                          height: 52,

                          borderRadius: 26,

                          overflow:
                            "hidden",

                          backgroundColor:
                            "#eee",
                        }}
                      >

                        {viewerImage ? (

                          <Image
                            source={{
                              uri:
                                viewerImage,
                            }}

                            style={{
                              width:
                                "100%",

                              height:
                                "100%",
                            }}
                          />

                        ) : (

                          <View
                            style={{
                              flex: 1,

                              justifyContent:
                                "center",

                              alignItems:
                                "center",

                              backgroundColor:
                                "#e8dff0",
                            }}
                          >

                            <Ionicons
                              name="person"
                              size={26}
                              color="#8e24aa"
                            />

                          </View>

                        )}

                      </View>


                      {/* NAME */}

                      <View
                        style={{
                          flex: 1,

                          marginLeft: 14,
                        }}
                      >

                        <Text
                          style={{
                            fontSize: 16,

                            fontWeight:
                              "700",

                            color: "#222",
                          }}

                          numberOfLines={
                            1
                          }
                        >
                          {viewerName}
                        </Text>


                        {username ? (

                          <Text
                            style={{
                              fontSize: 13,

                              color: "#777",

                              marginTop: 3,
                            }}

                            numberOfLines={
                              1
                            }
                          >
                            @{username}
                          </Text>

                        ) : null}

                      </View>


                      {/* ARROW */}

                      <Ionicons
                        name="chevron-forward"
                        size={21}
                        color="#aaa"
                      />

                    </TouchableOpacity>

                  );

                }}

              />

            )}

          </View>

        </SafeAreaView>

      </Modal>


      {/* ================================================= */}
      {/* CONTACT PROFILE MODAL */}
      {/* ================================================= */}

      <Modal
        visible={
          profileVisible
        }

        transparent={true}

        animationType="fade"

        onRequestClose={
          closeViewerProfile
        }
      >

        <View
          style={{
            flex: 1,

            backgroundColor:
              "rgba(0,0,0,0.65)",

            justifyContent:
              "center",

            alignItems:
              "center",

            paddingHorizontal: 25,
          }}
        >

          <View
            style={{
              width: "100%",

              backgroundColor:
                "#fff",

              borderRadius: 24,

              padding: 25,

              alignItems:
                "center",
            }}
          >


            {/* =========================================== */}
            {/* CLOSE */}
            {/* =========================================== */}

            <TouchableOpacity
              onPress={
                closeViewerProfile
              }

              style={{
                position:
                  "absolute",

                right: 15,

                top: 15,

                width: 35,

                height: 35,

                borderRadius: 18,

                backgroundColor:
                  "#f2f2f2",

                justifyContent:
                  "center",

                alignItems:
                  "center",
              }}
            >

              <Ionicons
                name="close"
                size={21}
                color="#333"
              />

            </TouchableOpacity>


            {/* =========================================== */}
            {/* PROFILE IMAGE */}
            {/* =========================================== */}

            <View
              style={{
                width: 100,

                height: 100,

                borderRadius: 50,

                overflow:
                  "hidden",

                backgroundColor:
                  "#eee",

                marginTop: 10,
              }}
            >

              {selectedViewer &&
              getViewerImage(
                selectedViewer
              ) ? (

                <Image
                  source={{
                    uri:
                      getViewerImage(
                        selectedViewer
                      ),
                  }}

                  style={{
                    width: "100%",

                    height: "100%",
                  }}
                />

              ) : (

                <View
                  style={{
                    flex: 1,

                    justifyContent:
                      "center",

                    alignItems:
                      "center",

                    backgroundColor:
                      "#e8dff0",
                  }}
                >

                  <Ionicons
                    name="person"
                    size={55}
                    color="#8e24aa"
                  />

                </View>

              )}

            </View>


            {/* =========================================== */}
            {/* NAME */}
            {/* =========================================== */}

            <Text
              style={{
                marginTop: 15,

                fontSize: 22,

                fontWeight:
                  "700",

                color: "#222",
              }}
            >

              {selectedViewer
                ? getViewerName(
                    selectedViewer
                  )
                : "Unknown"}

            </Text>


            {/* =========================================== */}
            {/* USERNAME */}
            {/* =========================================== */}

            {selectedViewer &&
            getViewerUsername(
              selectedViewer
            ) ? (

              <Text
                style={{
                  marginTop: 5,

                  fontSize: 14,

                  color: "#777",
                }}
              >

                @
                {getViewerUsername(
                  selectedViewer
                )}

              </Text>

            ) : null}


            {/* =========================================== */}
            {/* PROFILE DETAILS */}
            {/* =========================================== */}

            <View
              style={{
                width: "100%",

                marginTop: 25,
              }}
            >


              {/* ======================================= */}
              {/* PHONE */}
              {/* ======================================= */}

              {selectedViewer?.phone ? (

                <View
                  style={{
                    flexDirection:
                      "row",

                    alignItems:
                      "center",

                    paddingVertical:
                      12,

                    borderBottomWidth:
                      1,

                    borderBottomColor:
                      "#eee",
                  }}
                >

                  <Ionicons
                    name="call-outline"
                    size={21}
                    color="#8e24aa"
                  />


                  <View
                    style={{
                      marginLeft: 15,
                    }}
                  >

                    <Text
                      style={{
                        fontSize: 12,

                        color: "#999",
                      }}
                    >
                      Phone
                    </Text>


                    <Text
                      style={{
                        fontSize: 15,

                        color: "#222",

                        marginTop: 2,
                      }}
                    >
                      {selectedViewer.phone}
                    </Text>

                  </View>

                </View>

              ) : null}


              {/* ======================================= */}
              {/* EMAIL */}
              {/* ======================================= */}

              {selectedViewer?.email ? (

                <View
                  style={{
                    flexDirection:
                      "row",

                    alignItems:
                      "center",

                    paddingVertical:
                      12,

                    borderBottomWidth:
                      1,

                    borderBottomColor:
                      "#eee",
                  }}
                >

                  <Ionicons
                    name="mail-outline"
                    size={21}
                    color="#8e24aa"
                  />


                  <View
                    style={{
                      marginLeft: 15,
                    }}
                  >

                    <Text
                      style={{
                        fontSize: 12,

                        color: "#999",
                      }}
                    >
                      Email
                    </Text>


                    <Text
                      style={{
                        fontSize: 15,

                        color: "#222",

                        marginTop: 2,
                      }}
                    >
                      {selectedViewer.email}
                    </Text>

                  </View>

                </View>

              ) : null}


              {/* ======================================= */}
              {/* ABOUT */}
              {/* ======================================= */}

              {selectedViewer?.about ? (

                <View
                  style={{
                    flexDirection:
                      "row",

                    alignItems:
                      "flex-start",

                    paddingVertical:
                      12,
                  }}
                >

                  <Ionicons
                    name="information-circle-outline"
                    size={21}
                    color="#8e24aa"
                  />


                  <View
                    style={{
                      marginLeft: 15,

                      flex: 1,
                    }}
                  >

                    <Text
                      style={{
                        fontSize: 12,

                        color: "#999",
                      }}
                    >
                      About
                    </Text>


                    <Text
                      style={{
                        fontSize: 15,

                        color: "#222",

                        marginTop: 2,
                      }}
                    >
                      {selectedViewer.about}
                    </Text>

                  </View>

                </View>

              ) : null}


              {/* ======================================= */}
              {/* NO EXTRA DETAILS */}
              {/* ======================================= */}

              {selectedViewer &&
              !selectedViewer.phone &&
              !selectedViewer.email &&
              !selectedViewer.about ? (

                <View
                  style={{
                    alignItems:
                      "center",

                    paddingVertical:
                      15,
                  }}
                >

                  <Ionicons
                    name="person-circle-outline"
                    size={30}
                    color="#aaa"
                  />


                  <Text
                    style={{
                      marginTop: 8,

                      fontSize: 14,

                      color: "#888",

                      textAlign:
                        "center",
                    }}
                  >
                    No additional profile
                    details available
                  </Text>

                </View>

              ) : null}

            </View>

          </View>

        </View>

      </Modal>


    </View>

  );

}