import React from "react";
import { View, Text, TouchableOpacity, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
  if (!isVisible) return null;

  const handleMenuPress = (name: string, action?: () => void) => {
    if (action) {
      action();
    } else {
      setActiveTab(name);
      onClose();
      if (name === "Admin Request") {
        navigation.navigate("Admin"); // Navigate to Admin Request
      }
    }
  };

  return (
    <View className="absolute top-0 left-0 h-full w-full z-10 flex-row">
      {/* Sidebar Content */}
      <View className="h-full w-2/3 bg-white shadow-lg">
        <View className="flex items-center p-10 bg-blue-100 shadow-md">
          <Image
            source={require("../assets/images/logo2.png")}
            style={{ width: 60, height: 60, resizeMode: "contain" }}
          />
          <Text className="text-lg font-bold text-blue-800">Jane Marie Doe</Text>
          <Text className="text-sm text-gray-500">User</Text>
        </View>
        <View className="">
          {[
            { name: "Home", icon: "home-outline" },
            { name: "Admin Request", icon: "clipboard-outline" },
            { name: "Log Out", icon: "log-out-outline", action: () => navigation.navigate("Login") },
          ].map((item) => (
            <TouchableOpacity
              key={item.name}
              className={`flex-row items-center p-4 ${
                activeTab === item.name ? "bg-blue-200" : "bg-white"
              }`}
              onPress={() => handleMenuPress(item.name, item.action)}
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
