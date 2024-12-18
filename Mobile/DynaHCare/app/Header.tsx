import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Modal, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage"; // For AsyncStorage

type HeaderProps = {
  title: string; // Screen title
  navigation: any; // React Navigation prop for navigation
};

export const Header = ({ title, navigation }: HeaderProps) => {
  const [isSidebarVisible, setSidebarVisible] = useState(false);

  const toggleSidebar = () => setSidebarVisible(!isSidebarVisible);
  const [userName, setUserName] = useState<string>("");


    // Fetch the username from AsyncStorage when the sidebar is mounted
    useEffect(() => {
      const fetchUserName = async () => {
        try {
          const name = await AsyncStorage.getItem("userName");
          if (name) {
            setUserName(name); // Update the state with the retrieved username
          }
        } catch (error) {
          console.error("Failed to fetch username from AsyncStorage:", error);
        }
      };
  
      fetchUserName();
    }, []); // Runs once when the component is mounted

  return (
    <View>
      {/* Header */}
      <View className="flex-row items-center px-4 py-2 bg-white shadow-md">
        {/* Menu Icon */}
        <TouchableOpacity onPress={toggleSidebar}>
          <Ionicons name="menu-outline" size={28} color="#003366" />
        </TouchableOpacity>
        {/* Title */}
        <View className="flex-1 items-center">
          <Text className="text-2xl font-bold text-blue-800">{title}</Text>
        </View>
      </View>

      {/* Sidebar Modal */}
      <Modal
        transparent
        visible={isSidebarVisible}
        animationType="slide"
        onRequestClose={toggleSidebar}
      >
        <View className="flex-1 bg-black/50 justify-start">
          <View className="h-full w-3/4 bg-white shadow-lg">
            {/* Sidebar Header */}
            <View className="flex items-center p-6 bg-blue-100 shadow-md">
              <Image
                source={require("../assets/images/logo2.png")}
                style={{ width: 60, height: 60, resizeMode: "contain" }}
              />
              <Text className="mt-2 text-lg font-bold text-blue-800">{userName || "Guest User"}</Text>
              <Text className="text-sm text-gray-500">User</Text>
            </View>

            {/* Go Back Button */}
            <TouchableOpacity
              className="flex-row items-center mt-6 py-2 px-4"
              onPress={() => {
                setSidebarVisible(false); // Close the sidebar
                navigation.navigate("Home"); // Navigate to homeScreen
              }}
            >
              <Ionicons name="arrow-back" size={24} color="#003366" />
              <Text className="ml-2 text-lg text-blue-800">Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default  Header;

