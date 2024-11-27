import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons"; // For the icons
import axios, { AxiosError } from 'axios';

export function SignUpScreen() {
  // State for form inputs
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const baseUrl = "http://127.0.0.1:8000/"

const handleSignUp = async () => {
  if (!fullName || !phoneNumber || !email || !password) {
    Alert.alert("Error", "Please fill in all fields.");
    return;
  }

  try {
    // Use the baseUrl in the axios request
    const response = await axios.post(`${baseUrl}/admin/user/api/signup/`, {
      full_name: fullName,
      phone_number: phoneNumber,
      email,
      password,
      username: email,
    });

    // Handle success
    Alert.alert("Success", "Signup successful!");
    console.log("Response:", response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Axios-specific error handling
      console.error("Axios error:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.error || "Signup failed.");
    } else {
      // Generic error handling
      console.error("Unexpected error:", error);
      Alert.alert("Error", "An unexpected error occurred.");
    }
  }
};

  

  return (
    <LinearGradient
      colors={["#FFFFFF", "#BDE0FE"]} // Light to blue gradient
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      className="flex-1 justify-center items-center"
    >
      {/* Container for the form */}
      <View className="w-4/5 items-center py-8">
        {/* Title */}
        <Text className="text-6xl font-bold text-blue-800 mb-6">
          Get Admin {"\n"}Permission
        </Text>

        {/* Input Fields */}
        <View className="w-full space-y-4">
          {/* Full Name */}
          <View className="flex-row items-center bg-white rounded-full px-4 py-2 shadow-md mb-3">
            <Ionicons name="person-outline" size={20} color="#003366" />
            <TextInput
              placeholder="Full Name"
              placeholderTextColor="#003366"
              value={fullName}
              onChangeText={setFullName}
              className="flex-1 ml-2 text-gray-800 text-base"
            />
          </View>

          {/* Phone Number */}
          <View className="flex-row items-center bg-white rounded-full px-4 py-2 shadow-md mb-3">
            <Ionicons name="call-outline" size={20} color="#003366" />
            <TextInput
              placeholder="Phone Number"
              placeholderTextColor="#003366"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              className="flex-1 ml-2 text-gray-800 text-base"
            />
          </View>

          {/* Email */}
          <View className="flex-row items-center bg-white rounded-full px-4 py-2 shadow-md mb-3">
            <Ionicons name="mail-outline" size={20} color="#003366" />
            <TextInput
              placeholder="Email"
              placeholderTextColor="#003366"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              className="flex-1 ml-2 text-gray-800 text-base"
            />
          </View>

          {/* Password */}
          <View className="flex-row items-center bg-white rounded-full px-4 py-2 shadow-md">
            <Ionicons name="lock-closed-outline" size={20} color="#003366" />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#003366"
              secureTextEntry={true}
              value={password}
              onChangeText={setPassword}
              className="flex-1 ml-2 text-gray-800 text-base"
            />
          </View>
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity
          onPress={handleSignUp}
          className="mt-8 bg-blue-400 rounded-full py-3 w-full shadow-lg"
        >
          <Text className="text-center text-white font-bold text-lg">
            Sign up
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}
