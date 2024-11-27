import React from "react";
import { Text, View, TouchableOpacity, Image, Dimensions } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
// Get screen dimensions
const { width } = Dimensions.get("window");

export default function MainScreen({ navigation }: { navigation: any }) {
  return (
    <LinearGradient
          colors={["#FFFFFF", "#BDE0FE"]} // Light to blue gradient
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <View className="flex-1  justify-center items-center">
      {/* Logo Section */}
      <View className="absolute top-[10%]">
        <Image
          source={require("../assets/images/logo.png")}
          style={{
            width: width * 1.1, // 50% of screen width
            height: width * 1.1, // Maintain a square aspect ratio
          }}
          resizeMode="contain"
        />
      </View>

      {/* Text Below Logo */}
      <View className="mt-[45%]">
          {/* Buttons Section */}
          <View className="mt-5 w-full items-center">
            {/* Login Button */}
            <TouchableOpacity
              className="bg-white w-[60%] py-4 rounded-full shadow-lg mb-4"
              onPress={() => navigation.navigate("Login")} // Navigate to Login screen
            >
              <Text className="text-[#003366] font-bold text-lg text-center">
                Log in
              </Text>
            </TouchableOpacity>

            {/* Sign Up Button */}
            <TouchableOpacity
              className="bg-blue-400 w-[60%] py-4 rounded-full shadow-lg"
              onPress={() => navigation.navigate("SignUp")} // Navigate to SignUp screen
            >
              <Text className="text-[#003366] font-bold text-lg text-center">
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
    </View>
    
    </LinearGradient>
  );
}
