import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, Modal, TouchableOpacity, ScrollView } from "react-native";
import Checkbox from "expo-checkbox";
import { useRoute } from "@react-navigation/native";
import config from "./config";
import { Ionicons } from "@expo/vector-icons";
import { createTable, saveData } from './database'; // Import SQLite functions

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
  [sectionName: string]: {
    [fieldLabel: string]: string | string[];
  };
}

const FormInputScreen = ({ navigation }: { navigation: any }) => {
  const route = useRoute();
  const { formId } = route.params as { formId: string };
  const [formData, setFormData] = useState<FormData | null>(null);
  const [formValues, setFormValues] = useState<FormValues>({});
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSaveLocalModalOpen, setIsSaveLocalModalOpen] = useState(false);
  const [isSubmitlocalSuccessModalOpen, setIsSubmitlocalSuccessModalOpen] = useState(false);

  
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
        const sectionName = section.sectionname;
        initialValues[sectionName] = {};

        section.fields.forEach((field) => {
          const fieldLabel = field.label;
          initialValues[sectionName][fieldLabel] = field.type === "checkbox-group" ? [] : "";
        });
      });

      setFormValues(initialValues);
    }

    // Ensure the table is created when the component mounts
    createTable();
  }, [formData]);

  const handleInputChange = (sectionName: string, fieldLabel: string, value: string | string[]) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      [sectionName]: {
        ...prevValues[sectionName],
        [fieldLabel]: value !== undefined ? value : "",
      },
    }));
  };

  const parseOptions = (options: string | string[] | undefined): string[] => {
    if (!options) return [];
    if (Array.isArray(options)) return options;
    return options.split(",").map((opt) => opt.trim());
  };

  const handleSubmit = () => {
    // Validate the form to ensure all required fields are filled
    const hasEmptyFields = Object.values(formValues).some((section) => {
      return Object.values(section).some((fieldValue) => {
        // Check if field is empty
        if (typeof fieldValue === 'string') {
          return fieldValue.trim() === '';
        }
        if (Array.isArray(fieldValue)) {
          return fieldValue.length === 0;
        }
        return false;
      });
    });
  
    if (hasEmptyFields) {
      alert("Please fill in all required fields before submitting.");
    } else {
      setIsConfirmationModalOpen(true); // Open the confirmation modal if all fields are filled
    }
  };
  

  const SaveLocal = (confirmed: boolean) => {
    setIsConfirmationModalOpen(false); // Close the confirmation modal
    if (confirmed) {
      setIsSaveLocalModalOpen(true); // Open the "Save to Local" modal
    }
  };

  const handleSaveLocal = async () => {
    if (!formData) {
      console.error("Form data is not available.");
      return;
    }
  
    try {
      const dataToSave = {
        form: formId, // Form ID
        formTitle: formData.title, // Form title
        response_data: formValues, // Form values
      };
  
      console.log("Saving data locally:", JSON.stringify(dataToSave, null, 2));
  
      // Save to SQLite database
      await saveData(dataToSave); // Save data locally in SQLite
  
      setIsSaveLocalModalOpen(false);
      setIsSubmitlocalSuccessModalOpen(true); // Show submit success modal
    } catch (error) {
      console.error("Error saving data locally:", error);
    }
  };

  const handleConfirmSubmit = async (confirmed: boolean) => {
    setIsConfirmationModalOpen(false);
  
    if (confirmed) {
      // Proceed to send data to the server
      try {
        const dataToSend = { response_data: formValues };
        console.log("Data to send:", JSON.stringify(dataToSend, null, 2));
  
        // Send to the server
        const response = await fetch(`${config.BASE_URL}/formbuilder/api/forms/${formId}/submit/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSend),
        });
  
        if (!response.ok) {
          throw new Error("Failed to submit form.");
        }
  
        const responseData = await response.json();
        console.log("Form submitted successfully to server:", responseData);
        setIsSubmitModalOpen(true);
      } catch (error) {
        console.error("Error submitting form:", error);
      }
    }
  };
  

  const closeModal = () => {
    setIsSubmitModalOpen(false);
    navigation.navigate("Home");
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
          <Ionicons name="arrow-back-outline" size={28} color="#040E46" />
        </TouchableOpacity>
        <Text className="text-2xl font-extrabold text-blue-900 ml-3 flex-1">
          {formData.title}
        </Text>
      </View>

      {/* Form Sections */}
      {formData.schema && typeof formData.schema === "object" && "sections" in formData.schema ? (
        formData.schema.sections.map((section: Section) => {
          const sectionName = section.sectionname;
          return (
            <View key={sectionName} className="bg-white shadow-md rounded-lg m-4 p-4">
              <View className="bg-[#050f49] m-[-15] p-2 mb-2 rounded-xl">
                <Text className="text-xl font-bold mb-2 text-white ml-3">
                  {sectionName}
                </Text>
              </View>
              {section.fields.map((field: Field) => {
                const fieldLabel = field.label;
                return (
                  <View key={fieldLabel} className="mb-3">
                    <Text className="text-base font-bold mb-1 text-[#050f49]">
                      {fieldLabel}
                    </Text>
                    {field.type === "text" || field.type === "number" || field.type === "email" || field.type === "date" ? (
                      <TextInput
                        className="border-2 border-blue-200 p-3 rounded-xl"
                        keyboardType={field.type === "number" ? "numeric" : "default"}
                        value={
                          Array.isArray(formValues[sectionName]?.[fieldLabel])
                            ? formValues[sectionName]?.[fieldLabel].join(", ")
                            : formValues[sectionName]?.[fieldLabel] || ""
                        }
                        onChangeText={(value) => handleInputChange(sectionName, fieldLabel, value)}
                      />
                    ) : field.type === "checkbox-group" ? (
                      <View>
                        {parseOptions(field.options).map((option, index) => (
                          <View key={index} className="flex-row items-center mb-2">
                            <Checkbox
                              value={formValues[sectionName]?.[fieldLabel]?.includes(option) || false}
                              onValueChange={(checked) => {
                                const currentValue = Array.isArray(formValues[sectionName]?.[fieldLabel])
                                  ? formValues[sectionName]?.[fieldLabel]
                                  : [];
                                const updatedValue = checked
                                  ? [...currentValue, option]
                                  : currentValue.filter((v) => v !== option);
                                handleInputChange(sectionName, fieldLabel, updatedValue);
                              }}
                            />
                            <Text className="ml-2">{option}</Text>
                          </View>
                        ))}
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
          );
        })
      ) : (
        <Text className="text-lg font-semibold text-center mt-4">No sections found for this form.</Text>
      )}

        {/* Submit Button */}
      <TouchableOpacity className="bg-[#040E46] m-4 p-3 rounded-3xl" onPress={handleSubmit}>
              <Text className="text-white text-center text-xl font-extrabold">Submit</Text>
            </TouchableOpacity>

      {/* Modals */}
      <Modal visible={isConfirmationModalOpen} animationType="slide">
        <View className="flex-1 justify-center items-center bg-gray-500/50">
          <View className="bg-white p-6 rounded-lg mt-[-80]">
            <Text className="text-lg font-bold text-center mb-4">Are you sure you want to submit?</Text>
            <View className="flex-row justify-between ml-11 mr-11">
              <Button title="No" onPress={() => setIsConfirmationModalOpen(false)} />
              <Button title="Yes" onPress={() => SaveLocal(true) }  />
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={isSaveLocalModalOpen} transparent={true} animationType="slide">
      <View className="flex-1 justify-center items-center bg-gray-500/60">
        <View className="bg-white p-8 rounded-lg shadow-lg w-[85%] mt-[-90]">
          {/* Modal Header */}
          <Text className="text-xl font-semibold text-center mb-4">
            Choose Your Save Option
          </Text>
          
          {/* Modal Buttons */}
          <View className="flex-row justify-evenly">
            {/* Local Storage Button */}
            <TouchableOpacity
              onPress={handleSaveLocal}
              className="flex-row items-center bg-blue-600 p-4 rounded-lg shadow-md w-37 justify-center"
            >
              <Ionicons name="save" size={27} color="white" />
              <Text className="text-white ml-2 font-semibold">Local</Text>
            </TouchableOpacity>

            {/* Server Button */}
            <TouchableOpacity
              onPress={() => handleConfirmSubmit(true)}
              className="flex-row items-center bg-green-600 p-4 rounded-lg shadow-md w-37 justify-center"
            >
              <Ionicons name="cloud-upload-outline" size={27} color="white" />
              <Text className="text-white ml-2 font-semibold">Server</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>

                {/* Submit Success Modal local storage */}
          <Modal visible={isSubmitlocalSuccessModalOpen} animationType="slide">
          <View className="flex-1 justify-center items-center bg-gray-500/50 mt-[-90]">
            <View className="bg-white p-6 rounded-lg w-90">
            <Ionicons name="checkmark-circle" size={50} color="green" className="text-center mb-4" />
              <Text className="text-lg font-bold text-center mb-4">Form submitted successfully to Local Storage!</Text>
              {/* Green check icon */}
              <Button title="Close" onPress={closeModal} />
            </View>
          </View>
        </Modal>

        {/* Submit Success Modal */}
        <Modal visible={isSubmitModalOpen} animationType="slide">
          <View className="flex-1 justify-center items-center bg-gray-500/50 mt-[-90]">
            <View className="bg-white p-6 rounded-lg w-90">
            <Ionicons name="checkmark-circle" size={50} color="green" className="text-center mb-4" />
              <Text className="text-lg font-bold text-center mb-4">Form submitted successfully to server!</Text>
              {/* Green check icon */}
              <Button title="Close" onPress={closeModal} />
            </View>
          </View>
        </Modal>
    </ScrollView>
  );
};

export default FormInputScreen;
