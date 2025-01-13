import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, Pressable } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "./AuthContext";

type SidebarProps = {
  isVisible: boolean;
  onClose: () => void;
  navigation: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

export const Sidebar: React.FC<SidebarProps> = ({
  isVisible,
  onClose,
  navigation,
  activeTab,
  setActiveTab,
}) => {
  const [userName, setUserName] = useState<string>("");
  const { logout } = useAuth(); 

  // Fetch the username from AsyncStorage when the sidebar is mounted
  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const name = await AsyncStorage.getItem("userName");
        setUserName(name || "Guest User");
      } catch (error) {
        console.error("Failed to fetch username from AsyncStorage:", error);
        setUserName("Guest User");
      }
    };

    fetchUserName();
  }, []);

  if (!isVisible) return null;

  const handleMenuPress = (name: string) => {
    setActiveTab(name);
    onClose();
    switch (name) {
      case "Local Storage":
        navigation.navigate("local");
        break;
      case "Consultation LogBook":
        navigation.navigate("Consult");
        break;
      case "Log Out":
        logout(); 
        break;
      default:
        break;
    }
  };

  const menuItems = [
    { name: "Forms", icon: "home-outline" },
    { name: "Consultation LogBook", icon: "newspaper-outline" },
    { name: "Local Storage", icon: "file-tray-stacked-outline" },
    { name: "Log Out", icon: "log-out-outline" },
  ];

  return (
    <View className="absolute top-0 left-0 h-full w-full z-10 flex-row">
      {/* Sidebar Content */}
      <View className="h-full w-2/3 bg-white shadow-lg">
        <View className="flex items-center p-10 bg-blue-100 shadow-md">
          <Image
            source={require("../assets/images/logo2.png")}
            style={{ width: 60, height: 60, resizeMode: "contain" }}
          />
          <Text className="text-lg font-bold text-blue-800">{userName}</Text>
          <Text className="text-sm text-gray-500">User</Text>
        </View>
        <View className="">
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.name}
              className={`flex-row items-center p-4 ${
                activeTab === item.name ? "bg-blue-200" : "bg-white"
              }`}
              onPress={() => handleMenuPress(item.name)}
              accessibilityLabel={`Go to ${item.name}`}
            >
              <Ionicons
                name={item.icon as keyof typeof Ionicons.glyphMap}
                size={20}
                color={activeTab === item.name ? "#003366" : "#555"}
              />
              <Text
                className={`ml-4 text-lg ${
                  activeTab === item.name ? "text-blue-800 font-bold" : "text-gray-700"
                }`}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Transparent Overlay */}
      <Pressable className="h-full w-1/3 bg-transparent" onPress={onClose} />
    </View>
  );
};

export default Sidebar;
