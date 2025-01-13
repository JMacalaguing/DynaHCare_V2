import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, Dimensions,Image } from "react-native";
import axios from "axios";
import config from "./config";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export function ResetPasswordScreen({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [modalVisibleSend, setModalVisibleSend] = useState(false); // Modal for sending reset code
  const [modalMessageSend, setModalMessageSend] = useState(""); // Message for sending reset code
  const [modalVisibleReset, setModalVisibleReset] = useState(false); // Modal for resetting password
  const [modalMessageReset, setModalMessageReset] = useState(""); // Message for resetting password
  const [isCodeSent, setIsCodeSent] = useState(false); // Track if reset code has been sent

  // Function to send the reset code to the email
  const handleSendResetCode = async () => {
    if (!email) {
      setModalMessageSend("Please enter your email.");
      setModalVisibleSend(true);
      return;
    }

    try {
      const response = await axios.post(`${config.BASE_URL}/api/auth/forgot-password/`, { email });
      setModalMessageSend(response.data.message || "Reset code sent successfully.");
      setIsCodeSent(true); // Set the flag to show the next form
    } catch (error) {
      setModalMessageSend("An error occurred. Please try again.");
    } finally {
      setModalVisibleSend(true);
    }
  };

  // Function to handle the password reset
  const handlePasswordReset = async () => {
    if (!resetCode || !newPassword) {
      setModalMessageReset("Please fill in all fields.");
      setModalVisibleReset(true);
      return;
    }

    try {
      const response = await axios.post(`${config.BASE_URL}/api/auth/reset-password/`, {
        email,
        code: resetCode,
        new_password: newPassword,
      });
      setModalMessageReset(response.data.message || "Password reset successful.");

      if (response.data.success) {
        // Navigate to the Login page after successful reset
        setTimeout(() => {
          navigation.navigate('Login');
        }, 300); // Add a short delay to ensure modal closes before navigation
      }
    } catch (error) {
      setModalMessageReset("An error occurred. Please try again.");
    } finally {
      setModalVisibleReset(true);
    }
  };

  // Close the send reset code modal
  const handleOkPressSend = () => {
    setModalVisibleSend(false);
  };

  // Close the reset password modal
  const handleOkPressReset = () => {
    setModalVisibleReset(false);
    navigation.navigate('Login')
  };

  return (
        <LinearGradient
          colors={["#FFFFFF", "#BDE0FE"]}
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
              height: Dimensions.get("window").width * 1.0,}}
              resizeMode="contain"
              />
            </View>
    <View className=" justify-center items-center ">
      <Text className="text-4xl font-bold text-blue-800 mb-6">Reset Password</Text>

      {/* Step 1: Email Input */}
      {!isCodeSent ? (
        <>

        <View className="flex-row items-center bg-white rounded-full px-4 py-2 mb-4 shadow-md w-80">
          <Ionicons name="person-outline" size={20} color="#003366" />
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="#003366"
            className="flex-1 ml-2 text-gray-800 text-base"
          />
        </View>
          <TouchableOpacity
            className="mt-2 bg-blue-400 rounded-full py-3 shadow-lg w-60"
            onPress={handleSendResetCode}
          >
            <Text className="text-center text-white font-bold text-lg">Send Reset Code</Text>
          </TouchableOpacity>
        </>
      ) : (
        // Step 2: Reset Code and New Password Inputs
        <>
          <View className="flex-row items-center bg-white rounded-full px-4 py-2 mb-4 shadow-md w-80">
          <TextInput
            value={resetCode}
            onChangeText={setResetCode}
            placeholder="Reset code"
            placeholderTextColor="#003366"
            className="flex-1 ml-2 text-gray-800 text-base"
          />
        </View>
        <View className="flex-row items-center bg-white rounded-full px-4 py-2 mb-4 shadow-md w-80">
          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="New password"
            placeholderTextColor="#003366"
            className="flex-1 ml-2 text-gray-800 text-base"
          />
        </View>
          <TouchableOpacity
            className="mt-2 bg-blue-400 rounded-full py-3 shadow-lg w-60"
            onPress={handlePasswordReset}
          >
            <Text className="text-center text-white font-bold text-lg">Reset Password</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Modal for sending reset code */}
      <Modal transparent={true} animationType="slide" visible={modalVisibleSend}>
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-lg p-5 shadow-md w-4/5">
            <Text className="text-lg font-bold text-gray-800 text-center">{modalMessageSend}</Text>
            <TouchableOpacity
              className="mt-5 bg-blue-400 py-2 px-4 rounded-full self-center"
              onPress={handleOkPressSend}
            >
              <Text className="text-white font-bold">OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal for resetting password */}
      <Modal transparent={true} animationType="slide" visible={modalVisibleReset}>
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-lg p-5 shadow-md w-4/5">
            <Text className="text-lg font-bold text-gray-800 text-center">{modalMessageReset}</Text>
            <TouchableOpacity
              className="mt-5 bg-blue-400 py-2 px-4 rounded-full self-center"
              onPress={handleOkPressReset}
            >
              <Text className="text-white font-bold">OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View></LinearGradient>
  );
}

export default ResetPasswordScreen;
