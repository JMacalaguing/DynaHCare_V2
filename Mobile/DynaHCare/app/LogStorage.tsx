import React, { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, View, FlatList, TouchableOpacity, Modal, Button } from 'react-native';
import { Header } from './Header';
import { loadAllData, deleteData } from './ConssultationDB'; // Import deleteData function
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons for delete icon
import config from './config';

export function LogStorage({ navigation }: { navigation: any }) {
  const [formData, setFormData] = useState<any[]>([]); // State to hold all form data
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Load all data from SQLite when the component is mounted
  useEffect(() => {
    loadAllData((data) => {
      setFormData(data); // Update state with all loaded data
    });
  }, []); // Empty dependency array ensures it runs once when the component is mounted

  // Function to handle item deletion
  const handleDelete = (id: number) => {
    deleteData(id); // Delete the data from SQLite
    setFormData((prevData) => prevData.filter((item) => item.id !== id)); // Remove the item from the state
  };

  const handleSubmitServer = async () => {
    try {
      // Ensure you have selected form data to send
      if (formData.length === 0) {
        console.log("No data to send to the server.");
        return;
      }
  
      // Construct the payload from selected form data
      // For example, assuming `formData` contains an array of form entries
      const dataToSend = formData.map((form: any) => {
        return { name: form.responseData.name, date: new Date(form.responseData.date).toISOString().split('T')[0] };
      });
  
      // Log the data to ensure it's formatted correctly
      console.log("Sending data to server:", JSON.stringify(dataToSend, null, 2));
  
      // Send the data to the server
      const apiUrl = `${config.BASE_URL}/api/logbook/`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });
  
      if (response.ok) {
        const jsonResponse = await response.json();
        console.log("Server response:", jsonResponse);
  
        // If the submission is successful, delete local data
        formData.forEach((form) => {
          deleteData(form.id);
        });
  
        // Clear local state after successful submission
        setFormData([]); 
  
        // Show success modal
        setIsSubmitModalOpen(true);
  
      } else {
        console.error("Failed to send data:", response.status);
        // Handle error (e.g., show error modal, etc.)
      }
    } catch (error) {
      console.error("Error sending data to server:", error);
      // Handle error (e.g., show error modal, etc.)
    }
  };
  

  const handleSubmit = () => {
    setIsConfirmationModalOpen(true);
  };

  const closeModal = () => {
    setIsSubmitModalOpen(false);
    setIsConfirmationModalOpen(false);
    navigation.navigate("local");
  };

  // Render each item in the FlatList
  const renderItem = ({ item }: { item: any }) => (
    <View className="p-4 mb-4 bg-white rounded-lg shadow flex-row items-center justify-between">
      <View style={{ flex: 1, marginRight: 10 }}>
        <Text className="text-sm font-mono text-gray-700">
          {JSON.stringify(item, null, 2)} {/* Render the data with 2-space indentation */}
        </Text>
      </View>
      <TouchableOpacity onPress={() => handleDelete(item.id)}>
        <Ionicons name="trash" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient
      colors={['#FFFFFF', '#BDE0FE']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      className="flex-1"
    >
      <Header title="Log Storage" navigation={navigation} />

      <FlatList
        data={formData}
        keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20 }}
        ListEmptyComponent={<Text className="text-base text-gray-500">No data found</Text>} // Show message if no data
      />

      {/* Submit Button */}
      <TouchableOpacity
        className="bg-[#040E46] m-4 p-3 rounded-3xl"
        onPress={handleSubmit} // Call handleSubmitServer without arguments
      >
        <Text className="text-white text-center text-xl font-extrabold">Send to Server</Text>
      </TouchableOpacity>

            {/* Modals */}
        <Modal visible={isConfirmationModalOpen} animationType="slide">
        <View className="flex-1 justify-center items-center bg-gray-500/50">
          <View className="bg-white p-6 rounded-lg mt-[-80]">
            <Text className="text-lg font-bold text-center mb-4">Are you sure you want to submit?</Text>
            <View className="flex-row justify-between ml-11 mr-11">
              <Button title="No" onPress={() => setIsConfirmationModalOpen(false)} />
              <Button title="Yes" onPress={handleSubmitServer}  />
            </View>
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
    </LinearGradient>
  );
}
