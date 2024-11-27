import React from "react";
import { View } from "react-native";
import { Header } from "./Header"; // Import the Header component
import { AdminChat } from "./AdminChat"; // Import the chat component

export function AdminRequestScreen({ navigation }: { navigation: any }) {
  return (
    <View className="flex-1 bg-blue-100">
      {/* Header */}
      <Header
        title="DynaHCare"
        navigation={navigation} // Pass the navigation prop here
      />

      {/* Chat Interface */}
      <AdminChat />
    </View>
  );
}
