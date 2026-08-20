import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { Ionicons, Zocial } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { getSession } from "../services/session";

import {
  fetchMyStatus,
  fetchStatusFeed,
  postStatus,
  StatusItem,
} from "../services/api";


export default function Status() {

  // =========================================================
  // USER DATA
  // =========================================================

  const [username, setUsername] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [profileImage, setProfileImage] = useState<string>("");


  // =========================================================
  // STATUS DATA
  // =========================================================

  // All my statuses
  const [myStatuses, setMyStatuses] = useState<StatusItem[]>([]);

  // All contact statuses
  const [feed, setFeed] = useState<StatusItem[]>([]);


  // =========================================================
  // UI STATES
  // =========================================================

  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");


  // =========================================================
  // LOAD STATUS DATA
  // =========================================================

  const loadData = useCallback(async () => {

    setLoading(true);
    setError("");

    try {

      const session = await getSession();

      if (!session.username) {
        setError("Please login first");
        return;
      }


      // Save user information
      setUsername(session.username);
      setName(session.name || session.username);
      setProfileImage(session.profileImage || "");


      // Fetch my statuses + contact statuses
      const [mine, others] = await Promise.all([
        fetchMyStatus(session.username),
        fetchStatusFeed(session.username),
      ]);


      // =====================================================
      // IMPORTANT:
      // KEEP ALL MY STATUSES
      // =====================================================

      const myStatusList = [...(mine.results || [])].sort(
  (a, b) =>
    new Date(a.created_at).getTime() -
    new Date(b.created_at).getTime()
);

setMyStatuses(myStatusList);


      // =====================================================
      // KEEP ALL CONTACT STATUSES
      // =====================================================

      const contactStatusList = [...(others.results || [])].sort(
  (a, b) =>
    new Date(a.created_at).getTime() -
    new Date(b.created_at).getTime()
);

  setFeed(contactStatusList);

    } catch (e: any) {

      console.warn("STATUS LOAD ERROR:", e);

      setError(
        e?.message ||
        "Could not load Moments from the server"
      );

    } finally {

      setLoading(false);

    }

  }, []);


  // Reload whenever this screen gets focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );


  // =========================================================
  // ADD NEW MOMENT
  // =========================================================

  const handleAddMoment = async () => {

    if (!username) {

      Alert.alert(
        "Login required",
        "Please login first."
      );

      return;
    }


    try {

      // Request gallery permission
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();


      if (!permission.granted) {

        Alert.alert(
          "Permission required",
          "Gallery permission is required to add a Moment."
        );

        return;
      }


      // Open gallery
      const result =
        await ImagePicker.launchImageLibraryAsync({

          mediaTypes: ["images"],

          allowsEditing: true,

          quality: 1,

        });


      // User cancelled
      if (result.canceled) {
        return;
      }


      const selectedImage =
        result.assets?.[0]?.uri;


      if (!selectedImage) {
        return;
      }


      setPosting(true);


      // =====================================================
      // CREATE NEW STATUS
      // DOES NOT REPLACE OLD STATUS
      // =====================================================

      await postStatus({

        username,

        name,

        profile_image: profileImage,

        content_image: selectedImage,

      });


      // Reload all statuses
      await loadData();


    } catch (e: any) {

      console.warn(
        "ADD MOMENT ERROR:",
        e
      );


      Alert.alert(
        "Error",
        e?.message ||
        "Could not post your Moment"
      );


    } finally {

      setPosting(false);

    }

  };


  // =========================================================
  // OPEN MY MOMENTS
  // =========================================================

  const openMyMoment = () => {

    // If no status exists,
    // open gallery directly
    if (myStatuses.length === 0) {

      handleAddMoment();

      return;
    }


    // Send ALL my statuses
    const statusesJson =
      JSON.stringify(myStatuses);


    // Start from first status
    const firstStatus =
      myStatuses[0];


    router.push({

      pathname: "/status-view",

      params: {

        id: firstStatus.id,

        mine: "true",


        // First status image
        image:
          firstStatus.content_image ||
          profileImage,


        name:
          firstStatus.name ||
          name,


        profileImage:
          firstStatus.profile_image ||
          profileImage,


        createdAt:
          new Date(
            firstStatus.created_at
          ).toLocaleTimeString([], {

            hour: "2-digit",

            minute: "2-digit",

          }),


        // =================================================
        // SEND ALL MY STATUSES
        // =================================================

        statuses:
          statusesJson,


        // Start from first status
        currentIndex: "0",

      },

    });

  };


  // =========================================================
  // OPEN CONTACT MOMENT
  // =========================================================

  const openContactMoment = (
    item: StatusItem
  ) => {


    // =====================================================
    // GET ALL STATUSES BELONGING TO THIS CONTACT
    // =====================================================

    const contactStatuses =
      feed.filter(
        (status) =>
          status.username === item.username
      );


    // =====================================================
    // PUT THE TAPPED STATUS FIRST
    // =====================================================

    const sortedStatuses = [

      item,

      ...contactStatuses.filter(
        (status) =>
          status.id !== item.id
      ),

    ];


    // =====================================================
    // OPEN STATUS VIEW
    // =====================================================

    router.push({

      pathname: "/status-view",

      params: {

        id: item.id,

        // This is NOT my status
        mine: "false",


        // Tapped contact status
        image:
          item.content_image ||
          item.profile_image,


        name:
          item.name ||
          item.username,


        profileImage:
          item.profile_image ||
          "",


        createdAt:
          new Date(
            item.created_at
          ).toLocaleTimeString([], {

            hour: "2-digit",

            minute: "2-digit",

          }),


        // =================================================
        // SEND ONLY THIS CONTACT'S STATUSES
        // =================================================

        statuses:
          JSON.stringify(
            sortedStatuses
          ),


        // Start from tapped status
        currentIndex: "0",

      },

    });

  };


  // =========================================================
  // CREATE UNIQUE CONTACT LIST
  // =========================================================
  //
  // If Madhav has 3 statuses:
  //
  // Madhav status 1
  // Madhav status 2
  // Madhav status 3
  //
  // Recent Updates should show Madhav only ONCE.
  //
  // =========================================================

  const recentContacts: StatusItem[] = [];

  const contactMap =
    new Map<string, StatusItem>();


  feed.forEach((item) => {

    const key =
      item.username ||
      item.name ||
      item.id;


    if (!contactMap.has(key)) {

      contactMap.set(
        key,
        item
      );

    }

  });


  contactMap.forEach((item) => {

    recentContacts.push(item);

  });


  // =========================================================
  // MAIN UI
  // =========================================================

  return (

    <LinearGradient

      colors={[
        "#ffe7f5",
        "#ffffff",
        "#f6e5ff",
      ]}

      style={{
        flex: 1,
        paddingTop: 55,
        paddingHorizontal: 16,
      }}

    >

      {/* ================================================= */}
      {/* PAGE TITLE */}
      {/* ================================================= */}

      <Text
        className="
          text-[30px]
          font-bold
          text-[#b03dd7]
          mb-[20px]
        "
      >
        Moments
      </Text>


      {/* ================================================= */}
      {/* ERROR */}
      {/* ================================================= */}

      {error ? (

        <Text
          className="
            text-[15px]
            text-[#B00020]
            mb-[15px]
          "
        >
          {error}
        </Text>

      ) : (

        <>

          {/* ================================================= */}
          {/* TODAY */}
          {/* ================================================= */}

          <Text
            className="
              text-[20px]
              font-semibold
              text-[#444]
              mb-[15px]
              mt-[10px]
            "
          >
            Today
          </Text>


          {/* ================================================= */}
          {/* MY MOMENT */}
          {/* ================================================= */}

          <TouchableOpacity

            className="
              flex-row
              items-center
              mb-[20px]
            "

            onPress={() =>
              openMyMoment()
            }

            disabled={posting}

          >

            {/* ================================================= */}
            {/* PROFILE IMAGE */}
            {/* ================================================= */}

            <View>

              {myStatuses.length > 0 ? (

                <Image

                  source={{
                    uri:
                      myStatuses[0]
                        .content_image ||
                      profileImage,
                  }}

                  className="
                    w-[60px]
                    h-[60px]
                    rounded-[30px]
                    border-[3px]
                    border-[#00d26a]
                    mr-[15px]
                  "

                />

              ) : profileImage ? (

                <Image

                  source={{
                    uri: profileImage,
                  }}

                  className="
                    w-[60px]
                    h-[60px]
                    rounded-[30px]
                    border-[3px]
                    border-[#ccc]
                    mr-[15px]
                  "

                />

              ) : (

                <View
                  className="
                    w-[60px]
                    h-[60px]
                    rounded-[30px]
                    border-[3px]
                    border-[#ccc]
                    mr-[15px]
                    items-center
                    justify-center
                    bg-white
                  "
                >

                  <Ionicons
                    name="person"
                    size={28}
                    color="#999"
                  />

                </View>

              )}


              {/* ================================================= */}
              {/* PLUS BUTTON */}
              {/* ================================================= */}

              <TouchableOpacity

                onPress={handleAddMoment}

                disabled={posting}

                className="
                  absolute
                  bottom-0
                  right-[10px]
                  w-[22px]
                  h-[22px]
                  rounded-[11px]
                  bg-[#b03dd7]
                  items-center
                  justify-center
                  border-[2px]
                  border-white
                "

              >

                {posting ? (

                  <ActivityIndicator
                    size="small"
                    color="#fff"
                  />

                ) : (

                  <Ionicons
                    name="add"
                    size={15}
                    color="#fff"
                  />

                )}

              </TouchableOpacity>

            </View>


            {/* ================================================= */}
            {/* MY MOMENT TEXT */}
            {/* ================================================= */}

            <View>

              <Text
                className="
                  text-[18px]
                  font-bold
                  text-[#222]
                "
              >
                My Moment
              </Text>


              <Text
                className="
                  text-[14px]
                  text-[#666]
                  mt-[4px]
                "
              >

                {myStatuses.length > 0

                  ? `Viewed by ${
                      myStatuses[0]
                        .viewer_count
                    } ${
                      myStatuses[0]
                        .viewer_count === 1
                        ? "member"
                        : "members"
                    }`

                  : "Tap to add a status update"

                }

              </Text>


              {/* ================================================= */}
              {/* NUMBER OF MOMENTS */}
              {/* ================================================= */}

              {myStatuses.length > 1 && (

                <Text
                  className="
                    text-[12px]
                    text-[#999]
                    mt-[2px]
                  "
                >
                  {myStatuses.length} Moments
                </Text>

              )}

            </View>

          </TouchableOpacity>


          {/* ================================================= */}
          {/* RECENT UPDATES */}
          {/* ================================================= */}

          <Text
            className="
              text-[20px]
              font-semibold
              text-[#444]
              mb-[15px]
              mt-[10px]
            "
          >
            Recent Updates
          </Text>


          <FlatList

            data={recentContacts}

            keyExtractor={(item) =>
              item.username ||
              item.id
            }

            showsVerticalScrollIndicator={
              false
            }


            ListEmptyComponent={

              <Text
                className="
                  text-[14px]
                  text-[#777]
                  mt-[10px]
                "
              >
                No recent Moments from your
                contacts yet
              </Text>

            }


            renderItem={({ item }) => (

              <TouchableOpacity

                className="
                  flex-row
                  items-center
                  mb-[20px]
                "

                // =================================================
                // IMPORTANT:
                // SEND THE CONTACT ITEM
                // =================================================

                onPress={() =>
                  openContactMoment(item)
                }

              >

                {/* ================================================= */}
                {/* CONTACT STATUS IMAGE */}
                {/* ================================================= */}

                <Image

                  source={{
                    uri:
                      item.content_image ||
                      item.profile_image,
                  }}

                  className={`
                    w-[60px]
                    h-[60px]
                    rounded-[30px]
                    border-[3px]
                    mr-[15px]

                    ${
                      item.viewed_by_me
                        ? "border-[#ccc]"
                        : "border-[#00d26a]"
                    }
                  `}

                />


                {/* ================================================= */}
                {/* CONTACT NAME + TIME */}
                {/* ================================================= */}

                <View>

                  <Text
                    className="
                      text-[18px]
                      font-bold
                      text-[#222]
                    "
                  >
                    {item.name}
                  </Text>


                  <Text
                    className="
                      text-[14px]
                      text-[#666]
                      mt-[4px]
                    "
                  >

                    {new Date(
                      item.created_at
                    ).toLocaleTimeString([], {

                      hour: "2-digit",

                      minute: "2-digit",

                    })}

                  </Text>

                </View>

              </TouchableOpacity>

            )}

          />

        </>

      )}


      {/* ================================================= */}
      {/* BOTTOM NAVIGATION */}
      {/* ================================================= */}

      <View
        className="
          absolute
          left-0
          right-0
          bottom-0
          h-[60px]
          flex-row
          justify-around
          items-center
          bg-white
          rounded-t-[25px]
        "
      >

        {/* ALL */}

        <TouchableOpacity
          onPress={() =>
            router.push("/all")
          }
        >

          <Ionicons
            name="document-text-outline"
            size={28}
            color="#777"
          />

        </TouchableOpacity>


        {/* STATUS */}

        <TouchableOpacity>

          <Zocial
            name="statusnet"
            size={28}
            color="#b03dd7"
          />

        </TouchableOpacity>


        {/* GIFT */}

        <TouchableOpacity>

          <Ionicons
            name="gift-outline"
            size={28}
            color="#777"
          />

        </TouchableOpacity>


        {/* PROFILE */}

        <TouchableOpacity
          onPress={() =>
            router.push("/profile")
          }
        >

          <Ionicons
            name="person-outline"
            size={28}
            color="#777"
          />

        </TouchableOpacity>

      </View>

    </LinearGradient>

  );
}