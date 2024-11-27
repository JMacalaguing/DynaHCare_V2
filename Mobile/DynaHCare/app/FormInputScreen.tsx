import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function FormInputScreen({ route, navigation }: { route: any; navigation: any }) {
  const { form } = route.params; // Get the form data
  const [inputData, setInputData] = useState({}); // State to hold form inputs

  // Handle input change
  const handleInputChange = (field: string, value: string) => {
    setInputData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollView className="flex-1 bg-blue-100">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 bg-white shadow-md">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={28} color="#003366" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-blue-800 ml-4">{form.title}</Text>
      </View>

      {/* Form Inputs */}
      <View className="m-4 p-4 bg-white rounded-lg shadow-md">
        <Text className="text-lg font-bold text-blue-900 mb-4">
          Fill the form for: {form.title}
        </Text>

        {/* Example Form Fields */}
        <Text className="text-sm font-bold text-blue-900 mb-2">Field 1</Text>
        <TextInput
          placeholder="Enter data for Field 1"
          className="border-2 border-blue-200 rounded-md p-2 mb-4"
          onChangeText={(value) => handleInputChange("field1", value)}
        />

        <Text className="text-sm font-bold text-blue-900 mb-2">Field 2</Text>
        <TextInput
          placeholder="Enter data for Field 2"
          className="border-2 border-blue-200 rounded-md p-2 mb-4"
          onChangeText={(value) => handleInputChange("field2", value)}
        />

        <TouchableOpacity
          className="bg-blue-800 rounded-lg px-4 py-3 mt-4"
          onPress={() => console.log(inputData)} // Save the form data
        >
          <Text className="text-white text-center font-bold">Submit</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
