import { router, useLocalSearchParams } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import BACKEND_URL from "../config";

export default function ProfileScreen() {

  // ============================================================
  // GET PHONE NUMBER FROM index.tsx
  // ============================================================

  const { phone } = useLocalSearchParams<{
    phone: string;
  }>();

  // ============================================================
  // STATES
  // ============================================================

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [language, setLanguage] = useState("");
  const [gender, setGender] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ============================================================
  // PICK PROFILE IMAGE
  // ============================================================

  const pickImage = async () => {

    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      alert("Gallery permission required");
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // ============================================================
  // SAVE PROFILE
  // ============================================================

  const handleContinue = async () => {

    // Make sure phone number exists
    if (!phone) {
      alert(
        "Phone number is missing. Please go back and enter your mobile number."
      );
      return;
    }

    // Validate name
    if (!name.trim()) {
      alert("Name is required");
      return;
    }

    // Validate username
    if (!username.trim()) {
      alert("Username is required");
      return;
    }

    setLoading(true);

    try {

      const cleanUsername = username
        .trim()
        .replace(/^@/, "");

      // ========================================================
      // SEND PROFILE + PHONE NUMBER TO BACKEND
      // ========================================================

      const response = await fetch(
        `${BACKEND_URL}/app/profile/`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({

            // IMPORTANT
            phone_number: phone,

            name: name.trim(),

            username: cleanUsername,

            bio: bio.trim(),

            language: language,

            gender: gender,

            profile_image: image,
          }),
        }
      );

      const data = await response.json();

      console.log(
        "Profile response:",
        data
      );

      // ========================================================
      // SUCCESS
      // ========================================================

      if (response.ok) {

        router.replace({
          pathname: "/location",

          params: {
            username: cleanUsername,

            // Pass phone also
            phone: phone,
          },
        });

      }

      // ========================================================
      // ERROR
      // ========================================================

      else {

        alert(
          data.error ||
          "Failed to save profile"
        );

      }

    }

    catch (error) {

      console.error(
        "Profile save error:",
        error
      );

      alert(
        "Network error. Please make sure the backend is running."
      );

    }

    finally {

      setLoading(false);

    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <LinearGradient
      colors={["#FBD6FD", "#FFF7FD"]}
      style={{ flex: 1 }}
    >

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      >

        {/* =====================================================
            TITLE
        ===================================================== */}

        <Text className="text-[36px] font-bold text-center mt-[40px]">
          Create Your Profile
        </Text>

        <Text className="text-center text-[18px] text-[#B548F4] mt-[5px]">
          Let's get to know you better 💖
        </Text>


        {/* =====================================================
            PROFILE IMAGE
        ===================================================== */}

        <View className="self-center mt-[20px]">

          <TouchableOpacity
            className="absolute bottom-0 right-0 w-[35px] h-[35px] rounded-[18px] bg-[#D55AF6] justify-center items-center z-10"
            onPress={pickImage}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 16,
              }}
            >
              ✏️
            </Text>
          </TouchableOpacity>


          <TouchableOpacity
            onPress={pickImage}
          >

            {image ? (

              <Image
                source={{ uri: image }}
                className="w-[120px] h-[120px] rounded-[60px] border-[3px] border-[#9D6AFF] self-center justify-center items-center mt-[20px] bg-white"
              />

            ) : (

              <View className="w-[120px] h-[120px] rounded-[60px] border-[3px] border-[#9D6AFF] self-center justify-center items-center mt-[20px] bg-white">

                <FontAwesome
                  name="camera"
                  size={40}
                  color="#666"
                />

              </View>

            )}

          </TouchableOpacity>


          <TouchableOpacity
            className="absolute bottom-0 right-0 w-[35px] h-[35px] rounded-[18px] bg-[#D55AF6] justify-center items-center z-10"
            onPress={pickImage}
          >

            <FontAwesome
              name="pencil"
              size={18}
              color="#fff"
            />

          </TouchableOpacity>

        </View>


        {/* =====================================================
            PROFILE FORM
        ===================================================== */}

        <View
          className="m-[20px] p-[20px] bg-[#FFEFFC] rounded-[30px]"
          style={{
            elevation: 8,
          }}
        >

          {/* NAME */}

          <Text className="font-bold text-[18px] mb-[6px] mt-[10px]">
            Name
          </Text>

          <TextInput
            placeholder="Name"
            value={name}
            onChangeText={setName}
            className="border-[1.5px] border-[#D348F7] rounded-[15px] px-[15px] h-[55px] bg-white"
          />


          {/* USERNAME */}

          <Text className="font-bold text-[18px] mb-[6px] mt-[10px]">
            Username
          </Text>

          <TextInput
            placeholder="@ username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            className="border-[1.5px] border-[#D348F7] rounded-[15px] px-[15px] h-[55px] bg-white"
          />


          {/* BIO */}

          <Text className="font-bold text-[18px] mb-[6px] mt-[10px]">
            Bio
          </Text>

          <TextInput
            placeholder="Tell us about the magic in your life..."
            multiline
            numberOfLines={4}
            value={bio}
            onChangeText={setBio}
            className="border-[1.5px] border-[#D348F7] rounded-[15px] px-[15px] h-[90px] bg-white"
          />


          {/* LANGUAGE */}

          <Text className="font-bold text-[18px] mb-[6px] mt-[10px]">
            Language
          </Text>

          <View className="border-[1.5px] border-[#D348F7] rounded-[15px] bg-white mt-[5px]">

            <Picker
              selectedValue={language}
              onValueChange={(itemValue) =>
                setLanguage(itemValue)
              }
            >

              <Picker.Item
                label="Choose Language"
                value=""
              />

              <Picker.Item
                label="Tamil"
                value="Tamil"
              />

              <Picker.Item
                label="English"
                value="English"
              />

              <Picker.Item
                label="Hindi"
                value="Hindi"
              />

              <Picker.Item
                label="Malayalam"
                value="Malayalam"
              />

              <Picker.Item
                label="Telugu"
                value="Telugu"
              />

              <Picker.Item
                label="Kannada"
                value="Kannada"
              />

            </Picker>

          </View>


          {/* GENDER */}

          <Text className="font-bold text-[18px] mb-[6px] mt-[10px]">
            Gender
          </Text>

          <View className="flex-row justify-between mt-[15px]">

            {/* MALE */}

            <TouchableOpacity
              className="flex-row items-center"
              onPress={() =>
                setGender("Male")
              }
            >

              <View
                className={`w-[20px] h-[20px] rounded-[10px] border-[2px] border-[#999] mr-[5px] ${
                  gender === "Male"
                    ? "bg-[#D348F7]"
                    : ""
                }`}
              />

              <Text>
                Male
              </Text>

            </TouchableOpacity>


            {/* FEMALE */}

            <TouchableOpacity
              className="flex-row items-center"
              onPress={() =>
                setGender("Female")
              }
            >

              <View
                className={`w-[20px] h-[20px] rounded-[10px] border-[2px] border-[#999] mr-[5px] ${
                  gender === "Female"
                    ? "bg-[#D348F7]"
                    : ""
                }`}
              />

              <Text>
                Female
              </Text>

            </TouchableOpacity>


            {/* OTHER */}

            <TouchableOpacity
              className="flex-row items-center"
              onPress={() =>
                setGender("Other")
              }
            >

              <View
                className={`w-[20px] h-[20px] rounded-[10px] border-[2px] border-[#999] mr-[5px] ${
                  gender === "Other"
                    ? "bg-[#D348F7]"
                    : ""
                }`}
              />

              <Text>
                Other
              </Text>

            </TouchableOpacity>

          </View>

        </View>


        {/* =====================================================
            CONTINUE BUTTON
        ===================================================== */}

        <TouchableOpacity
          onPress={handleContinue}
          disabled={loading}
        >

          <LinearGradient
            colors={["#F553E7", "#6B63FF"]}
            style={{
              height: 55,
              marginHorizontal: 90,
              borderRadius: 30,
              justifyContent: "center",
              alignItems: "center",
              opacity: loading ? 0.6 : 1,
            }}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >

            {loading ? (

              <ActivityIndicator
                size="small"
                color="#000"
              />

            ) : (

              <Text className="text-[24px] font-bold text-black">
                Continue
              </Text>

            )}

          </LinearGradient>

        </TouchableOpacity>

      </ScrollView>

    </LinearGradient>
  );
}