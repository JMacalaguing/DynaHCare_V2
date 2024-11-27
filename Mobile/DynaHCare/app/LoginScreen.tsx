import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient"; // For gradient background
import { Ionicons } from "@expo/vector-icons"; // For icons
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage"; // For storing the token

export function LoginScreen({ navigation }: { navigation: any }) {
  // State variables for storing the username, password, and loading state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const baseUrl = "http://192.168.1.2/"
  // Function to handle login
  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please enter both username and password.");
      return;
    }

    try {
      setLoading(true);

      // Make the POST request to your Django backend
      const response = await axios.post(`${baseUrl}/admin/user/api/login/`, {
        username,
        password,
      });

      // Get the token from the response
      const { token } = response.data;

      // Save the token to AsyncStorage
      await AsyncStorage.setItem("userToken", token);

      // Navigate to the Home screen after successful login
      navigation.navigate("Home");

      // Reset the loading state
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error logging in:", error);
      Alert.alert("Error", "Invalid credentials or something went wrong.");
    }
  };

  return (
    <LinearGradient
      colors={["#FFFFFF", "#BDE0FE"]} // Light to blue gradient
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      className="flex-1 justify-center items-center"
    >
      {/* Logo Section */}
      <View className="items-center mt-[-30%] mb-5">
        <Image
          source={require("../assets/images/logo2.png")}
          style={{
            width: Dimensions.get("window").width * 1.0, // Reduced size for better fit
            height: Dimensions.get("window").width * 1.0, // Maintain proportion
          }}
          resizeMode="contain"
        />
      </View>

      {/* Form Section */}
      <View className="w-4/5 mt-[1%]">
        {/* Username Input */}
        <View className="flex-row items-center bg-white rounded-full px-4 py-2 mb-4 shadow-md">
          <Ionicons name="person-outline" size={20} color="#003366" />
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Username"
            placeholderTextColor="#003366"
            className="flex-1 ml-2 text-gray-800 text-base"
          />
        </View>

        {/* Password Input */}
        <View className="flex-row items-center bg-white rounded-full px-4 py-2 shadow-md">
          <Ionicons name="lock-closed-outline" size={20} color="#003366" />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="#003366"
            secureTextEntry={true}
            className="flex-1 ml-2 text-gray-800 text-base"
          />
        </View>

        {/* Login Button */}
        <TouchableOpacity
          className="mt-6 bg-blue-400 rounded-full py-3 shadow-lg"
          onPress={handleLogin}
          disabled={loading} // Disable button while loading
        >
          <Text className="text-center text-white font-bold text-lg">
            {loading ? "Logging in..." : "Log in"}
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}
