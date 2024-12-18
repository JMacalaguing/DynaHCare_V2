import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import config from "./config";

export function SignUpScreen({ navigation }: { navigation: any }) {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showRejectedModal, setShowRejectedModal] = useState(false);

  const baseUrl = `${config.BASE_URL}/api/auth/signup/`;
  const statusUrl = `${config.BASE_URL}/api/auth/approve/`;

  const handleSignUp = async () => {
    if (!fullName || !phoneNumber || !email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    try {
      await axios.post(baseUrl, {
        full_name: fullName,
        phone_number: phoneNumber,
        email,
        password,
        username: email,
      });
      setShowPendingModal(true);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || "Signup failed.";
        console.error("Signup error:", errorMessage);
        Alert.alert("Error", errorMessage);
      } else {
        console.error("An unknown error occurred:", error);
        Alert.alert("Error", "An unknown error occurred.");
      }
    }
  };

  const checkStatus = async () => {
    try {
      const response = await axios.get(statusUrl, { params: { email } });
      const status = response.data.status;

      if (status === "approved") {
        setShowPendingModal(false);
        setShowSuccessModal(true);
      } else if (status === "rejected") {
        setShowPendingModal(false);
        setShowRejectedModal(true);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || "Status check failed.";
        console.error("Status check error:", errorMessage);
        Alert.alert("Error", errorMessage);
      } else {
        console.error("An unknown error occurred:", error);
        Alert.alert("Error", "An unknown error occurred.");
      }
    }
  };

  useEffect(() => {
    if (showPendingModal) {
      const interval = setInterval(() => {
        checkStatus();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [showPendingModal]);

  return (
    <LinearGradient
      colors={["#FFFFFF", "#BDE0FE"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      className="flex-1 justify-center items-center"
    >
      <View className="w-4/5 items-center py-8">
        <Text className="text-6xl font-bold text-blue-800 mb-6">
          Get Admin {"\n"}Permission
        </Text>

        <View className="w-full space-y-4">
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

        <TouchableOpacity
          onPress={handleSignUp}
          className="mt-8 bg-blue-400 rounded-full py-3 w-full shadow-lg"
        >
          <Text className="text-center text-white font-bold text-lg">
            Sign up
          </Text>
        </TouchableOpacity>
      </View>

      {/* Pending Approval Modal */}
      <Modal transparent visible={showPendingModal} animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="w-80 bg-white rounded-lg p-6 items-center">
            <Text className="text-lg font-bold text-center mb-4">
              Pending Admin Approval...
            </Text>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal transparent visible={showSuccessModal} animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="w-80 bg-white rounded-lg p-6 items-center">
            <Text className="text-lg font-bold text-center mb-4">
              Successfully Registered!
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowSuccessModal(false);
                navigation.navigate("Main");
              }}
              className="mt-2 bg-blue-500 rounded-full py-2 px-6 shadow-md"
            >
              <Text className="text-white font-bold">Go to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Rejected Modal */}
      <Modal transparent visible={showRejectedModal} animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="w-80 bg-white rounded-lg p-6 items-center">
            <Text className="text-lg font-bold text-center mb-4">
              Your registration has been rejected.
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowRejectedModal(false);
                navigation.navigate("Main");
              }}
              className="mt-2 bg-red-500 rounded-full py-2 px-6 shadow-md"
            >
              <Text className="text-white font-bold">Go to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

export default  SignUpScreen;
