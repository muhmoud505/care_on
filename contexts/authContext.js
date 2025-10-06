import { API_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  
  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error("Failed to load user from storage", error);
      }
    };

    // This promise ensures the splash screen is shown for at least 2 seconds.
    const minimumDisplayTime = new Promise(resolve => setTimeout(resolve, 2000));

    // Wait for both the user data to be loaded and the minimum time to pass.
    Promise.all([loadUserFromStorage(), minimumDisplayTime]).finally(() => {
      setIsLoading(false);
    });
  }, []);

  const login = async (userData) => {
    // In a real app, you would make an API call here with username/password
    // For this example, we'll just simulate a successful login.
    try {
      // Mock user data and token
      const loggedInUser = { ...userData, token: 'fake-jwt-token' };

      await AsyncStorage.setItem('user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
    } catch (error) {
      console.error("Login failed:", error);
      // You might want to throw the error to handle it in the UI
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const signup = async (userData) => {
    // userData is expected to be a FormData object
    setIsAuthLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/users`, {
        method: 'POST',
        body: userData,
      });

      // Read the response body as text ONCE.
      const responseText = await response.text();
      let data;
      try {
        // Try to parse the text as JSON.
        data = JSON.parse(responseText);
      } catch (e) {
        // If parsing fails, 'data' will be undefined.
        // This is fine if we don't expect a JSON body on error.
      }

      if (!response.ok) {
        // Use the parsed data if available, otherwise throw a generic error.
        const errorMessage = data?.message || `Server error: ${response.status}`;
        console.error("Signup failed with non-OK response:", responseText);
        throw new Error(errorMessage);
      }

      if (!data) {
        // This handles cases where the response is OK but the body is not valid JSON.
        throw new Error('Received an invalid or empty response from the server.');
      }
    } catch (error) {
      console.error("Signup failed:", error);
      throw error; // Re-throw to be handled by the UI component
    } finally {
      setIsAuthLoading(false);
    }
  };

  // The value provided to consuming components
  const value = {
    user,
    isAuthenticated: !!user, // Derived state
    isLoading,
    isAuthLoading,
    login,
    logout,
    signup,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Create the useAuth Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};