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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false); // Manage visibility
  const baseUrl = "http://127.0.0.1:8000/api/auth/login/";

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(baseUrl, { email, password });
      const { token } = response.data;

      await AsyncStorage.setItem("userToken", token);

      Alert.alert("Login Successful", "You are now logged in!");
      navigation.navigate("Home");
    } catch (error) {
      setLoading(false);

      if (axios.isAxiosError(error) && error.response) {
        Alert.alert("Error", error.response.data?.error || "Invalid credentials.");
      } else {
        Alert.alert("Error", "An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#FFFFFF", "#BDE0FE"]} // Light to blue gradient
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      className="flex-1 justify-center items-center"
    >
      <View className="items-center mt-[-30%] mb-5">
        <Image
          source={require("../assets/images/logo2.png")}
          style={{
            width: Dimensions.get("window").width * 1.0,
            height: Dimensions.get("window").width * 1.0,
          }}
          resizeMode="contain"
        />
      </View>

      <View className="w-4/5 mt-[1%]">
        <View className="flex-row items-center bg-white rounded-full px-4 py-2 mb-4 shadow-md">
          <Ionicons name="person-outline" size={20} color="#003366" />
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="#003366"
            className="flex-1 ml-2 text-gray-800 text-base"
          />
        </View>

        <View className="flex-row items-center bg-white rounded-full px-4 py-2 shadow-md">
          <Ionicons name="lock-closed-outline" size={20} color="#003366" />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="#003366"
            secureTextEntry={!passwordVisible} // Toggle visibility
            className="flex-1 ml-2 text-gray-800 text-base"
          />
          <TouchableOpacity
            onPress={() => setPasswordVisible(!passwordVisible)} // Toggle visibility state
          >
            <Ionicons
              name={passwordVisible ? "eye-outline" : "eye-off-outline"}
              size={20}
              color="#003366"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className="mt-6 bg-blue-400 rounded-full py-3 shadow-lg"
          onPress={handleLogin}
          disabled={loading}
        >
          <Text className="text-center text-white font-bold text-lg">
            {loading ? "Logging in..." : "Log in"}
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}
