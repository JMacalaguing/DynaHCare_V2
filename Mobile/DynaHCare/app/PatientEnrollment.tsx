import React, { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { View, Text, TextInput, TouchableOpacity, Modal, Alert, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { Header } from './Header3';
import { createTable, saveData } from './ConssultationDB';  // Import the database functions
import config from './config';

export function PatientEnrollment({ navigation }: { navigation: any }) {
  const [name, setName] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isConfirmationModalVisible, setIsConfirmationModalVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [isSaveLocalModalOpen, setIsSaveLocalModalOpen] = useState(false);

  // Function to reset the form fields
  const resetForm = () => {
    setName('');
    setDate(null);
  };

  // Function to handle submission to the server
  const handleSubmitToServer = async () => {
    setIsSaveLocalModalOpen(false)
    const apiUrl = `${config.BASE_URL}/api/logbook/`;
    const payload = { name, date: date?.toISOString().split('T')[0] };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setIsSuccessModalVisible(true); // Show success modal
        setIsConfirmationModalVisible(false); // Hide confirmation modal
        resetForm(); // Reset the form fields after successful submission
      } else {
        Alert.alert('Error', 'Failed to submit data to the server');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong while submitting');
      console.error(error);
    }
  };
  // Function to handle saving data locally
  const saveLocal = () => {
    if (!name || !date) {
      Alert.alert('Error', 'Please fill in both name and date');
      return;
    }

    const formData = { name, date: date.toISOString() };
    
    // Save the form data to the local SQLite database
    saveData(formData);
    setIsSaveLocalModalOpen(false);  // Close the modal after saving
    resetForm();  // Reset form after saving
    Alert.alert('Success', 'Data saved locally');
    setIsConfirmationModalVisible(false);
  };

  // Function to handle date change
  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false); // Close the date picker
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  // Initialize the database when the component mounts
  useEffect(() => {
    createTable();  // Create the table on mount
  }, []);

  return (
    <LinearGradient
      colors={['#FFFFFF', '#BDE0FE']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      className="flex-1"
    >
      <Header title="Patient Enrollment Record" navigation={navigation} />

      <View className="flex-1 items-center justify-center px-4 mt-[-300]">
        <View className="bg-white w-full rounded-lg shadow-lg p-6">
          <Text className="text-xl font-bold text-white bg-[#040E46] p-3 rounded-t-lg">Patient Information</Text>
          <View className="p-4">
            <Text className="text-base font-medium text-gray-700 mb-2">Name of the Patient</Text>
            <TextInput
              className="w-full p-3 border border-gray-300 rounded-md"
              placeholder="Enter name"
              value={name}
              onChangeText={setName}
            />

            <Text className="text-base font-medium text-gray-700 mt-4 mb-2">Date</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="w-full p-3 border border-gray-300 rounded-md bg-white"
            >
              <Text className="text-gray-500">
                {date ? date.toDateString() : 'Select date'}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={date || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onChangeDate}
              />
            )}
          </View>
        </View>

        <TouchableOpacity
          onPress={() => setIsConfirmationModalVisible(true)}
          className="bg-[#040E46] mt-6 py-3 px-6 rounded-lg"
        >
          <Text className="text-white text-lg font-medium">Submit</Text>
        </TouchableOpacity>
      </View>

      {/* Confirmation Modal */}
      <Modal transparent={true} visible={isConfirmationModalVisible} animationType="fade">
        <View className="flex-1 justify-center items-center bg-gray-500/60 mt-[-150]">
          <View className="bg-white p-6 rounded-lg shadow-lg">
            <Text className="text-lg font-semibold text-gray-800 mb-4">Are you sure you want to submit it?</Text>
            <View className="flex-row justify-center">
              <TouchableOpacity
                onPress={() => setIsConfirmationModalVisible(false)}
                className="bg-red-500 py-2 px-4 rounded-md mr-2"
              >
                <Text className="text-white">No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsSaveLocalModalOpen(true)}  // Open the save modal
                className="bg-green-500 py-2 px-4 rounded-md"
              >
                <Text className="text-white">Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Save Local Modal */}
      <Modal visible={isSaveLocalModalOpen} transparent={true} animationType="slide">
        <View className="flex-1 justify-center items-center bg-gray-500/60">
          <View className="bg-white p-8 rounded-lg shadow-lg w-[85%] mt-[-90]">
            <Text className="text-xl font-semibold text-center mb-4">Choose Your Save Option</Text>
            <View className="flex-row justify-evenly">
              <TouchableOpacity
                onPress={saveLocal}
                className="flex-row items-center bg-blue-600 p-4 rounded-lg shadow-md w-37 justify-center"
              >
                <Ionicons name="save" size={27} color="white" />
                <Text className="text-white ml-2 font-semibold">Local</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSubmitToServer}
                className="flex-row items-center bg-green-600 p-4 rounded-lg shadow-md w-37 justify-center"
              >
                <Ionicons name="cloud-upload-outline" size={27} color="white" />
                <Text className="text-white ml-2 font-semibold">Server</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal transparent={true} visible={isSuccessModalVisible} animationType="fade">
        <View className="flex-1 justify-center items-center bg-gray-500/50">
          <View className="bg-white p-6 rounded-lg shadow-lg">
            <Text className="text-lg font-semibold text-gray-800 mb-4">Successfully Submitted!</Text>
            <TouchableOpacity
              onPress={() => setIsSuccessModalVisible(false)}
              className="bg-blue-500 py-2 px-4 rounded-md"
            >
              <Text className="text-white">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}
