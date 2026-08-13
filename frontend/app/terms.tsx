import React from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function Terms() {
  return (
    <LinearGradient
      colors={["#FBD0FD", "#FDE2FB", "#FFF9FE"]}
      style={{ flex: 1, paddingTop: 50, paddingHorizontal: 20, marginBottom: 30 }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-[20px]">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name="arrow-back"
            size={30}
            color="#8A2BE2"
          />
        </TouchableOpacity>

        <Text className="text-[24px] font-bold text-[#8A2BE2]">Terms & Conditions</Text>

        {/* Spacer to center the title */}
        <View style={{ width: 30 }} />
      </View>

      {/* Content */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-[17px] text-[#333] leading-[28px]">
          Welcome to Niningo.

          {"\n\n"}By using this application, you agree to the following Terms and Conditions. Please read them carefully before using our services.

          {"\n\n"}1. Users must provide accurate and genuine information while creating an account.

          {"\n\n"}2. Your mobile number is used only for authentication through OTP verification.

          {"\n\n"}3. Users are responsible for maintaining the confidentiality of their account information.

          {"\n\n"}4. Do not upload harmful, offensive, illegal, or misleading content.

          {"\n\n"}5. Respect other users and avoid abusive or inappropriate behaviour.

          {"\n\n"}6. We reserve the right to suspend or remove accounts that violate these terms.

          {"\n\n"}7. Features and services may be updated or modified without prior notice.

          {"\n\n"}8. Continued use of the application indicates your acceptance of these Terms and Conditions.

          {"\n\n"}Thank you for being a part of Niningo.
        </Text>
      </ScrollView>
    </LinearGradient>
  );
}