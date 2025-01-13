import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Sidebar } from "./Sidebar";
import config from "./config";

type Form = {
  id: string;
  title: string;
};

export function HomeScreen({ navigation }: { navigation: any }) {
  const [forms, setForms] = useState<Form[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("Home");
  const [loading, setLoading] = useState(false);

  const FORMS_STORAGE_KEY = "forms_data";

  // Fetch forms from the API and update local storage
  const fetchForms = async () => {
    setLoading(true); // Show loading indicator
    try {
      const response = await fetch(`${config.BASE_URL}/formbuilder/api/forms/`);
      if (!response.ok) {
        throw new Error("Failed to fetch forms");
      }
      const data = await response.json();
      setForms(data); // Set forms in state

      // Save to AsyncStorage
      await AsyncStorage.setItem(FORMS_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.log("Error fetching forms:", error);
      Alert.alert("Offline Mode", "Failed to load forms.Using only offline data.");
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  // Load forms from local storage on component mount
  useEffect(() => {
    const loadForms = async () => {
      try {
        const storedForms = await AsyncStorage.getItem(FORMS_STORAGE_KEY);
        if (storedForms) {
          setForms(JSON.parse(storedForms)); // Use local data if available
        }
      } catch (error) {
        console.error("Error loading local forms:", error);
      } finally {
        fetchForms(); // Fetch new data from the server
      }
    };

    loadForms();
  }, []);

  // Filter forms based on the search query
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
          placeholderTextColor="#1e40af"
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="flex-1 bg-white rounded-full px-4 py-4 shadow-md border-2 border-blue-200 font-bold"
        />
        <TouchableOpacity className="ml-2">
          <Ionicons name="search" size={24} color="#1e40af" />
        </TouchableOpacity>
      </View>

      {/* Loading Indicator */}
      {loading ? (
        <ActivityIndicator size="large" color="#003366" style={{ marginTop: 20 }} />
      ) : (
        /* Form List */
        <FlatList
          data={filteredForms}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="flex-row justify-between items-center bg-blue-200 rounded-lg px-4 py-3 my-2 mx-4 shadow-md">
              {/* Form Details (Clickable Area) */}
              <TouchableOpacity
                onPress={() => navigation.navigate("FormInput", { formId: item.id })} // Pass only formId
                style={{ flex: 1, marginRight: 10 }} // Ensure it takes the remaining space
              >
                <View className="flex-row items-center">
                  <Ionicons name="document-text" size={28} color="#1e40af" />
                  <Text
                    className="text-2xl font-bold text-blue-800 ml-3"
                    numberOfLines={1} // Limit to one line
                    ellipsizeMode="tail" // Show ellipses if text is too long
                  >
                    {item.title}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* "View" Button */}
              <TouchableOpacity
                className="ml-2"
                onPress={() => navigation.navigate("FormDetails", { formId: item.id })} // Pass formId
              >
                <Ionicons name="ellipsis-vertical" size={28} color="#1e40af" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </LinearGradient>
  );
}

export default HomeScreen;
