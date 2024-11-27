import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Sidebar } from "./Sidebar"; 

type Form = {
  id: string;
  title: string;
  responses: string;
  updated: string;
};

export function HomeScreen({ navigation }: { navigation: any }) {
  const [forms, setForms] = useState<Form[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("Home");

  useEffect(() => {
    setForms([
      { id: "1", title: "Immunization", responses: "10", updated: "2024-11-22" },
      { id: "2", title: "Maternal Care", responses: "20", updated: "2024-11-21" },
      { id: "3", title: "ChildCare", responses: "15", updated: "2024-11-20" },
      { id: "4", title: "Tuberculosis", responses: "8", updated: "2024-11-19" },
    ]);
  }, []);

  const filteredForms = forms.filter((form) =>
    form.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <LinearGradient
      colors={["#FFFFFF", "#BDE0FE"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      className="flex-1"
    >
      {/* Header */}
      <View className="flex-row items-center px-4 py-2 bg-white shadow-md">
        <TouchableOpacity onPress={() => setSidebarVisible(!isSidebarVisible)}>
          <Ionicons name="menu-outline" size={28} color="#003366" />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className="text-2xl font-bold text-blue-800">DynaHcare</Text>
        </View>
      </View>

      {/* Sidebar */}
      <Sidebar
        isVisible={isSidebarVisible}
        onClose={() => setSidebarVisible(false)}
        navigation={navigation}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Search Section */}
      <View className="flex-row items-center px-4 mt-4">
        <TextInput
          placeholder="Search Form"
          placeholderTextColor="#003366"
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="flex-1 bg-white rounded-full px-4 py-4 shadow-md border-2 border-blue-200 font-bold"
        />
        <TouchableOpacity className="ml-2">
          <Ionicons name="search" size={24} color="#003366" />
        </TouchableOpacity>
      </View>

      {/* Form List */}
    <FlatList
      data={filteredForms}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View className="flex-row justify-between items-center bg-blue-200 rounded-lg px-4 py-3 my-2 mx-4 shadow-md">
          {/* Form Details (Clickable Area) */}
          <TouchableOpacity
            className="flex-1" // Ensures the details occupy the available space
            onPress={() => navigation.navigate("FormInput", { form: item })} // Navigate to FormInputScreen
          >
            <View>
              <Text className="text-lg font-bold text-blue-900">{item.title}</Text>
              <Text className="text-sm text-gray-700">Responses: {item.responses}</Text>
              <Text className="text-sm text-gray-700">Updated: {item.updated}</Text>
            </View>
          </TouchableOpacity>

          {/* "View" Button */}
          <TouchableOpacity
            className="bg-blue-800 rounded-full px-4 py-2 ml-2" // Position the button beside the form details
            onPress={() => navigation.navigate("FormDetails", { form: item })} // Navigate to FormDetailsScreen
          >
            <Text className="text-white font-bold">View</Text>
          </TouchableOpacity>
        </View>
      )}
    />
    </LinearGradient>
  );
}
