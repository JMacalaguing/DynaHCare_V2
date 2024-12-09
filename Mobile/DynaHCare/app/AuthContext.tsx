import React, { createContext, useState, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the types for the context state
interface AuthContextType {
  isAuthenticated: boolean;
  userName: string | null;
  userToken: string | null;
  login: (token: string, userName: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);

  // Check if the user is authenticated from AsyncStorage
  const checkAuthStatus = async () => {
    const token = await AsyncStorage.getItem('userToken');
    const name = await AsyncStorage.getItem('userName');
    
    if (token && name) {
      setIsAuthenticated(true);
      setUserName(name);
      setUserToken(token);
    } else {
      setIsAuthenticated(false);
    }
  };

  // Login function to update the authentication state
  const login = (token: string, name: string) => {
    setUserToken(token);
    setUserName(name);
    setIsAuthenticated(true);
    
    // Save to AsyncStorage
    AsyncStorage.setItem('userToken', token);
    AsyncStorage.setItem('userName', name);
  };

  // Logout function to clear the authentication state
  const logout = () => {
    setUserToken(null);
    setUserName(null);
    setIsAuthenticated(false);

    // Remove from AsyncStorage
    AsyncStorage.removeItem('userToken');
    AsyncStorage.removeItem('userName');
  };

  // Initialize the authentication status when the provider is mounted
  React.useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, userName, userToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use AuthContext in other components
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
};
