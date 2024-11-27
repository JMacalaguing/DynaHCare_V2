import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function FormDetailsScreen({ route, navigation }: { route: any; navigation: any }) {
  const { form } = route.params; // Get form data from route

  return (
    <View className="flex-1 bg-blue-100">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 bg-white shadow-md">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={28} color="#003366" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-blue-800 ml-4">View Form</Text>
      </View>

      {/* Form Details */}
      <View className="m-4 p-4 bg-white rounded-lg shadow-md">
        <Text className="text-lg font-bold text-blue-900 mb-2">
          Updated List
        </Text>
        <View className="border-2 border-blue-200 rounded-md p-2 mb-4">
          <Text>{form.title}</Text>
        </View>

        <Text className="text-lg font-bold text-blue-900 mb-2">Unsaved</Text>
        <View className="border-2 border-blue-200 rounded-md p-2 mb-4">
          <Text>{form.responses}</Text>
        </View>

        <TouchableOpacity className="bg-blue-800 rounded-lg px-4 py-3">
          <Text className="text-white text-center font-bold">Load</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
