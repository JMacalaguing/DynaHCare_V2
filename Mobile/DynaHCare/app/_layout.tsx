import React from "react";
import { ActivityIndicator, SafeAreaView, StatusBar } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import MainScreen from "./index";
import "../global.css"; 
import { LoginScreen } from "./LoginScreen";
import { SignUpScreen } from "./SignUpScreen";
import { HomeScreen } from "./HomeScreen";
import { FormDetailsScreen } from "./FormDetailsScreen";
import  FormInputScreen  from "./FormInputScreen";
import { LocalStorage } from "./LocalStorage";
import { Consultation } from "./Consultation";
import { AuthProvider, useAuth } from "./AuthContext"; 
import { LogStorage } from "./LogStorage";
import ForgotPassword from "./ForgotPassword";


const Stack = createStackNavigator();

function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="FormDetails" component={FormDetailsScreen} />
            <Stack.Screen name="FormInput" component={FormInputScreen} />
            <Stack.Screen name="local" component={LocalStorage} />
            <Stack.Screen name="Consult" component={Consultation} />
            <Stack.Screen name="Log" component={LogStorage} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
          </>
        )}
      </Stack.Navigator>
    </SafeAreaView>
  );
}


export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
