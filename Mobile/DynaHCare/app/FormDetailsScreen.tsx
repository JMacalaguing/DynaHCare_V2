import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import config from "./config";

export function FormDetailsScreen({ route, navigation }: { route: any; navigation: any }) {
  const { formId } = route.params; // Get formId from route
  const [form, setForm] = useState<any>(null); // State to store form data
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const fetchFormDetails = async () => {
      try {
        const response = await fetch(`${config.BASE_URL}/formbuilder/api/forms/${formId}/`);
        if (!response.ok) {
          throw new Error("Failed to fetch form details");
        }
        const data = await response.json();
        setForm(data); // Set the form data
      } catch (error) {
        console.error("Error fetching form details:", error);
        Alert.alert("Error", "Failed to load form details. Please try again later.");
      } finally {
        setLoading(false); // Hide loading indicator
      }
    };

    fetchFormDetails();
  }, [formId]);

  if (loading) {
    return <ActivityIndicator size="large" color="#003366" style={{ marginTop: 20 }} />;
  }

  if (!form) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-lg text-red-500">Form not found.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-blue-100">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 shadow-md">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={28} color="#003366" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-blue-800 ml-4">Form Information</Text>
      </View>

      {/* Form Details */}
      <View className="m-5 p-4 bg-white rounded-lg shadow-md">
        <Text className="text-lg font-bold text-blue-900">Form Title</Text>
        <View className="shadow-md rounded-md p-8 ">
          <Text className="">{form.title}</Text>
        </View>

        <Text className="text-lg font-bold text-blue-900 ">Description</Text>
        <View className="shadow-md rounded-md p-8 mb-4">
          <Text className="">{form.description || "No description available"}</Text>
        </View>

        <Text className="text-lg font-bold text-blue-900 ">Status</Text>
        <View className="shadow-md rounded-md p-8 mb-4">
          <Text className="">{form.status || "No description available"}</Text>
        </View>
      </View>
    </View>
  );
}
export default FormDetailsScreen;
