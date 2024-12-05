import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage"; // For accessing AsyncStorage

const API_URL = "http://127.0.0.1:8000/api/chat/";

type Message = {
  id: string;
  sender: string; // 'user' or 'admin'
  name: string; // User's name
  message: string;
  timestamp: string; // Time of the message
};

export const AdminChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [userName, setUserName] = useState(""); // State to store the user's name

  // Fetch the user's name from AsyncStorage
  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const storedUserName = await AsyncStorage.getItem("userName");
        if (storedUserName) {
          setUserName(storedUserName); // Set the user's name
        }
      } catch (error) {
        console.error("Error fetching user name:", error);
      }
    };

    fetchUserName();

    // Fetch chat messages from the backend
    const fetchMessages = async () => {
      try {
        const response = await axios.get(API_URL);
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, []);

  // Handle sending a new message
  const handleSend = async () => {
    if (newMessage.trim() === "") return;

    const adminMessage = {
      sender: "admin3",
      name: userName, // Include user's name
      message: newMessage,
    };

    try {
      const response = await axios.post(API_URL, adminMessage);
      setMessages((prevMessages) => [...prevMessages, response.data]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="flex-row items-center bg-blue-800 py-3 px-4 shadow-md">
        <Image
          source={require("../assets/images/logo2.png")}
          style={{ width: 40, height: 40, borderRadius: 20 }}
        />
        <Text className="ml-4 text-white text-xl font-bold">Admin</Text>
      </View>

      {/* Messages List */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            className={`flex ${
              item.sender === "user" ? "items-end" : "items-start"
            } px-4 my-2`}
          >
            <View
              className={`max-w-3/4 px-4 py-3 rounded-lg ${
                item.sender === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 text-gray-900"
              }`}
            >
              <Text className="text-sm">{item.message}</Text>
              <Text className="text-xs text-gray-600 mt-1">{item.timestamp}</Text>
              {item.sender === "user" && (
                <Text className="text-xs text-gray-600 mt-1">- {item.name}</Text> 
              )}
            </View>
          </View>
        )}
      />

      {/* Message Input */}
      <View className="flex-row items-center bg-white px-4 py-3 shadow-md">
        <TextInput
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message"
          placeholderTextColor="#aaa"
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-gray-900"
        />
        <TouchableOpacity
          onPress={handleSend}
          className="ml-3 bg-blue-800 p-3 rounded-full"
        >
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
