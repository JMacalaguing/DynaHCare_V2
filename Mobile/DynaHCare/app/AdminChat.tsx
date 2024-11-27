import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Message = {
  id: string;
  text: string;
  isUser: boolean; // Whether the message is from the user or admin
  time: string; // Time of the message
};

export const AdminChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello, how can I assist you today?",
      isUser: false,
      time: "10:00 AM",
    },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleSend = () => {
    if (newMessage.trim() === "") return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage,
      isUser: true,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);

    // Simulating admin's response (for demo purposes)
    setTimeout(() => {
      const adminResponse: Message = {
        id: Date.now().toString(),
        text: "Thanks for reaching out. I’ll get back to you shortly.",
        isUser: false,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prevMessages) => [...prevMessages, adminResponse]);
    }, 2000);

    setNewMessage("");
  };

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="flex-row items-center bg-blue-800 py-3 px-4 shadow-md">
        <Image
          source={require("../assets/images/logo2.png")} // Replace with admin logo
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
              item.isUser ? "items-end" : "items-start"
            } px-4 my-2`}
          >
            <View
              className={`max-w-3/4 px-4 py-3 rounded-lg ${
                item.isUser
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 text-gray-900"
              }`}
            >
              <Text className="text-sm">{item.text}</Text>
              <Text className="text-xs text-gray-600 mt-1">{item.time}</Text>
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
