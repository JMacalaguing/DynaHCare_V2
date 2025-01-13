import React, { createContext, useState, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';


// Define the types for the context state
interface AuthContextType {
  isAuthenticated: boolean;
  userName: string | null;
  userToken: string | null;
  loading: boolean; 
  login: (token: string, userName: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Add loading state

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
    setLoading(false); 
  };

  React.useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = (token: string, name: string) => {
    setUserToken(token);
    setUserName(name);
    setIsAuthenticated(true);
    AsyncStorage.setItem('userToken', token);
    AsyncStorage.setItem('userName', name);
  };

  const logout = () => {
    setUserToken(null);
    setUserName(null);
    setIsAuthenticated(false);
    AsyncStorage.removeItem('userToken');
    AsyncStorage.removeItem('userName');
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userName,
        userToken,
        loading, 
        login,
        logout,
      }}
    >
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
