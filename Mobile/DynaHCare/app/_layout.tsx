import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import MainScreen from "./index";
import { LoginScreen } from "./LoginScreen"; // Import LoginScreen
import { SignUpScreen } from "./SignUpScreen"; // Import SignUpScreen
import "../global.css"; 
import { HomeScreen } from "./HomeScreen";
import { StatusBar, SafeAreaView } from "react-native";
import { FormDetailsScreen } from "./FormDetailsScreen";
import FormInputScreen from "./FormInputScreen";
import { LocalStorage } from "./LocalStorage";
import { Consultation } from "./Consultation";


const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
      {/* Ensure StatusBar is styled consistently across the app */}
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="FormDetails" component={FormDetailsScreen}/>
        <Stack.Screen name="FormInput" component={FormInputScreen}/>
        <Stack.Screen name="local" component={LocalStorage}/>
        <Stack.Screen name="Consult" component={Consultation}/>
      </Stack.Navigator>
    </SafeAreaView>
  );
}
