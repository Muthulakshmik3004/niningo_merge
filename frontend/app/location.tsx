import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform,
  StyleSheet,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { Ionicons, MaterialIcons, Entypo } from "@expo/vector-icons";
import BACKEND_URL from "../config";
import { saveSession } from "../services/session";

let MapView: any;
let Marker: any;

if (Platform.OS !== "web") {
  try {
    const Maps = require("react-native-maps");
    MapView = Maps.default || Maps;
    Marker = Maps.Marker;
  } catch (error) {
    console.warn("Could not load react-native-maps dynamically", error);
  }
}

export default function LocationScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const [home, setHome] = useState("");
  const [homeCoords, setHomeCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const [office, setOffice] = useState("");
  const [officeCoords, setOfficeCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const getLocation = async (type: "home" | "office") => {
    setLoading(true);
    try {
      // 1. Check if location services are enabled on the device
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        Alert.alert(
          "Location Disabled",
          "GPS/Location services are turned off on your device. Please turn them on in your device settings."
        );
        setLoading(false);
        return;
      }

      // 2. Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permissions are required to automatically register your coordinates."
        );
        setLoading(false);
        return;
      }

      // 3. Retrieve location (Try last known first for speed, then current position)
      let location = await Location.getLastKnownPositionAsync({});
      if (!location) {
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
      }

      if (!location || !location.coords) {
        Alert.alert("Location Error", "Could not query location coordinates from device GPS.");
        setLoading(false);
        return;
      }

      const { latitude, longitude } = location.coords;
      const coords = { latitude, longitude };

      // 4. Save coordinates to state immediate so UI updates
      if (type === "home") {
        setHomeCoords(coords);
        setHome(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      } else {
        setOfficeCoords(coords);
        setOffice(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      }

      // 5. Try reverse geocoding in a separate try-catch so it doesn't block coords setting
      try {
        const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (addresses && addresses.length > 0) {
          const addr = addresses[0];
          const formatted = [
            addr.name,
            addr.street,
            addr.city,
            addr.region,
            addr.postalCode,
          ]
            .filter(Boolean)
            .join(", ");

          if (formatted) {
            if (type === "home") {
              setHome(formatted);
            } else {
              setOffice(formatted);
            }
          }
        }
      } catch (geoErr) {
        console.warn("Geocoding address lookup failed, kept raw lat/lng:", geoErr);
      }

    } catch (error: any) {
      console.error(error);
      Alert.alert(
        "Location Retrieval Error",
        error?.message || "An unexpected error occurred while grabbing your location."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    if (!home) {
      Alert.alert("Requirement Missing", "Home Location is required.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${BACKEND_URL}/app/api/locations/save/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username || "",
          home_address: home,
          home_latitude: homeCoords?.latitude || null,
          home_longitude: homeCoords?.longitude || null,
          office_address: office,
          office_latitude: officeCoords?.latitude || null,
          office_longitude: officeCoords?.longitude || null,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        if (username) await saveSession({ username: String(username) });
        Alert.alert("Success", "Locations captured and saved successfully!", [
          { text: "OK", onPress: () => router.push("/all") }
        ]);
      } else {
        Alert.alert("Error Saving", data.error || "Failed to save locations backend side.");
      }
    } catch (err: any) {
      console.error("Save locations error:", err);
      Alert.alert(
        "Connection Error",
        `Could not reach the backend server at: ${BACKEND_URL}\n\nEnsure the backend is running, and that your phone/emulator is on the same network.\n\nError details: ${err.message || err}`,
        [
          { text: "Fix Connection", style: "cancel" },
          { text: "Continue anyway", onPress: async () => { if (username) await saveSession({ username: String(username) }); router.push("/all"); } }
        ]
      );
    } finally {
      setSaving(false);
    }
  };

  const mapRegion = officeCoords
    ? {
      latitude: officeCoords.latitude,
      longitude: officeCoords.longitude,
      latitudeDelta: 0.015,
      longitudeDelta: 0.015,
    }
    : homeCoords
      ? {
        latitude: homeCoords.latitude,
        longitude: homeCoords.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      }
      : null;

  return (
    <LinearGradient
      colors={["#FBD0FD", "#FDE2FB", "#FFF9FE"]}
      style={{ flex: 1 }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40 }}
      >
        {/* Header */}
        <View className="flex-row items-center mb-[25px]">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="#222" />
          </TouchableOpacity>

          <View className="flex-1">
            <Text className="text-[28px] font-bold text-[#222] ml-[15px]">Choose Location</Text>
            <Text className="text-[14px] text-[#C14AF4] ml-[15px] mt-[3px]">
              Let's find your locations to get started
            </Text>
          </View>
        </View>

        {loading && (
          <View className="bg-white/80 rounded-[15px] p-[10px] items-center mb-[15px] flex-row justify-center">
            <ActivityIndicator size="small" color="#C14AF4" />
            <Text className="ml-[10px] text-[#C14AF4] font-semibold">Capturing coordinates...</Text>
          </View>
        )}

        {/* Home Location Card */}
        <View
          className="bg-[#FFF8FC] rounded-[25px] p-[25px] mb-[20px]"
          style={{
            elevation: 8,
            shadowColor: "#D55AF6",
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.18,
            shadowRadius: 8,
          }}
        >
          <View className="flex-row items-center mb-[12px]">
            <MaterialIcons name="home" size={22} color="#C14AF4" />
            <Text className="text-[18px] font-bold ml-[8px] text-[#222]">Home Location</Text>
            <Text className="text-red-500 text-[18px] ml-[5px]">*</Text>
          </View>

          <TextInput
            className="border-[1.5px] border-[#D55AF6] rounded-[14px] h-[52px] px-[15px] bg-white text-[15px] text-[#222]"
            placeholder="Enter home address"
            value={home}
            onChangeText={setHome}
          />

          {homeCoords && (
            <View className="flex-row items-center mt-[10px] bg-[#F3E5F5] py-[6px] px-[12px] rounded-[10px]">
              <Entypo name="location-pin" size={14} color="#7B1FA2" />
              <Text className="text-[12px] text-[#7B1FA2] font-semibold ml-[4px]">
                Captured: {homeCoords.latitude.toFixed(6)}, {homeCoords.longitude.toFixed(6)}
              </Text>
            </View>
          )}

          <TouchableOpacity
            className="flex-row items-center justify-center mt-[12px] h-[48px] border-[1.5px] border-[#D55AF6] rounded-[24px] bg-white"
            onPress={() => getLocation("home")}
          >
            <Entypo name="location-pin" size={20} color="#222" />
            <Text className="ml-[8px] text-[15px] font-semibold text-[#222]">
              Use Current Location
            </Text>
          </TouchableOpacity>
        </View>

        {/* Office Location Card */}
        <View
          className="bg-[#FFF8FC] rounded-[25px] p-[25px] mb-[20px]"
          style={{
            elevation: 8,
            shadowColor: "#D55AF6",
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.18,
            shadowRadius: 8,
          }}
        >
          <View className="flex-row items-center mb-[12px]">
            <MaterialIcons name="work-outline" size={22} color="#C14AF4" />
            <Text className="text-[18px] font-bold ml-[8px] text-[#222]">Office Location</Text>
          </View>

          <TextInput
            className="border-[1.5px] border-[#D55AF6] rounded-[14px] h-[52px] px-[15px] bg-white text-[15px] text-[#222]"
            placeholder="Enter office address"
            value={office}
            onChangeText={setOffice}
          />

          {officeCoords && (
            <View className="flex-row items-center mt-[10px] bg-[#E8EAF6] py-[6px] px-[12px] rounded-[10px]">
              <Entypo name="location-pin" size={14} color="#303F9F" />
              <Text className="text-[12px] text-[#303F9F] font-semibold ml-[4px]">
                Captured: {officeCoords.latitude.toFixed(6)}, {officeCoords.longitude.toFixed(6)}
              </Text>
            </View>
          )}

          <TouchableOpacity
            className="flex-row items-center justify-center mt-[12px] h-[48px] border-[1.5px] border-[#D55AF6] rounded-[24px] bg-white"
            onPress={() => getLocation("office")}
          >
            <Entypo name="location-pin" size={20} color="#222" />
            <Text className="ml-[8px] text-[15px] font-semibold text-[#222]">
              Use Current Location
            </Text>
          </TouchableOpacity>
        </View>

        {/* Map Preview of Captured Coordinates */}
        {mapRegion && Platform.OS !== "web" && MapView && (
          <View
            className="bg-white rounded-[25px] p-[16px] mb-[25px]"
            style={{
              elevation: 8,
              shadowColor: "#D55AF6",
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.18,
              shadowRadius: 8,
            }}
          >
            <Text className="text-[16px] font-bold text-[#333] mb-[12px]">
              Location Map Preview
            </Text>

            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={mapRegion}
                region={mapRegion}
              >
                {homeCoords && (
                  <Marker
                    coordinate={homeCoords}
                    title="Home Location"
                    description="Your captured Home placement"
                    pinColor="#A855F7"
                  />
                )}
                {officeCoords && (
                  <Marker
                    coordinate={officeCoords}
                    title="Office Location"
                    description="Your captured Office placement"
                    pinColor="#3F51B5"
                  />
                )}
              </MapView>
            </View>
          </View>
        )}

        {/* Continue Button */}
        <TouchableOpacity
          onPress={handleContinue}
          disabled={saving}
          style={{ marginTop: 10 }}
        >
          <LinearGradient
            colors={saving ? ["#E0E0E0", "#9E9E9E"] : ["#F553E7", "#6B63FF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              height: 55,
              borderRadius: 30,
              justifyContent: "center",
              alignItems: "center",
              marginHorizontal: 40,
            }}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text className="text-[22px] font-bold text-black">Continue</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    height: 200,
    width: "100%",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "#EAD6FD",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});