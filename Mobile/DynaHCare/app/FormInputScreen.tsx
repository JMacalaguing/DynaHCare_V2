import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, Modal, TouchableOpacity, ScrollView } from "react-native";
import Checkbox from "expo-checkbox";
import { useRoute } from "@react-navigation/native";
import config from "./config";
import { Ionicons } from '@expo/vector-icons';

interface Field {
  id: string;
  label: string;
  type: string;
  options?: string | string[];
}

interface Section {
  id: string;
  sectionname: string;
  fields: Field[];
}

interface FormData {
  id: number;
  title: string;
  schema: string | { sections: Section[] };
}

interface FormValues {
  [sectionId: string]: {
    [fieldId: string]: string | string[];
  };
}

const FormInputScreen = ({ navigation }: { navigation: any }) => {
  const route = useRoute();
  const { formId } = route.params as { formId: string };
  const [formData, setFormData] = useState<FormData | null>(null);
  const [formValues, setFormValues] = useState<FormValues>({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function fetchForm() {
      try {
        const response = await fetch(`${config.BASE_URL}/formbuilder/api/forms/${formId}/`);
        if (!response.ok) {
          throw new Error("Failed to fetch form details.");
        }
        const data = await response.json();

        let parsedSchema;
        if (typeof data.schema === "string") {
          const correctedSchema = data.schema.replace(/'/g, '"');
          parsedSchema = JSON.parse(correctedSchema);
        } else {
          parsedSchema = data.schema;
        }

        setFormData({ ...data, schema: parsedSchema });
      } catch (error) {
        console.error("Error fetching form data:", error);
      }
    }

    fetchForm();
  }, [formId]);

  useEffect(() => {
    if (formData && typeof formData.schema === "object" && "sections" in formData.schema) {
      const initialValues: FormValues = {};

      formData.schema.sections.forEach((section) => {
        initialValues[section.id] = {};
        section.fields.forEach((field) => {
          initialValues[section.id][field.id] = field.type === "checkbox-group" ? [] : "";
        });
      });

      setFormValues(initialValues);
    }
  }, [formData]);

  const handleInputChange = (sectionId: string, fieldId: string, value: string | string[]) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      [sectionId]: {
        ...prevValues[sectionId],
        [fieldId]: value,
      },
    }));
  };

  const parseOptions = (options: string | string[] | undefined): string[] => {
    if (!options) return [];
    if (Array.isArray(options)) return options;
    return options.split(",").map((opt) => opt.trim());
  };

  const handleSubmit = async () => {
    try {
      const dataToSend = { response_data: formValues };
      const response = await fetch(`http://192.168.1.10:8081/formbuilder/api/forms/${formId}/submit/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        throw new Error("Failed to submit form.");
      }

      const responseData = await response.json();
      console.log("Form submitted successfully:", responseData);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    navigation.navigate("Home"); // Redirect after closing the modal
  };

  if (!formData) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg font-semibold">Loading form...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-blue-100">
  {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4 bg-white shadow-md">
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <Ionicons name="arrow-back-outline" size={28} color="#1E3A8A" /> {/* text-blue-800 */}
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-blue-800 text-center flex-1">
          {formData.title}
        </Text>
      </View>

  {formData.schema && typeof formData.schema === "object" && "sections" in formData.schema ? (
    formData.schema.sections.map((section: Section, sectionIndex) => {
      const sectionId = section.id || `section-${sectionIndex}`;
      return (
        <View
          key={sectionId}
          className="bg-white shadow-md rounded-lg m-4 p-4"
        >
          {/* Section Header */}
          <View className="bg-blue-800 m-[-15] p-2 mb-2 rounded-t-md">
          <Text className="text-xl font-bold mb-2 text-white">{section.sectionname}</Text>
          </View>
          {/* Section Fields */}
          {section.fields.map((field: Field, fieldIndex) => {
            const fieldId = field.id || `${sectionId}-field-${fieldIndex}`;
            return (
              <View key={fieldId} className="mb-4">
                <Text className="text-base font-medium mb-1 text-gray-700">{field.label}</Text>

                {field.type === "text" || field.type === "number" || field.type === "email" || field.type === "date" ? (
                  <TextInput
                    className="border-2 border-blue-200 p-2 rounded-md"
                    keyboardType={field.type === "number" ? "numeric" : "default"}
                    value={Array.isArray(formValues[sectionId]?.[fieldId]) 
                      ? formValues[sectionId]?.[fieldId].join(", ") 
                      : (formValues[sectionId]?.[fieldId] || "")}
                    onChangeText={(value) => handleInputChange(sectionId, fieldId, value)}
                  />
                ) : field.type === "checkbox-group" ? (
                  <View>
                    {parseOptions(field.options).map((option, index) => (
                      <View key={index} className="flex-row items-center mb-2">
                        <Checkbox
                          value={formValues[sectionId]?.[fieldId]?.includes(option) || false}
                          onValueChange={(checked) => {
                            const currentValue = Array.isArray(formValues[sectionId]?.[fieldId])
                              ? formValues[sectionId]?.[fieldId]
                              : [];
                            const updatedValue = checked
                              ? [...currentValue, option]
                              : currentValue.filter((v) => v !== option);
                            handleInputChange(sectionId, fieldId, updatedValue);
                          }}
                        />
                        <Text className="ml-2 text-gray-700">{option}</Text>
                      </View>
                    ))}
                  </View>
                ) : field.type === "radio-group" ? (
                  <View>
                    {parseOptions(field.options).map((option, index) => (
                      <TouchableOpacity
                        key={index}
                        className="flex-row items-center mb-2"
                        onPress={() => handleInputChange(sectionId, fieldId, option)}
                      >
                        <View
                          className={`w-5 h-5 rounded-full border-2 ${
                            formValues[sectionId]?.[fieldId] === option ? "bg-blue-500 border-blue-500" : "border-gray-400"
                          }`}
                        />
                        <Text className="ml-2 text-gray-700">{option}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : field.type === "select" ? (
                  <View className="border p-2 rounded">
                    <TextInput
                      className="p-2"
                      value={formValues[sectionId]?.[fieldId] as string}
                      onFocus={() => {
                        // Optional: Open a picker here if desired
                      }}
                      onChangeText={(value) => handleInputChange(sectionId, fieldId, value)}
                      placeholder="Select an option"
                    />
                    {parseOptions(field.options).map((option, index) => (
                      <TouchableOpacity
                        key={index}
                        className="mt-1 p-2 bg-gray-100 rounded"
                        onPress={() => handleInputChange(sectionId, fieldId, option)}
                      >
                        <Text>{option}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <Text className="text-red-500">Unsupported field type: {field.type}</Text>
                )}
              </View>
            );
          })}

          {/* Submit Button Inside the Container */}
          <TouchableOpacity
            className="bg-blue-800 p-3 rounded mt-4"
            onPress={handleSubmit}
          >
            <Text className="text-white text-center font-semibold">Submit</Text>
          </TouchableOpacity>
        </View>
      );
    })
  ) : (
    <Text className="text-gray-700 text-center">No sections found in this form.</Text>
  )}

  <Modal visible={isModalOpen} transparent={true} animationType="slide">
    <View className="flex-1 justify-center items-center bg-gray-500 bg-opacity-50">
      <View className="bg-white p-6 rounded-lg">
        <Text className="text-green-500 text-lg font-bold mb-4">
          Form Submitted Successfully!
        </Text>
        <Button title="Close" onPress={closeModal} />
      </View>
    </View>
  </Modal>
</ScrollView>
  );
};

export default FormInputScreen;
