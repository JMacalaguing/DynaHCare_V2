import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient"; // For gradient background
import { Ionicons } from "@expo/vector-icons"; // For icons
import axios from "axios";
import { useAuth } from "./AuthContext"; // Import useAuth
import config from "./config";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function LoginScreen({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false); // Manage visibility
  const [modalVisible, setModalVisible] = useState(false); // Manage popup visibility
  const [modalMessage, setModalMessage] = useState(""); // Message for the popup

  // Destructure the login function from useAuth
  const { login } = useAuth();

  useEffect(() => {
    const checkAuthentication = async () => {
      const token = await AsyncStorage.getItem("userToken");
      if (token) {
        // If token exists, navigate to Home
        navigation.navigate("Home");
      }
    };

    checkAuthentication();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      setModalMessage("Please enter both email and password.");
      setModalVisible(true);
      return;
    }

    try {
      setLoading(true);

      // Step 1: Log in and get the user's details
      const response = await axios.post(`${config.BASE_URL}/api/auth/login/`, { email, password });
      const { token, user } = response.data; // Destructure the user details

      // Step 2: Use the login function from AuthContext
      // This will handle both the state update and storing the token/userName
      login(token, user.full_name);

      // Step 3: Notify user and navigate to Home
      setModalMessage("Login Successful! Redirecting...");
      setModalVisible(true);

      setTimeout(() => {
        setModalVisible(false);
        navigation.navigate("Home");
      }, 1500);
    } catch (error) {
      setLoading(false);

      if (axios.isAxiosError(error) && error.response) {
        setModalMessage(error.response.data?.error || "Invalid credentials.");
      } else {
        setModalMessage("An unexpected error occurred.");
      }

      setModalVisible(true);
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
      {/* Logo */}
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

      {/* Login Form */}
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

      {/* Popup Modal */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-lg p-5 shadow-md w-4/5">
            <Text className="text-lg font-bold text-gray-800 text-center">
              {modalMessage}
            </Text>
            <TouchableOpacity
              className="mt-5 bg-blue-400 py-2 px-4 rounded-full self-center"
              onPress={() => setModalVisible(false)}
            >
              <Text className="text-white font-bold">OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}